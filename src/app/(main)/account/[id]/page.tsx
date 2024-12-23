import { getAccountDetailsById } from "@/actions/account";

const AccountPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const accountDetails = await getAccountDetailsById(id);

  return <div>AccountPage {JSON.stringify(accountDetails)}</div>;
};

export default AccountPage;
