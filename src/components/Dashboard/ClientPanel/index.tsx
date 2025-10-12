import Breadcrumbs from "../CommonComponents/Breadcrumbs";
import WelcomeMessage from "../CommonComponents/WelcomeMessage";

const ClientPanelContainer: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
      <Breadcrumbs
        items={[{ label: "Home", href: "/dashboard/client-panel" }]}
      />
      <WelcomeMessage />
    </div>
  );
};

export default ClientPanelContainer;
