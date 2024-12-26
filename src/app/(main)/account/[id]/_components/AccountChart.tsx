"use client";

import { TransactionType, TransactionTypeEnum } from "@/lib/type";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const AccountChart = ({
  transactions,
}: {
  transactions: TransactionType[];
}) => {
  const [chartDuration, setChartDuration] = useState<
    "last month" | "last three months" | "last week"
  >("last month");
  let transactionCharts = transactions.map((transaction) => ({
    amount: transaction.amount,
    createdAt: transaction.createdAt,
    date: format(transaction.createdAt, "PP").split(",")[0],
    type: transaction.type,
    fillColor:
      transaction.type === TransactionTypeEnum.EXPENSE ? "#FF0000" : "#008000",
  }));

  transactionCharts = transactionCharts.sort(
    (a, b) => a.createdAt - b.createdAt
  );

  if (chartDuration === "last week") {
    transactionCharts = transactionCharts.slice(transactionCharts.length - 7);
  } else if (chartDuration === "last three months") {
    transactionCharts = transactionCharts.slice(transactionCharts.length - 90);
  } else {
    transactionCharts = transactionCharts.slice(transactionCharts.length - 30);
  }

  let totalIncome = 0;
  let totalExpense = 0;

  transactionCharts.forEach((transaction) => {
    if (transaction.type === TransactionTypeEnum.EXPENSE) {
      totalExpense = totalExpense + transaction.amount;
    } else {
      totalIncome = totalIncome + transaction.amount;
    }
  });
  const net = totalIncome - totalExpense;

  return (
    <div className="w-full h-[30rem] border rounded-lg shadow-md p-5">
      <div className="flex items-center justify-between px-5 pb-2">
        <div>
          <h1 className="font-semibold">Transaction Overview</h1>
        </div>

        <div>
          <Select onValueChange={(val) => setChartDuration(val)}>
            <SelectTrigger value="light" className="w-[180px]">
              <SelectValue placeholder="Last Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last month">Last Month</SelectItem>
              <SelectItem value="last three months">Last 3 Month</SelectItem>
              <SelectItem value="last week">Last Week</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-around items-center">
        <div className="text-center">
          <span className="block text-gray-600">Total Income</span>
          <span className="block text-green-500">
            ${totalIncome.toFixed(2)}
          </span>
        </div>
        <div className="text-center">
          <span className="block text-gray-600">Total Expense</span>
          <span className="block text-red-500">${totalExpense.toFixed(2)}</span>
        </div>
        <div className="text-center">
          <span className="block text-gray-600">Net</span>
          <span
            className={`block ${net >= 0 ? "text-green-500" : "text-red-500"}`}
          >
            ${net.toFixed(2)}
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={transactionCharts}>
          <CartesianGrid strokeDasharray="3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="amount">
            {transactionCharts.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fillColor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AccountChart;
