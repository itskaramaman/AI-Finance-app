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

import { useEffect, useState } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountFormSchema, AccountFormType } from "@/lib/schema";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import useFetch from "@/hooks/useFetch";
import { createAccount } from "@/actions/dashboard";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const CreateAccountDrawer = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AccountFormType>({
    resolver: zodResolver(accountFormSchema),
  });

  const { loading, error, data, fn: fnCreateAccount } = useFetch(createAccount);

  const handleFormSubmit: SubmitHandler<AccountFormType> = async (formData) => {
    await fnCreateAccount(formData);
  };

  useEffect(() => {
    if (!loading && data) {
      toast.success("Account Created Successfully");
      reset();
      setOpen(false);
    }
  }, [data, loading]);

  useEffect(() => {
    if (error) toast.error("Failed to create account");
  }, [error]);

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        reset();
      }}
    >
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create New Account</DrawerTitle>
        </DrawerHeader>
        <div className="p-5">
          <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)}>
            <div>
              <Label>Account Name</Label>
              <Input placeholder="Main Checking" {...register("name")} />
              {errors.name && (
                <span className="text-sm text-red-500">
                  {errors.name.message}
                </span>
              )}
            </div>
            <div>
              <Label>Balance</Label>
              <Input
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
                {...register("balance")}
              />
              {errors.balance && (
                <span className="text-sm text-red-500">
                  {errors.balance.message}
                </span>
              )}
            </div>
            <div>
              <Label>Account Type</Label>
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
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Default Account</Label>
                      <p className="text-sm text-muted-foreground">
                        This account will be the default account for
                        transactions.
                      </p>
                    </div>

                    <Switch
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
            <div className="grid grid-cols-2 gap-2 items-center">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button className="" variant="bgBlue" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CreateAccountDrawer;
