import Breadcrumbs from "@/components/Dashboard/CommonComponents/Breadcrumbs";
import { usePassMetaConfigInfoMutation } from "@/Redux/Reducers/ClientPanel/Accounts/MetaConfiguration/MetaConfigurationApi";

const MetaConfigurationContainer: React.FC = () => {
  const [metaConfig, { isLoading: isMetaConfigLoading }] =
    usePassMetaConfigInfoMutation();
    
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard/client-panel" },
          {
            label: "Meta Configuration",
            href: "/dashboard/client-panel/accounts/meta-configuration",
          },
        ]}
      />
    </div>
  );
};

export default MetaConfigurationContainer;
