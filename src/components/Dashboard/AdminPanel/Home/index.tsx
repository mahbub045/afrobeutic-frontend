"use client";
import Breadcrumbs from "../../CommonComponents/Breadcrumbs";
import WelcomeMessage from "../../CommonComponents/WelcomeMessage";
import CustomerGrowthRateChart from "./CustomerGRAndSalonPerformanceRate/CustomerGrowthRateChart";
import SalonPerformanceRateChart from "./CustomerGRAndSalonPerformanceRate/SalonPerformanceRateChart";
import Overview from "./Overview/Overview";

const AdminPanelContainer: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
      <Breadcrumbs
        items={[{ label: "Home", href: "/dashboard/admin-panel" }]}
      />
      <WelcomeMessage />
      <Overview />
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CustomerGrowthRateChart />
        <SalonPerformanceRateChart />
      </div>
    </div>
  );
};

export default AdminPanelContainer;
