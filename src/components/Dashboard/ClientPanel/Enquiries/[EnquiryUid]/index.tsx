"use client";
import Breadcrumbs from "@/components/Dashboard/CommonComponents/Breadcrumbs";
import { useParams } from "next/navigation";
import EnquiryDetails from "./EnquiryDetail/EnquiryDetail";

const EnquiryDetailContainer: React.FC = () => {
  const { enquiryuid } = useParams<{ enquiryuid: string }>();
  return (
    <div className="container mx-auto space-y-6 px-4 py-6 md:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard/client-panel" },
          {
            label: "Enquiries",
            href: "/dashboard/client-panel/enquiries",
          },
          {
            label: "Enquiry Details",
            href: `/dashboard/client-panel/enquiries/${enquiryuid}`,
          },
        ]}
      />
      <EnquiryDetails />
    </div>
  );
};

export default EnquiryDetailContainer;
