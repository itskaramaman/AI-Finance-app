import { TransactionTypeEnum } from "@/lib/type";
import { boolean, number } from "zod";
export enum AccountTypeEnum {
  SAVINGS = "SAVINGS",
  CURRENT = "CURRENT",
}

export enum TransactionTypeEnum {
  EXPENSE = "EXPENSE",
  INCOME = "INCOME",
}

export enum RecurringIntervalEnum {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

export enum TransactionStatusEnum {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export type TransactionTypeBase = {
  id: string;
  type: TransactionTypeEnum;
  amount: number;
  description: string;
  date: Date;
  category: string;
  receiptUrl?: string;
  isRecurring: boolean;
  status: TransactionStatusEnum;
  userId: string;
  accountId: string;
  createdAt: Date;
  updatedAt: Date;
  balance: number;
};

export type TransactionType = TransactionTypeBase &
  (TransactionTypeBase["isRecurring"] extends true
    ? {
        recurringInterval: RecurringIntervalEnum;
        nextRecurringDate: Date | string;
        lastProcessed: Date;
      }
    : null);

export type CreateTransactionType = Omit<
  TransactionType,
  "id" | "userId" | "nextRecurringDate" | "lastProcessed" | "status"
>;

export type AccountType = {
  id: string;
  name: string;
  type: TransactionTypeEnum;
  balance: number;
  isDefault: boolean;
  userId: string;
  transactions: TransactionType[];
  createdAt: Date;
  updatedAt: Date;
};
