"use server";

import { db } from "@/lib/prisma";
import { TransactionTypeEnum } from "@/lib/type";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getCurrentBudget(accountId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    const budget = await db.budget.findFirst({ where: { userId: user.id } });
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );

    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const expenses = await db.transaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        createdAt: { gte: startOfMonth, lt: endOfMonth },
        type: TransactionTypeEnum.EXPENSE,
        userId: user.id,
        accountId,
      },
    });

    return {
      budget: budget ? { ...budget, amount: budget.amount.toNumber() } : null,
      currentExpenses: expenses._sum.amount
        ? expenses._sum.amount.toNumber()
        : 0,
    };
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
}

export async function updateBudget(amount: number) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    let budget = await db.budget.findFirst({ where: { userId: user.id } });
    if (budget) {
      await db.budget.update({ where: { id: budget.id }, data: { amount } });
    } else {
      budget = await db.budget.create({ data: { userId: user.id, amount } });
    }

    revalidatePath("/dashboard");
    return {
      success: true,
      budget: { ...budget, amount: budget.amount.toNumber() },
    };
  } catch (error) {
    throw new Error(error);
  }
}
