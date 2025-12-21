"use client";
import Breadcrumbs from "@/components/Dashboard/CommonComponents/Breadcrumbs";
import CustomerDetails from "./CustomerDetails/CustomerDetails";

const CustomerDetailsContainer: React.FC = () => {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard/admin-panel" },
          {
            label: "Customers",
            href: "/dashboard/admin-panel/customers",
          },
          { label: "Customer Details", href: "#" },
        ]}
      />
      <CustomerDetails />
    </div>
  );
};

export default CustomerDetailsContainer;
