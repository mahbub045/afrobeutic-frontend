"use client";

import Breadcrumbs from "@/components/Dashboard/CommonComponents/Breadcrumbs";
import AccountList from "./AccountList/AccountList";

const SwitchAccountContainer: React.FC = () => {
  return (
    <div>
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
