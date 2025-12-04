"use client";
import { ActiveAccountBanner } from "../../CommonComponents/ActiveAccountBanner";
import Breadcrumbs from "../../CommonComponents/Breadcrumbs";
import WelcomeMessage from "../../CommonComponents/WelcomeMessage";
import OthersInfo from "./OthersInfo/OthersInfo";
import Overview from "./Overview/Overview";
import SalonsAndChatBotsCard from "./SalonsAndChatBotsCard/SalonsAndChatBotsCard";

const ClientPanelContainer: React.FC = () => {
  return (
    <div>
      <Breadcrumbs
        items={[{ label: "Home", href: "/dashboard/client-panel" }]}
      />
      <ActiveAccountBanner />
      <WelcomeMessage />
      <Overview />
      <OthersInfo />
      <SalonsAndChatBotsCard />
    </div>
  );
};

export default ClientPanelContainer;
