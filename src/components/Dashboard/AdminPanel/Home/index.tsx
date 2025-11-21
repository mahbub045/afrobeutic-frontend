"use client";
import Breadcrumbs from "../../CommonComponents/Breadcrumbs";
import Test from "../Accounts/Test";

const AdminPanelContainer: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
      <Breadcrumbs
        items={[{ label: "Home", href: "/dashboard/admin-panel" }]}
      />
      {/* <ActiveAccountBanner />
      <WelcomeMessage />
      <Overview />
      <OthersInfo />
      <SalonsAndChatBotsCard /> */}
      <Test />
    </div>
  );
};

export default AdminPanelContainer;
