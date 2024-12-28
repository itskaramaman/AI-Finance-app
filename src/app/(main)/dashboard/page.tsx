import CreateAccountDrawer from "@/components/CreateAccountDrawer";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { getUserAccounts } from "@/actions/account";
import AccountCard from "./_components/AccountCard";
import { getCurrentBudget } from "@/actions/budget";
import BudgetProgress from "./_components/BudgetProgress";

const DashboardPage = async () => {
  const accounts = await getUserAccounts();
  const defaultAccount = accounts?.find((account) => account.isDefault);

  let budgetData = null;
  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }

  return (
    <div className="space-y-8">
      {/* Budget Progress */}
      {budgetData && (
        <BudgetProgress
          budget={budgetData.budget}
          currentExpenses={budgetData.currentExpenses}
        />
      )}

      {/* Dashboard Overview */}

      {/* Accounts grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CreateAccountDrawer>
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
            <div className="w-full h-full p-5 text-muted-foreground flex flex-col items-center justify-center">
              <Plus className="h-10 w-10 mb-2" />
              <p className="text-sm font-medium">Add New Account</p>
            </div>
          </Card>
        </CreateAccountDrawer>
        {accounts.map((account, index) => (
          <AccountCard key={index} account={account} />
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
