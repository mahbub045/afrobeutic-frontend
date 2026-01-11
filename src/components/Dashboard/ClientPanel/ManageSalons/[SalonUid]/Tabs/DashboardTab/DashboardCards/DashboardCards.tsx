import { DashboardTabProps } from "@/Types/ClientPanel/ManageSalonTypes/SalonListType";
import { useSession } from "next-auth/react";
import BasicInformationCard from "./BasicInformationCard/BasicInformationCard";
import ContactsCard from "./ContactsCard/ContactsCard";
import EmployeesCard from "./EmployeesCard/EmployeesCard";
import ServicesCard from "./ServicesCard/ServicesCard";

const DashboardCards: React.FC<DashboardTabProps> = ({
  singleSalonData,
  isLoading,
  isError,
}) => {
  const { data: session } = useSession();
  return (
    <>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BasicInformationCard
          singleSalonData={singleSalonData}
          isLoading={isLoading}
          isError={isError}
        />
        <ContactsCard
          singleSalonData={singleSalonData}
          isLoading={isLoading}
          isError={isError}
        />
      </div>
      <div
        className={`mt-6 grid grid-cols-1 gap-6 ${
          session?.user?.account_type === "INDIVIDUAL_STYLIST"
            ? ""
            : "lg:grid-cols-2"
        }`}
      >
        <ServicesCard />
        {session?.user?.account_type === "INDIVIDUAL_STYLIST" ? null : (
          <EmployeesCard />
        )}
      </div>
    </>
  );
};

export default DashboardCards;
