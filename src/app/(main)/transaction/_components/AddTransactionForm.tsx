"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Input } from "@/components/ui/input";
import { addTransactionFormSchema, AddTransactionFormType } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera } from "lucide-react";
import { useRef, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { TransactionTypeEnum, RecurringIntervalEnum } from "@/lib/type";
import { SelectValue } from "@radix-ui/react-select";
import { AccountType } from "@/lib/type";
import CreateAccountDrawer from "@/components/CreateAccountDrawer";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { defaultCategories } from "@/data/categories";

const AddTransactionForm = ({ accounts }: { accounts: AccountType[] }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showRecurringIntervals, setShowRecurringIntervals] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<AddTransactionFormType>({
    resolver: zodResolver(addTransactionFormSchema),
  });

  const handleFormSubmit: SubmitHandler<AddTransactionFormType> = (data) => {
    console.log(data);
  };

  console.log(errors);

  return (
    <form
      className="w-full space-y-4"
      onSubmit={handleSubmit(handleFormSubmit)}
    >
      <div
        className="gradient rounded-md h-10 flex items-center justify-center cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex gap-2 text-white items-center">
          <Camera />
          <p>Scan Receipt with AI</p>
        </div>
        <Input type="file" ref={fileInputRef} className="hidden" />
      </div>

      <div className="space-y-2">
        <Label>Type</Label>
        <Controller
          name="type"
          control={control}
          defaultValue={TransactionTypeEnum.INCOME}
          render={({ field }) => (
            <Select
              defaultValue={TransactionTypeEnum.INCOME}
              value={field.value}
              onValueChange={(value) => field.onChange(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Transaction Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TransactionTypeEnum.INCOME}>
                  Income
                </SelectItem>
                <SelectItem value={TransactionTypeEnum.EXPENSE}>
                  Expense
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.type && (
          <span className="text-red-500 text-sm mt-1">
            {errors.type.message}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label>Amount</Label>
          <Input
            type="text"
            {...register("amount", { valueAsNumber: true })}
            placeholder="0.00"
          />
          {errors.amount && (
            <span className="text-red-500 text-sm mt-1">
              {errors.amount.message}
            </span>
          )}
        </div>
        <div className="space-y-2">
          <Label>Account</Label>
          <Controller
            defaultValue={accounts.filter((account) => account.isDefault)[0].id}
            name="account"
            control={control}
            render={({ field }) => (
              <Select
                defaultValue={
                  accounts.filter((account) => account.isDefault)[0].id
                }
                onValueChange={(value) => field.onChange(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} (${account.balance.toFixed(2)})
                    </SelectItem>
                  ))}
                  <div className="relative bg-gray-200 cursor-pointer flex w-full select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                    <CreateAccountDrawer>
                      <p className="w-full h-full">Add Account</p>
                    </CreateAccountDrawer>
                  </div>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Controller
          name="category"
          control={control}
          defaultValue={defaultCategories[0].name}
          render={({ field }) => (
            <Select
              defaultValue={defaultCategories[0].name}
              onValueChange={(value) => field.onChange(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Category Type" />
              </SelectTrigger>
              <SelectContent>
                {defaultCategories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.category && (
          <span className="text-red-500 text-sm mt-1">
            {errors.category.message}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <Label>Date</Label>
        <Controller
          control={control}
          name="date"
          render={({ field }) => (
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon />
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>Transaction date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        />

        {errors.date && (
          <span className="text-red-500 text-sm mt-1">
            {errors.date.message}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea placeholder="Transaction Description" />
      </div>

      <div className="space-y-2">
        <Card className="rounded-md">
          <CardHeader>
            <CardTitle>Recurring Transaction</CardTitle>
            <CardDescription>
              <div className="flex justify-between items-center">
                <p>Set up a recurring schedule for this transaction</p>
                <Switch
                  onCheckedChange={(checked) =>
                    setShowRecurringIntervals(checked)
                  }
                />
              </div>
              {showRecurringIntervals && (
                <div className="mt-2">
                  <Controller
                    control={control}
                    name="recurringInterval"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) => field.onChange(value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Interval" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={RecurringIntervalEnum.DAILY}>
                            Daily
                          </SelectItem>
                          <SelectItem value={RecurringIntervalEnum.WEEKLY}>
                            Weekly
                          </SelectItem>
                          <SelectItem value={RecurringIntervalEnum.MONTHLY}>
                            Monthly
                          </SelectItem>
                          <SelectItem value={RecurringIntervalEnum.YEARLY}>
                            Yearly
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              )}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="grid sm:grid-cols-2 gap-2 items-center">
        <Button variant="outline" onClick={() => reset()}>
          Cancel
        </Button>
        <Button type="submit">Create Transaction</Button>
      </div>
    </form>
  );
};

export default AddTransactionForm;
