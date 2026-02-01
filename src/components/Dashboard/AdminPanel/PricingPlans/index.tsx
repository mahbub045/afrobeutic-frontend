"use client";
import Breadcrumbs from "../../CommonComponents/Breadcrumbs";
import PricingPlanList from "./PricingPlanList/PricingPlanList";

const PricingPlansContainer: React.FC = () => {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard/admin-panel" },
          {
            label: "Pricing Plans",
            href: "/dashboard/admin-panel/pricing-plans",
          },
        ]}
      />
      <PricingPlanList />
    </div>
  );
};

export default PricingPlansContainer;
