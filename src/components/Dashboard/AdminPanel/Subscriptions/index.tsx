import Breadcrumbs from "../../CommonComponents/Breadcrumbs";
import SubscriptionList from "./SubscriptionList/SubscriptionList";

const SubscriptionsContainer: React.FC = () => {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard/admin-panel" },
          {
            label: "Subscriptions",
            href: "/dashboard/admin-panel/subscriptions",
          },
        ]}
      />
      <SubscriptionList />
    </div>
  );
};

export default SubscriptionsContainer;
