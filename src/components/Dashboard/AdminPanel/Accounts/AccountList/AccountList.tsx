"use client";
import { useGetAccountsListQuery } from "@/Redux/Reducers/AdminPanel/Accounts/AccountsApi";

const AccountList: React.FC = () => {
  const { data: accountsList, isLoading } = useGetAccountsListQuery(undefined);
  console.log("CLG", accountsList);
  const exextractData = accountsList?.results;

  return <div>{/* JSX here */}</div>;
};

export default AccountList;
