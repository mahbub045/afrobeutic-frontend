"use client";

import Breadcrumbs from "@/components/Dashboard/CommonComponents/Breadcrumbs";
import { useParams } from "next/navigation";
import EnquiryList from "./EnquiryList/EnquiryList";

const EnquiriesContainer: React.FC = () => {
  const { accountuid } = useParams();
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
            label: "Enquiries",
            href: `/dashboard/admin-panel/accounts/${accountuid}/enquiries`,
          },
        ]}
      />
      <EnquiryList />
    </div>
  );
};

export default EnquiriesContainer;
