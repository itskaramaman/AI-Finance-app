"use client";

import { updateDefaultAccount } from "@/actions/account";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import useFetch from "@/hooks/useFetch";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { toast } from "sonner";

type AccountCardProps = {
  id: string;
  name: string;
  type: string;
  balance: string;
  isDefault: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  _count: { transactions: number };
};

const AccountCard = ({ account }: { account: AccountCardProps }) => {
  const {
    error,
    loading,
    data,
    fn: fnUpdateDefaultAccount,
  } = useFetch(updateDefaultAccount);

  const handleDefaultAccountChange = async (e) => {
    e.preventDefault();
    if (account.isDefault) {
      toast.warning("You need atleast one default account");
      return;
    }
    await fnUpdateDefaultAccount(account.id);
  };

  useEffect(() => {
    if (data?.success) {
      toast.success("Default account changed successfully");
    }
  }, [data, loading]);

  return (
    <Card className="hover:shadow-md transition-shadow group relative">
      <Link href={`/account/${account.id}`}>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-sm font-medium capitalize">
            {account.name}
          </CardTitle>
          <Switch
            checked={account.isDefault}
            onClick={handleDefaultAccountChange}
            disabled={loading}
          />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${parseFloat(account.balance).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            {account.type.at(0) + account.type.slice(1).toLowerCase()} Account
          </p>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <div>
            <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
            Income
          </div>
          <div>
            <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
            Expense
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
};

export default AccountCard;
