import { z } from "zod";
import { AccountTypeEnum } from "./type";

export const accountFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  balance: z.string().min(1, "Balance is required"),
  isDefault: z.boolean().default(false),
  type: z.nativeEnum(AccountTypeEnum),
});

export type AccountFormType = z.infer<typeof accountFormSchema>;
