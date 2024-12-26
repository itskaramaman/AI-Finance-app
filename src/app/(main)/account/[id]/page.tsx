import { getAccountDetailsById } from "@/actions/account";
import { notFound } from "next/navigation";
import TransactionTable from "./_components/TransactionTable";
import { Suspense } from "react";
import { BarLoader } from "react-spinners";
import AccountChart from "./_components/AccountChart";

const AccountPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const accountDetails = await getAccountDetailsById(id);
  if (!accountDetails) notFound();
  const { account, transactions } = accountDetails;

  return (
    <div className="space-y-8">
      <div className="flex gap-4 items-end justify-between">
        <div>
          <h1 className="text-5xl sm:text-6xl font-bold gradient-title capitalized">
            {account.name}
          </h1>
          <p className="text-muted-foreground">
            {account.type.at(0) + account.type.slice(1).toLowerCase()} Account
          </p>
        </div>

        <div className="text-right pb-2">
          <div className="text-xl sm:text-2xl font-bold">
            ${parseFloat(account.balance).toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground">
            {account._count.transactions} Transactions
          </p>
        </div>
      </div>

      {/* chart section */}
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
        <AccountChart transactions={transactions} />
      </Suspense>

      {/* transaction table */}
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
        <TransactionTable transactions={transactions} />
      </Suspense>
    </div>
  );
};

export default AccountPage;
