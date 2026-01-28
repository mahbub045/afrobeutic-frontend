"use client";
import Breadcrumbs from "@/components/Dashboard/CommonComponents/Breadcrumbs";
import SubscriptionDetails from "./SubscriptionDetails/SubscriptionDetails";

const SubscriptionDetailsContainer: React.FC = () => {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard/admin-panel" },
          {
            label: "Subscriptions",
            href: "/dashboard/admin-panel/subscriptions",
          },
          {
            label: "Subscription Details",
            href: "/dashboard/admin-panel/subscriptions/[SubscriptionUid]",
          },
        ]}
      />
      <SubscriptionDetails />
    </div>
  );
};

export default SubscriptionDetailsContainer;
