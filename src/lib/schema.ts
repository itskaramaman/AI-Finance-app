import { z } from "zod";
import {
  AccountTypeEnum,
  RecurringIntervalEnum,
  TransactionTypeEnum,
} from "./type";

export const accountFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  balance: z.string().min(1, "Balance is required"),
  isDefault: z.boolean().default(false),
  type: z.nativeEnum(AccountTypeEnum),
});

export type AccountFormType = z.infer<typeof accountFormSchema>;

export const addTransactionFormSchema = z.object({
  type: z.nativeEnum(TransactionTypeEnum),
  amount: z.number().min(1, "Amount is required"),
  accountId: z.string().min(1, "Account is required"),
  category: z.string().min(1, "Account is required"),
  date: z.date(),
  description: z.string().optional(),
  isRecurring: z.boolean().optional().default(false),
  recurringInterval: z.nativeEnum(RecurringIntervalEnum).nullable().optional(),
});
