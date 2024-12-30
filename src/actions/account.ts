"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import serializeObject from "@/lib/serialize";
import { TransactionType } from "@/lib/type";

export async function getUserAccounts() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const accounts = await db.account.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { transactions: true } } },
    });

    const serializedAccounts = accounts.map((account) =>
      serializeObject(account)
    );
    return serializedAccounts;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unknown error occured while getUserAccounts");
  }
}

export async function updateDefaultAccount(accountId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      include: { accounts: true },
    });
    if (!user) throw new Error("User not found");

    await db.account.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    });
    const account = await db.account.update({
      where: { id: accountId },
      data: { isDefault: true },
    });

    const serializedAccount = serializeObject(account);

    revalidatePath("/dashboard");

    return { success: true, data: serializedAccount };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unknown error occured while updateDefaultAccount");
  }
}

export async function getAccountDetailsById(accountId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      include: { accounts: true },
    });
    if (!user) throw new Error("User not found");

    const account = await db.account.findUnique({
      where: { id: accountId, userId: user.id },
      include: {
        transactions: { orderBy: { createdAt: "desc" } },
        _count: { select: { transactions: true } },
      },
    });
    if (!account) throw new Error("Account not found");

    const serializedAccount = serializeObject(account);
    const serializedTransactions: TransactionType[] = account.transactions.map(
      (transaction) => serializeObject(transaction)
    );
    return { account: serializedAccount, transactions: serializedTransactions };
  } catch (error) {
    console.log(error);
    return null;
  }
}
