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

    return { success: true, data };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Error while sending email." };
  }
}
