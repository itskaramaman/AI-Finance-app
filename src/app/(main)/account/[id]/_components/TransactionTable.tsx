"use client";

import {
  TransactionTypeEnum,
  RecurringIntervalEnum,
  TransactionStatusEnum,
} from "@/lib/type";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

type TransactionTableProps = {
  id: string;
  type: TransactionTypeEnum;
  amount: number;
  description: string;
  date: Date;
  category: string;
  receiptUrl: string | null;
  isRecurring: boolean;
  recurringInterval: RecurringIntervalEnum | null;
  nextRecurringDate: Date | null;
  lastProcessed: Date | null;
  status: TransactionStatusEnum;
  userId: string;
  accountId: string;
  createdAt: Date;
  updatedAt: Date;
  balance: number;
};

const TransactionTable = ({
  transactions,
}: {
  transactions: TransactionTableProps[];
}) => {
  const handleSort = (filterBy: string) => {};
  return (
    <div>
      {/* filters */}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox />
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center">Date</div>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center">Category</div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center justify-end">Amount</div>
              </TableHead>
              <TableHead>Recurring</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">INV001</TableCell>
              <TableCell>Paid</TableCell>
              <TableCell>Credit Card</TableCell>
              <TableCell className="text-right">$250.00</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TransactionTable;
