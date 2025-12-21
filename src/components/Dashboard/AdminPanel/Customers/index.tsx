"use client";
import Breadcrumbs from "../../CommonComponents/Breadcrumbs";
import CustomerList from "./CustomerList/CustomerList";

const CustomerContainer: React.FC = () => {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard/admin-panel" },
          {
            label: "Customers",
            href: "/dashboard/admin-panel/customers",
          },
        ]}
      />
      <CustomerList />
    </div>
  );
};

export default CustomerContainer;
