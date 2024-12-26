"use server";

import { db } from "@/lib/prisma";
import { TransactionTypeEnum } from "@/lib/type";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function bulkDeleteTransactions(ids: string[]) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    const transactions = await db.transaction.findMany({
      where: { id: { in: ids }, userId: user.id },
    });

    const accountId = transactions[0].accountId;

    const accountBalanceChanges = transactions.reduce((acc, transaction) => {
      const change =
        transaction.type === TransactionTypeEnum.EXPENSE
          ? transaction.amount.toNumber()
          : -transaction.amount.toNumber();

      return acc + change;
    }, 0);

    // Delete transactions and update balances in transactions
    await db.$transaction(async (tx) => {
      await tx.transaction.deleteMany({
        where: { id: { in: ids }, userId: user.id },
      });

      await tx.account.update({
        where: { id: accountId },
        data: { balance: { increment: accountBalanceChanges } },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${accountId}`);

    return { success: "true" };
  } catch (error) {
    console.error(error);
    return { success: "false" };
  }
}
