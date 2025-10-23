import { DashboardTabProps } from "@/Types/ClientPanel/ManageSalonTypes/SalonListType";
import BasicInformationCard from "./BasicInformationCard/BasicInformationCard";
import ContactsCard from "./ContactsCard/ContactsCard";
import EmployeesCard from "./EmployeesCard/EmployeesCard";
import ServicesCard from "./ServicesCard/ServicesCard";

const DashboardCards: React.FC<DashboardTabProps> = ({
  singleSalonData,
  isLoading,
  isError,
}) => {
  return (
    <>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <BasicInformationCard singleSalonData={singleSalonData} isLoading={isLoading} isError={isError} />
        <ContactsCard singleSalonData={singleSalonData} isLoading={isLoading} isError={isError} />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <ServicesCard />
        <EmployeesCard />
      </div>
    </>
  );
};

export default DashboardCards;
