import Breadcrumbs from "../../CommonComponents/Breadcrumbs";
import PricingPlanList from "./PricingPlanList/PricingPlanList";

const PricingPlansContainer: React.FC = () => {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard/client-panel" },
          {
            label: "Pricing Plans",
            href: "/dashboard/client-panel/pricing-plans",
          },
        ]}
      />
      <PricingPlanList />
    </div>
  );
};

export default PricingPlansContainer;
