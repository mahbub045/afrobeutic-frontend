import Breadcrumbs from "../../CommonComponents/Breadcrumbs";

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
    </div>
  );
};

export default PricingPlansContainer;