"use client";
import { getUserAccounts } from "@/actions/account";
import useFetch from "@/hooks/useFetch";
import AddTransactionForm from "../_components/AddTransactionForm";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { BarLoader } from "react-spinners";
import { getTransactionById } from "@/actions/transaction";

const AddTransactionPage = () => {
  const {
    loading: userAccountLoading,
    data: userAccounts,
    fn: fnGetUserAccounts,
  } = useFetch(getUserAccounts);

  const {
    loading: getTransactionLoading,
    data: transactionData,
    fn: fnGetTransactionById,
  } = useFetch(getTransactionById);

  const params = useSearchParams();

  const editTransaction = params.has("edit");

  useEffect(() => {
    const getUserAccounts = async () => {
      await fnGetUserAccounts();
    };
    getUserAccounts();

    if (editTransaction) {
      const getTransactionById = async () => {
        await fnGetTransactionById(params.get("edit"));
      };
      getTransactionById();
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-5">
      <h1 className="text-5xl gradient-title mb-8">
        {params.has("edit") ? "Edit Transaction" : "Add Transaction"}
      </h1>
      {!editTransaction ? (
        userAccounts && !userAccountLoading ? (
          <AddTransactionForm accounts={userAccounts} />
        ) : (
          <BarLoader className="mt-4" width={"100%"} color="#9333ea" />
        )
      ) : !getTransactionLoading &&
        transactionData &&
        userAccounts &&
        !userAccountLoading ? (
        <AddTransactionForm
          accounts={userAccounts}
          transaction={transactionData}
          editTransactionId={params.get("edit") || ""}
        />
      ) : (
        <BarLoader className="mt-4" width={"100%"} color="#9333ea" />
      )}
    </div>
  );
};

export default AddTransactionPage;
