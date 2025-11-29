import Breadcrumbs from "../../CommonComponents/Breadcrumbs";
import AccountList from "./AccountList/AccountList";

const AccountsContainer: React.FC = () => {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard/admin-panel" },
          {
            label: "Accounts",
            href: "/dashboard/admin-panel/accounts",
          },
        ]}
      />
      <AccountList />
    </div>
  );
};

export default AccountsContainer;
