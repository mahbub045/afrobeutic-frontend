"use client";
import Breadcrumbs from "../../CommonComponents/Breadcrumbs";
import WelcomeMessage from "../../CommonComponents/WelcomeMessage";
import Overview from "./Overview/Overview";

const AdminPanelContainer: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
      <Breadcrumbs
        items={[{ label: "Home", href: "/dashboard/admin-panel" }]}
      />
      <WelcomeMessage />
      <Overview />
    </div>
  );
};

export default AdminPanelContainer;
