"use server";

import { db } from "@/lib/prisma";
import serializeObject from "@/lib/serialize";
import {
  TransactionTypeEnum,
  CreateTransactionType,
  RecurringIntervalEnum,
} from "@/lib/type";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { request } from "@arcjet/next";
import aj from "@/lib/arcjet";

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

export async function createTransaction({
  type,
  amount,
  description,
  date,
  category,
  receiptUrl,
  isRecurring,
  recurringInterval,
  accountId,
}: CreateTransactionType) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const req = await request();
    const decision = await aj.protect(req, {
      userId,
      requested: 1,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        throw new Error("Too many requests. Please try again later.");
      }

      throw new Error("Request Blocked");
    }

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    const account = await db.account.findUnique({
      where: { id: accountId, userId: user.id },
    });

    if (!account) throw new Error("Account Not Found");

    const balanceChange =
      type === TransactionTypeEnum.EXPENSE ? -amount : amount;
    const newbalance = account.balance.toNumber() + balanceChange;

    const prismaTransaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          userId: user.id,
          date,
          amount,
          accountId,
          description,
          type,
          category,
          isRecurring,
          receiptUrl,
          recurringInterval,
          nextRecurringDate:
            isRecurring && recurringInterval
              ? calculateNextRecurringDate(date, recurringInterval)
              : null,
        },
      });

      await tx.account.update({
        where: { id: accountId, userId: user.id },
        data: { balance: newbalance },
      });

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${accountId}`);

    return { success: true, data: serializeObject(prismaTransaction) };
  } catch (error) {
    throw new Error(error);
  }
}

function calculateNextRecurringDate(
  startDate: Date,
  interval: RecurringIntervalEnum
) {
  const date = new Date(startDate);
  switch (interval) {
    case RecurringIntervalEnum.DAILY:
      date.setDate(date.getDate() + 1);
      break;
    case RecurringIntervalEnum.WEEKLY:
      date.setDate(date.getDate() + 7);
      break;
    case RecurringIntervalEnum.MONTHLY:
      date.setDate(date.getMonth() + 1);
      break;
    case RecurringIntervalEnum.YEARLY:
      date.setDate(date.getFullYear() + 1);
      break;
    default:
      break;
  }

  return date;
}
