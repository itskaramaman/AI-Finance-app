"use client";

import { TransactionType, TransactionTypeEnum } from "@/lib/type";
import React from "react";
import {
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const colors = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEEAD",
  "#D4A5A5",
  "#9FA8DA",
];

const TransactionsChart = ({
  transactions,
}: {
  transactions: TransactionType[];
}) => {
  const date = new Date();
  const currentMonthTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date();
    return (
      transaction.type === TransactionTypeEnum.EXPENSE &&
      transactionDate.getMonth() === date.getMonth() &&
      transactionDate.getFullYear() === date.getFullYear()
    );
  });

  const expensesByCategories = currentMonthTransactions.reduce(
    (acc, transaction) => {
      const category = transaction.category;
      if (category in acc) {
        acc[category] += transaction.amount;
      } else {
        acc[category] = transaction.amount;
      }

      return acc;
    },
    {} as Record<string, number>
  );

  const pieChartData = Object.entries(expensesByCategories).map(
    ([category, amount]) => ({ name: category, value: amount })
  );

  if (pieChartData.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-4">
        No expense this month
      </p>
    );
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieChartData}
            cx="50%"
            cy="50%"
            fill="#8884d8"
            dataKey="value"
            outerRadius={80}
            label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
          >
            {pieChartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => `$${value.toFixed(2)}`}
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TransactionsChart;
