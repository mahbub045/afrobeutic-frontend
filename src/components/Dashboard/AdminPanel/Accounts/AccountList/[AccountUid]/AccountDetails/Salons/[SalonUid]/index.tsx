"use client";
import Breadcrumbs from "@/components/Dashboard/CommonComponents/Breadcrumbs";
import { useParams } from "next/navigation";
import SalonDetails from "./SalonDetails/SalonDetails";

const SalonDetailsContainer: React.FC = () => {
  const { accountuid, salonuid } = useParams();
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard/admin-panel" },
          {
            label: "Accounts",
            href: "/dashboard/admin-panel/accounts",
          },
          {
            label: " Account Details",
            href: `/dashboard/admin-panel/accounts/${accountuid}`,
          },
          {
            label: `Salon Details`,
            href: `/dashboard/admin-panel/accounts/${accountuid}/salons/${salonuid}`,
          },
        ]}
      />
      <SalonDetails />
    </div>
  );
};

export default SalonDetailsContainer;
