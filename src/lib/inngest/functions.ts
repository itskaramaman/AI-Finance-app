import { inngest } from "./client";
import { db } from "../prisma";
import { TransactionType, TransactionTypeEnum } from "../type";
import { sendEmail } from "@/actions/send-email";
import Email from "../../../emails/template";

export const checkBudgetAlert = inngest.createFunction(
  { id: "Check Budget Alerts" },
  { cron: "0 */6 * * *" },
  async ({ step }) => {
    const budgets = await step.run("fetch-budget", async () => {
      return await db.budget.findMany({
        include: {
          user: { include: { accounts: { where: { isDefault: true } } } },
        },
      });
    });

    for (const budget of budgets) {
      const defaultAccount = budget.user.accounts[0];
      if (!defaultAccount) continue;

      await step.run(`check budget ${budget.id}`, async () => {
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
          where: {
            userId: budget.userId,
            accountId: defaultAccount.id,
            type: TransactionTypeEnum.EXPENSE,
            date: { gte: startOfMonth, lte: endOfMonth },
          },
          _sum: { amount: true },
        });

        const totalExpenses = expenses._sum.amount?.toNumber() || 0;
        const budgetAmount = parseFloat(budget.amount);
        const percentageUsed = (totalExpenses / budgetAmount) * 100;

        if (
          percentageUsed >= 80 &&
          (!budget.lastAlertSent ||
            isNewMonth(new Date(budget.lastAlertSent), new Date()))
        ) {
          // Send Email
          await sendEmail({
            to: "singhkaramjeetapple@gmail.com",
            subject: `Budget alert for ${defaultAccount.name}`,
            react: Email({
              username: budget.user.name || "",
              type: "budget-alert",
              data: {
                percentageUsed,
                budgetAmount: budgetAmount.toFixed(1),
                totalExpense: totalExpenses.toFixed(1),
                accountName: defaultAccount.name,
              },
            }),
          });

          // Last Alert Sent
          await db.budget.update({
            where: { id: budget.id },
            data: { lastAlertSent: new Date() },
          });
        }
      });
    }
  }
);

function isNewMonth(lastAlertDate: Date, currentDate: Date) {
  return (
    lastAlertDate.getMonth() !== currentDate.getMonth() ||
    lastAlertDate.getFullYear() !== currentDate.getFullYear()
  );
}

export const triggerRecurringTransactions = inngest.createFunction(
  {
    id: "trigger-ruccuring-transactions",
    name: "Trigger Recurring Transactions",
  },
  { cron: "0 0 * * *" },
  async ({ step }) => {
    // 1. Fetch all recurring transactions
    const recurringTransaction = await step.run(
      "fetch-recurring-transactions",
      async () => {
        return await db.transaction.findMany({
          where: {
            isRecurring: true,
            status: "COMPLETED",
            OR: [
              { lastProcessed: null }, // Never processed
              { nextRecurringDate: { lte: new Date() } }, // Due date passed
            ],
          },
        });
      }
    );

    // 2 Create events for each transaction
    if (recurringTransaction.length > 0) {
      const events = recurringTransaction.map((transaction) => ({
        name: "transaction.recurring.process",
        data: { transactionId: transaction.id, userId: transaction.userId },
      }));

      // 3. Send events to be processed
      await inngest.send(events);
    }

    return { triggered: recurringTransaction.length };
  }
);

export const processRecurringTransactions = inngest.createFunction(
  {
    id: "process-recurring-transaction",
    throttle: {
      limit: 10,
      period: "1m",
      key: "event.data.userId",
    },
  },
  { event: "transaction.recurring.process" },
  async ({ event, step }) => {
    if (!event?.data?.transactionId || !event?.data?.userId) {
      console.error("Invalid event data:", event);
      return { error: "Missing required event data" };
    }

    await step.run("process-transaction", async () => {
      const transaction = await db.transaction.findUnique({
        where: {
          id: event.data.transactionId,
          userId: event.data.userId,
        },
        include: {
          account: true,
        },
      });

      if (!transaction || isTransactionDue(transaction)) return;

      await db.$transaction(async (tx) => {
        await tx.transaction.create({
          data: {
            type: transaction.type,
            amount: transaction.amount,
            description: `${transaction.description} (Recurring)`,
            date: new Date(),
            category: transaction.category,
            userId: transaction.userId,
            accountId: transaction.accountId,
            isRecurring: false,
          },
        });

        // Update account balance
        const balanceChange =
          transaction.type === "EXPENSE"
            ? -transaction.amount.toNumber()
            : transaction.amount.toNumber();

        await tx.account.update({
          where: { id: transaction.accountId },
          data: { balance: { increment: balanceChange } },
        });

        // Update last processed date and next recurring date
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            lastProcessed: new Date(),
            nextRecurringDate: calculateNextRecurringDate(
              new Date(),
              transaction.recurringInterval
            ),
          },
        });
      });
    });
  }
);

function isTransactionDue(transaction) {
  if (!transaction.lastProcessed) return true;

  const today = new Date();
  const nextDue = new Date(transaction.nextRecurringDate);
  return nextDue <= today;
}

function calculateNextRecurringDate(date, interval) {
  const next = new Date(date);
  switch (interval) {
    case "DAILY":
      next.setDate(next.getDate() + 1);
      break;
    case "WEEKLY":
      next.setDate(next.getDate() + 7);
      break;
    case "MONTHLY":
      next.setMonth(next.getMonth() + 1);
      break;
    case "YEARLY":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
}
