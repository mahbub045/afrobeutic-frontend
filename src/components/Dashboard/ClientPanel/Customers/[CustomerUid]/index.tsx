"use client";
import Breadcrumbs from "@/components/Dashboard/CommonComponents/Breadcrumbs";
import { useParams } from "next/navigation";
import CustomerDetail from "./CustomerDetail/CustomerDetail";

const CustomerDetailsPageContainer: React.FC = () => {
    const {customeruid} = useParams()
  return (
    <div className="container mx-auto space-y-6 px-4 py-6 md:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard/client-panel" },
          {
            label: "Customers",
            href: "/dashboard/client-panel/customers",
          },
          {
            label: "Customer Details",
            href: `/dashboard/client-panel/customers/${customeruid}`,
          },
        ]}
      />
      <CustomerDetail />
    </div>
  );
};

export default CustomerDetailsPageContainer;
