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

import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type ChartDurationType =
  | "all time"
  | "last 6 month"
  | "last 3 month"
  | "last month"
  | "last week";

const AccountChart = ({
  transactions,
}: {
  transactions: TransactionType[];
}) => {
  const [chartDuration, setChartDuration] =
    useState<ChartDurationType>("last month");

  const filteredData = useMemo(() => {
    let transactionCharts = transactions.map((transaction) => ({
      [transaction.type === TransactionTypeEnum.EXPENSE ? "expense" : "income"]:
        transaction.amount,
      createdAt: transaction.createdAt,
      date: format(transaction.createdAt, "PP").split(",")[0],
      type: transaction.type,
      amount: transaction.amount,
      fillColor:
        transaction.type === TransactionTypeEnum.EXPENSE
          ? "#FF0000"
          : "#008000",
    }));

    transactionCharts = transactionCharts.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    switch (chartDuration) {
      case "last week":
        transactionCharts = transactionCharts.slice(
          transactionCharts.length - 7
        );
        break;
      case "last month":
        transactionCharts = transactionCharts.slice(
          transactionCharts.length - 30
        );
        break;
      case "last 3 month":
        transactionCharts = transactionCharts.slice(
          transactionCharts.length - 90
        );
        break;
      case "last 6 month":
        transactionCharts = transactionCharts.slice(
          transactionCharts.length - 180
        );
        break;

      default:
        break;
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

    return { transactionCharts, totalExpense, totalIncome, net };
  }, [transactions, chartDuration]);

  return (
    <div className="w-full h-[30rem] border rounded-lg shadow-md p-5">
      <div className="flex items-center justify-between px-5 pb-2">
        <div>
          <h1 className="font-semibold">Transaction Overview</h1>
        </div>

        <div>
          <Select defaultValue={chartDuration} onValueChange={setChartDuration}>
            <SelectTrigger value="light" className="w-[180px]">
              <SelectValue placeholder="Last Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last week">Last Week</SelectItem>
              <SelectItem value="last month">Last Month</SelectItem>
              <SelectItem value="last 3 month">Last 3 Month</SelectItem>
              <SelectItem value="last 6 month">Last 6 Month</SelectItem>
              <SelectItem value="all time">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-around items-center">
        <div className="text-center">
          <span className="block text-gray-600">Total Income</span>
          <span className="block text-green-500">
            ${filteredData.totalIncome.toFixed(2)}
          </span>
        </div>
        <div className="text-center">
          <span className="block text-gray-600">Total Expense</span>
          <span className="block text-red-500">
            ${filteredData.totalExpense.toFixed(2)}
          </span>
        </div>
        <div className="text-center">
          <span className="block text-gray-600">Net</span>
          <span
            className={`block ${
              filteredData.net >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            ${filteredData.net.toFixed(2)}
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={filteredData.transactionCharts}>
          <CartesianGrid strokeDasharray="3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="income" name="Income" fill="#22c55e" />
          <Bar dataKey="expense" name="Expense" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AccountChart;
