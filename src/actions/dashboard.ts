"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { AccountTypeEnum } from "@/lib/type";
import { revalidatePath } from "next/cache";
import serializeObject from "@/lib/serialize";

type CreateAccountDataType = {
  name: string;
  type: AccountTypeEnum;
  balance: string;
  isDefault?: boolean;
};

export async function createAccount(accountData: CreateAccountDataType) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      include: { accounts: true },
    });
    if (!user) throw new Error("User not found");

    const balanceFloat = parseFloat(accountData.balance);
    if (isNaN(balanceFloat)) throw new Error("Invalid balance amount");

    let isDefault = false;
    if (user.accounts.length === 0) {
      isDefault = true;
    } else if ("isDefault" in accountData && accountData.isDefault === true) {
      isDefault = true;
    }

    if (isDefault) {
      await db.account.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const account = await db.account.create({
      data: {
        name: accountData.name,
        type: accountData.type,
        balance: parseFloat(accountData.balance),
        isDefault: isDefault,
        userId: user.id,
      },
    });

    console.log(account);
    const serializedAccount = serializeObject(account);

    revalidatePath("/dashboard");
    console.log(serializedAccount);
    return { success: true, data: serializedAccount };
  } catch (error) {
    throw new Error(error.message);
  }
}
