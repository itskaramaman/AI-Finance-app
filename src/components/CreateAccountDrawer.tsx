"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { AccountTypeEnum } from "@/lib/type";

import { useState } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountFormSchema, AccountFormType } from "@/lib/schema";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

const CreateAccountDrawer = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(true);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountFormType>({
    resolver: zodResolver(accountFormSchema),
  });

  const handleFormSubmit: SubmitHandler<AccountFormType> = (data) => {
    console.log(data);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create New Account</DrawerTitle>
        </DrawerHeader>
        <div className="p-5">
          <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)}>
            <div>
              <Input placeholder="Name" {...register("name")} />
              {errors.name && (
                <span className="text-sm text-red-500">
                  {errors.name.message}
                </span>
              )}
            </div>
            <div>
              <Input
                type="number"
                placeholder="Balance"
                {...register("balance")}
              />
              {errors.balance && (
                <span className="text-sm text-red-500">
                  {errors.balance.message}
                </span>
              )}
            </div>
            <div>
              <Controller
                control={control}
                name="type"
                defaultValue={AccountTypeEnum.SAVINGS}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Type</SelectLabel>
                        <SelectItem value={AccountTypeEnum.CURRENT}>
                          Current
                        </SelectItem>
                        <SelectItem value={AccountTypeEnum.SAVINGS}>
                          Savings
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && (
                <span className="text-sm text-red-500">
                  {errors.type.message}
                </span>
              )}
            </div>
            <div>
              <Controller
                control={control}
                name="isDefault"
                render={({ field }) => (
                  <div className="flex items-center gap-4">
                    <Label>Default Account</Label>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                )}
              />
              {errors.isDefault && (
                <span className="text-sm text-red-500">
                  {errors.isDefault.message}
                </span>
              )}
            </div>
            <Button className="w-full" variant="bgBlue">
              Create
            </Button>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CreateAccountDrawer;
