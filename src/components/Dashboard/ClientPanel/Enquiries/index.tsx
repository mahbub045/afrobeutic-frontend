"use client";
import Breadcrumbs from "../../CommonComponents/Breadcrumbs";
import EnquiryList from "./EnquiryList/EnquiryList";

const EnquiriesPageContainer: React.FC = () => {
  return (
    <div className="container mx-auto space-y-6 px-4 py-6 md:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard/client-panel" },
          {
            label: "Enquiries",
            href: "/dashboard/client-panel/enquiries",
          },
        ]}
      />
      <EnquiryList />
    </div>
  );
};

export default EnquiriesPageContainer;
