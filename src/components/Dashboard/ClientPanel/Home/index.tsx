"use client";
import Breadcrumbs from "../../CommonComponents/Breadcrumbs";
import WelcomeMessage from "../../CommonComponents/WelcomeMessage";
import OthersInfo from "./OthersInfo/OthersInfo";
import Overview from "./Overview/Overview";
import SalonsAndChatBotsCard from "./SalonsAndChatBotsCard/SalonsAndChatBotsCard";

const ClientPanelContainer: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
      <Breadcrumbs
        items={[{ label: "Home", href: "/dashboard/client-panel" }]}
      />
      <WelcomeMessage />
      <Overview />
      <OthersInfo />
      <SalonsAndChatBotsCard />
    </div>
  );
};

export default ClientPanelContainer;
