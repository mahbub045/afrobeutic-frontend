"use client";

import Breadcrumbs from "@/components/Dashboard/CommonComponents/Breadcrumbs";
import { useGetAccountDetailsQuery } from "@/Redux/Reducers/AdminPanel/Accounts/AccountsApi";
import { useParams } from "next/navigation";
import AccountDetails from "./AccountDetails/AccountDetails";

const AccountDetailsContainer: React.FC = () => {
  const { accountuid } = useParams();
  const { data: accountDetails, isLoading } =
    useGetAccountDetailsQuery(accountuid);

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard/admin-panel" },
          {
            label: "Accounts",
            href: "/dashboard/admin-panel/accounts",
          },
          {
            label: " Account Details",
            href: `/dashboard/admin-panel/accounts/${accountuid}`,
          },
        ]}
      />
      <AccountDetails accountDetails={accountDetails} isLoading={isLoading} />
    </div>
  );
};

export default AccountDetailsContainer;
