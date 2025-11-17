import Breadcrumbs from "../../CommonComponents/Breadcrumbs";
import LeadList from "./LeadList/LeadList";

const LeadsPageContainer: React.FC = () => {
  return (
    <div className="container mx-auto space-y-6 px-4 py-6 md:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard/client-panel" },
          {
            label: "Leads",
            href: "/dashboard/client-panel/leads",
          },
        ]}
      />
      <LeadList />
    </div>
  );
};

export default LeadsPageContainer;
