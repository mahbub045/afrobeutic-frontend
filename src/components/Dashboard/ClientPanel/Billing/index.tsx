import Breadcrumbs from "../../CommonComponents/Breadcrumbs";

const BillingContainer: React.FC = () => {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard/client-panel" },
          {
            label: "Billing",
            href: "/dashboard/client-panel/accounts/billing",
          },
        ]}
      />
      <div>
        
      </div>
    </div>
  );
};

export default BillingContainer;