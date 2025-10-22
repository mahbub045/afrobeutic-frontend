"use client";
import { useGetSingleSalonDataQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/SingleSalon/SingleSalonApi";
import { useParams } from "next/navigation";
import * as React from "react";
import DashboardCards from "./DashboardCards/DashboardCards";
import SalonOverview from "./SalonOverview/SalonOverview";

const DashboardTab: React.FC = () => {
  const params = useParams();
  const { salonuid } = params;
  // RTK Hooks
  const {
    data: singleSalonData,
    isLoading,
    isError,
  } = useGetSingleSalonDataQuery({ salonUid: salonuid });

  return (
    <div>
      <SalonOverview />
      <DashboardCards
        singleSalonData={singleSalonData}
        isLoading={isLoading}
        isError={isError}
      />
    </div>
  );
};

export default DashboardTab;
