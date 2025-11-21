import Breadcrumbs from "../../CommonComponents/Breadcrumbs";
import LeadList from "./LeadList/LeadList";

const LeadsPageContainer: React.FC = () => {
  return (
    <div>
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
