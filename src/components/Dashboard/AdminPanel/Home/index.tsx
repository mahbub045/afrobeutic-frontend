"use client";
import Breadcrumbs from "../../CommonComponents/Breadcrumbs";
import WelcomeMessage from "../../CommonComponents/WelcomeMessage";
import Overview from "./Overview/Overview";

const AdminPanelContainer: React.FC = () => {
  return (
    <div>
      <Breadcrumbs
        items={[{ label: "Home", href: "/dashboard/admin-panel" }]}
      />
      <WelcomeMessage />
      <Overview />
      {/* <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CustomerGrowthRateChart />
        <SalonPerformanceRateChart />
      </div> */}
    </div>
  );
};

export default AdminPanelContainer;
