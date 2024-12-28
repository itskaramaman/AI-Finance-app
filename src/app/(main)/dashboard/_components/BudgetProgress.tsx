"use client";

import React, { useEffect, useMemo, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Pen, X } from "lucide-react";
import useFetch from "@/hooks/useFetch";
import { updateBudget } from "@/actions/budget";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

type BudgetProgressType = {
  budget: {
    amount: number;
    id: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    lastAlertSent: Date | null;
  } | null;
  currentExpenses: number;
};

const BudgetProgress = ({ budget, currentExpenses }: BudgetProgressType) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(budget?.amount.toString() || "");

  console.log(budget);
  console.log(currentExpenses);

  const percentageUsed = useMemo(() => {
    return budget?.amount ? (currentExpenses / budget?.amount) * 100 : 0;
  }, [budget?.amount, currentExpenses]);

  const { loading, data, fn: fnUpdateBudget } = useFetch(updateBudget);

  const handleUpdateBudget = async () => {
    if (isNaN(parseFloat(newBudget)) || parseFloat(newBudget) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    await fnUpdateBudget(newBudget);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  useEffect(() => {
    if (data && !loading) {
      toast.success("Budget Updated");
    }
  }, [loading, data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Budget (Default Account)</CardTitle>
        <div>
          {isEditing ? (
            <div className="flex items-center gap-1">
              <Input
                type="number"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                placeholder="Enter Amount"
                autoFocus
                className="w-32"
                disabled={loading}
              />

              <Button
                variant="ghost"
                size="sm"
                onClick={handleUpdateBudget}
                disabled={loading}
              >
                <Check className="h-4 w-4 text-green-500" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={loading}
              >
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ) : (
            <CardDescription className="text-gray-600 flex items-center gap-1">
              {budget?.amount
                ? `${currentExpenses} of $${budget.amount.toFixed(2)}`
                : "No budget set"}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Pen className="h-4 w-4" />
              </Button>
            </CardDescription>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {budget && (
          <div className="space-y-2">
            <Progress
              value={percentageUsed}
              extraStyles={
                percentageUsed >= 90
                  ? "bg-red-500"
                  : percentageUsed > 75
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }
            />
            <p className="text-xs text-muted-foreground text-right">
              {percentageUsed.toFixed(2)}% used
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetProgress;
