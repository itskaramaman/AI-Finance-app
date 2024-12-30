"use client";

import { TransactionTypeEnum, TransactionType } from "@/lib/type";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDownIcon,
  ChevronUpIcon,
  Clock,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import useFetch from "@/hooks/useFetch";
import { bulkDeleteTransactions } from "@/actions/transaction";
import { toast } from "sonner";

type SortConfig = {
  field: "date" | "category" | "amount";
  direction: "asc" | "desc";
};

const TRANSACTIONS_PER_PAGE = 10;

const TransactionTable = ({
  transactions,
}: {
  transactions: TransactionType[];
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "date",
    direction: "desc",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");
  const [pageNum, setPageNum] = useState(1);

  const filteredAndSortedTransactions: TransactionType[] = useMemo(() => {
    let result = [...transactions];

    if (searchTerm) {
      result = result.filter((transaction) =>
        transaction.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    if (recurringFilter === "recurring") {
      result = result.filter((transaction) => transaction.isRecurring);
    } else if (recurringFilter === "non-recurring") {
      result = result.filter((transaction) => !transaction.isRecurring);
    }

    if (typeFilter) {
      result = result.filter((transaction) => transaction.type === typeFilter);
    }

    result.sort((a, b) => {
      let comparison = 0;

      switch (sortConfig.field) {
        case "date":
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;

        default:
          comparison = 0;
          break;
      }

      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return result;
  }, [transactions, searchTerm, typeFilter, recurringFilter, sortConfig]);

  const paginatedTransactions = filteredAndSortedTransactions.slice(
    (pageNum - 1) * TRANSACTIONS_PER_PAGE,
    (pageNum - 1) * TRANSACTIONS_PER_PAGE + TRANSACTIONS_PER_PAGE
  );

  const {
    loading: deleteLoading,
    data: deleteData,
    fn: fnBulkDeleteTransactions,
  } = useFetch(bulkDeleteTransactions);

  const handleSort = (field: SortConfig["field"]) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field == field && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelect = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [id, ...current]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds((current) =>
      current.length === transactions.length
        ? []
        : transactions.map((transaction) => transaction.id)
    );
  };

  const handleBulkDelete = async (ids: string[]) => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} transactions?`
      )
    )
      return;

    await fnBulkDeleteTransactions(ids);
    setSelectedIds([]);
  };

  useEffect(() => {
    if (deleteData && !deleteLoading) {
      toast.success("Transactions deleted successfully");
    }
  }, [deleteData, deleteLoading]);

  const handleClearFilter = () => {
    setRecurringFilter("");
    setTypeFilter("");
    setSearchTerm("");
    setSelectedIds([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search Transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-4 items-center">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TransactionTypeEnum.INCOME}>Income</SelectItem>
              <SelectItem value={TransactionTypeEnum.EXPENSE}>
                Expense
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={recurringFilter} onValueChange={setRecurringFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recurring">Recurring Only</SelectItem>
              <SelectItem value="non-recurring">Non-recurring Only</SelectItem>
            </SelectContent>
          </Select>

          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleBulkDelete(selectedIds)}
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete Transactions ({selectedIds.length})
                </>
              )}
            </Button>
          )}

          {(searchTerm || typeFilter || recurringFilter) && (
            <Button variant="outline" size="sm" onClick={handleClearFilter}>
              <X className="h-4 w-5" />
            </Button>
          )}
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  onClick={handleSelectAll}
                  checked={selectedIds.length === transactions.length}
                />
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center">
                  Date
                  {sortConfig.field === "date" &&
                  sortConfig.direction === "desc" ? (
                    <ChevronUpIcon className="h-4 w-4 ml-1" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4 ml-1" />
                  )}
                </div>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center">
                  Category
                  {sortConfig.field === "category" &&
                  sortConfig.direction === "desc" ? (
                    <ChevronUpIcon className="h-4 w-4 ml-1" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4 ml-1" />
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center justify-end">
                  Amount
                  {sortConfig.field === "amount" &&
                  sortConfig.direction === "desc" ? (
                    <ChevronUpIcon className="h-4 w-4 ml-1" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4 ml-1" />
                  )}
                </div>
              </TableHead>
              <TableHead>Recurring</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No Transactions on this account.
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Checkbox
                      onClick={() => handleSelect(transaction.id)}
                      checked={selectedIds.includes(transaction.id)}
                    />
                  </TableCell>
                  <TableCell>{format(transaction.date, "PP")}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>
                    <p className={`capitalize`}>{transaction.category}</p>
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      transaction.type === TransactionTypeEnum.INCOME
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {transaction.type === TransactionTypeEnum.INCOME
                      ? "+"
                      : "-"}
                    ${transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {transaction.isRecurring ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge className="bg-blue-500 hover:bg-blue-600 flex items-center">
                              <RefreshCw className="h-4 w-4 mr-1" />
                              <span>
                                {transaction.recurringInterval &&
                                  transaction.recurringInterval
                                    ?.at(0)
                                    ?.toUpperCase() +
                                    transaction.recurringInterval
                                      ?.slice(1)
                                      .toLowerCase()}
                              </span>
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-sm">
                              <div className="font-medium">Next Date:</div>
                              <div>
                                {transaction.nextRecurringDate &&
                                  format(
                                    new Date(transaction.nextRecurringDate),
                                    "PP"
                                  )}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <Badge variant="outline">
                        <Clock className="h-4 w-4 mr-1" /> One Time
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleBulkDelete([transaction.id])}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-center">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pageNum === 1}
            onClick={() => setPageNum((prev) => prev - 1)}
          >
            <ArrowLeft />
          </Button>
          <div className="text-sm text-gray-600">
            Page {pageNum} of{" "}
            {Math.ceil(
              filteredAndSortedTransactions.length / TRANSACTIONS_PER_PAGE
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageNum((prev) => prev + 1)}
            disabled={
              pageNum ===
              Math.ceil(
                filteredAndSortedTransactions.length / TRANSACTIONS_PER_PAGE
              )
            }
          >
            <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TransactionTable;
