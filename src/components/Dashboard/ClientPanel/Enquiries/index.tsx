"use client";
import Breadcrumbs from "../../CommonComponents/Breadcrumbs";
import EnquiryList from "./EnquiryList/EnquiryList";

const EnquiriesPageContainer: React.FC = () => {
  return (
    <div>
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
