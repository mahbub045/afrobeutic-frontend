"use client";
import Breadcrumbs from "@/components/Dashboard/CommonComponents/Breadcrumbs";
import { useParams } from "next/navigation";
import EnquiryDetails from "./EnquiryDetails/EnquiryDetails";

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
      <EnquiryDetails />
    </div>
  );
};

export default EnquiryDetailsContainer;
