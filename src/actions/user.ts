"use server";

import { db } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function checkUser() {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) return;

    const user = await db.user.findUnique({
      where: { clerkUserId: clerkUser.id },
    });
    if (user) return;

    await db.user.create({
      data: {
        clerkUserId: clerkUser.id,
        name: clerkUser.fullName,
        email: clerkUser.emailAddresses.at(0)?.emailAddress as string,
        imageUrl: clerkUser.imageUrl,
      },
    });
  } catch (error) {
    console.error("Something went wrong while checkUser in DB", error);
  }
}
