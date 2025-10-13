import BasicInformationCard from "./BasicInformationCard/BasicInformationCard";
import ContactsCard from "./ContactsCard/ContactsCard";

const DashboardCards: React.FC = () => {
  return (
    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
      <BasicInformationCard />
      <ContactsCard />
    </div>
  );
};

export default DashboardCards;
