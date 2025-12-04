"use client";

import Breadcrumbs from "../../CommonComponents/Breadcrumbs";
import ManagementList from "./ManagementList/ManagementList";

const ManagementsContainer: React.FC = () => {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard/admin-panel" },
          {
            label: "Managements",
            href: "/dashboard/admin-panel/managements",
          },
        ]}
      />
      <ManagementList />
    </div>
  );
};

export default ManagementsContainer;
