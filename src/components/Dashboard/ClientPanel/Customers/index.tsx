"use client";

import Breadcrumbs from "../../CommonComponents/Breadcrumbs";
import CustomerList from "./CustomerList/CustomerList";

const CustomersContainer: React.FC = () => {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard/client-panel" },
          {
            label: "Customers",
            href: "/dashboard/client-panel/customers",
          },
        ]}
      />
      <CustomerList />
    </div>
  );
};

export default CustomersContainer;
