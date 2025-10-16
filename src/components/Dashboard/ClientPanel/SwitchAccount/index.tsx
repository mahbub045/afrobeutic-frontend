"use client";
import Breadcrumbs from "../../CommonComponents/Breadcrumbs";
import AccountList from "./AccountList/AccountList";

const SwitchAccountContainer: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard/client-panel" },
          {
            label: "Switch Account",
            href: "/dashboard/client-panel/accounts/switch-account",
          },
        ]}
      />
      <AccountList />
    </div>
  );
};

export default SwitchAccountContainer;
