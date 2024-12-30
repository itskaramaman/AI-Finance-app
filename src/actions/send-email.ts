"use server";

import { Resend } from "resend";
import React from "react";

type SendEmail = {
  to: string;
  subject: string;
  react: React.ReactNode;
};
export async function sendEmail({ to, subject, react }: SendEmail) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY || "");
    const data = await resend.emails.send({
      from: "Finance App <onboarding@resend.dev>",
      to,
      subject,
      react,
    });

    console.log(data);

    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
}
