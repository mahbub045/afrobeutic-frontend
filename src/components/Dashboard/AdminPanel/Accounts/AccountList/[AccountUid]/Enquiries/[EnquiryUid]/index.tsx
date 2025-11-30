"use client";
import Breadcrumbs from "@/components/Dashboard/CommonComponents/Breadcrumbs";
import { useParams } from "next/navigation";

const EnquiryDetailsContainer: React.FC = () => {
  const { accountuid, enquiryuid } = useParams();
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
          {
            label: "Enquiry Details",
            href: `/dashboard/admin-panel/accounts/${accountuid}/enquiries/${enquiryuid}`,
          },
        ]}
      />
    </div>
  );
};

export default EnquiryDetailsContainer;
