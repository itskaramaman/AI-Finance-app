export const dynamic = "force-dynamic";
import { getUserAccounts } from "@/actions/account";
import AddTransactionForm from "../_components/AddTransactionForm";
import { getTransactionById } from "@/actions/transaction";

interface SearchParams {
  editId?: string;
}

const AddTransactionPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const accounts = await getUserAccounts();
  const params = await searchParams;
  const editId = params?.editId;
  let transaction = null;
  if (editId) {
    transaction = await getTransactionById(editId);
  }

  return (
    <div className="max-w-3xl mx-auto px-5">
      <h1 className="text-5xl gradient-title mb-8">
        {editId ? "Edit Transaction" : "Add Transaction"}
      </h1>

      {editId && transaction ? (
        <AddTransactionForm
          accounts={accounts}
          transaction={transaction}
          editTransactionId={editId}
        />
      ) : (
        <AddTransactionForm accounts={accounts} />
      )}
    </div>
  );
};

export default AddTransactionPage;
