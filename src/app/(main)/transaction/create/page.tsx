import { getUserAccounts } from "@/actions/account";
import AddTransactionForm from "../_components/AddTransactionForm";

const AddTransactionPage = async () => {
  const accounts = await getUserAccounts();

  return (
    <div className="max-w-3xl mx-auto px-5">
      <h1 className="text-5xl gradient-title mb-8">Add Transaction</h1>
      <AddTransactionForm accounts={accounts} />
    </div>
  );
};

export default AddTransactionPage;
