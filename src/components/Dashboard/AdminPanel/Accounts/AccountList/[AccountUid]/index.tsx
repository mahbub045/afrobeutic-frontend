"use client";

import { useGetAccountDetailsQuery } from "@/Redux/Reducers/AdminPanel/Accounts/AccountsApi";
import { useParams } from "next/navigation";

const AccountDetailsContainer: React.FC = () => {
  const { accountuid } = useParams();
  const {
    data: accountDetails,
    isLoading,
    isFetching,
  } = useGetAccountDetailsQuery(accountuid);

  return <div>
    {accountDetails?.name}
  </div>;
};

export default AccountDetailsContainer;
