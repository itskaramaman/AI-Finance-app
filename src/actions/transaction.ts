"use server";

import { db } from "@/lib/prisma";
import serializeObject from "@/lib/serialize";
import {
  TransactionTypeEnum,
  CreateTransactionType,
  RecurringIntervalEnum,
  TransactionType,
} from "@/lib/type";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { request } from "@arcjet/next";
import aj from "@/lib/arcjet";
import genAI from "@/lib/gemini";

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
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unknown error occured while createTransaction");
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

export async function scanReceipt(file: File) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    // Convert ArrayBuffer to Base64
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If its not a recipt, return an empty object`;

    const result = await model.generateContent([
      { inlineData: { data: base64String, mimeType: file.type } },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const data = JSON.parse(cleanedText);
      return {
        amount: parseFloat(data.amount),
        date: new Date(data.date),
        description: data.description,
        category: data.category,
        merchantName: data.merchantName,
      };
    } catch (error) {
      console.error("Error parsing JSON response: ", error);
      throw new Error("Invalid response format from Gemini");
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unknown error occured while scanReceipt");
  }
}

export async function getTransactionById(id: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    const transaction = await db.transaction.findUnique({
      where: { id: id, userId: user.id },
    });

    if (!transaction) throw new Error("Transaction not found");

    return serializeObject(transaction);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Error while getting transaction by Id");
  }
}

export async function updateTransaction(
  id: string,
  data: Partial<TransactionType>
) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    // Get original transaction to calculate balance change
    const transaction = await db.transaction.findUnique({
      where: { id: id, userId: user.id },
      include: {
        account: true,
      },
    });

    if (!transaction) throw new Error("Transaction not found");

    let newBalance = transaction.account.balance.toNumber();
    if (data.type && data.amount) {
      if (data.type === TransactionTypeEnum.INCOME) {
        newBalance = newBalance - transaction.amount.toNumber() + data.amount;
      } else {
        newBalance = newBalance - transaction.amount.toNumber() - data.amount;
      }
    }

    console.log(newBalance, transaction.account.balance);

    const updatedTransaction = await db.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: { id: id, userId: user.id },
        data: {
          ...data,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval && data.date
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });
      await tx.account.update({
        where: { id: transaction.accountId },
        data: { balance: newBalance },
      });

      return updated;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);

    return { success: true, data: serializeObject(updatedTransaction) };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Error while updating transaction");
  }
}
