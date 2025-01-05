"use client";

import { useState } from "react";
import { AccountType, TransactionType, TransactionTypeEnum } from "@/lib/type";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import TransactionsChart from "./TransactionsChart";

const DashboardOverview = ({
  accounts,
  transactions,
}: {
  accounts: AccountType[];
  transactions: TransactionType[];
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts.find((a) => a.isDefault)?.id || accounts[0]?.id
  );

  const accountTransactions = transactions.filter(
    (transaction) => transaction.accountId === selectedAccountId
  );

  const recentTransactions = accountTransactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-normal">
            Recent Transactions
          </CardTitle>
          <Select
            value={selectedAccountId}
            onValueChange={setSelectedAccountId}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No recent Transactions
            </p>
          ) : (
            recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between "
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {transaction.description || "Untitled Transaction"}
                  </p>
                  <p className="text-sm font-medium leading-none">
                    {format(new Date(transaction.date), "PP")}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex items-center",
                      transaction.type === TransactionTypeEnum.EXPENSE
                        ? "text-red-500"
                        : "text-green-500"
                    )}
                  >
                    {transaction.type === TransactionTypeEnum.EXPENSE ? (
                      <ArrowDownRight className="mr-1 h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="mr-1 h-4 w-4" />
                    )}
                    ${transaction.amount.toFixed(2)}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-5">
          <TransactionsChart transactions={transactions} />
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
