"use client";
import * as React from "react";
import DashboardCards from "./DashboardCards/DashboardCards";
import SalonOverview from "./SalonOverview/SalonOverview";

const DashboardTab: React.FC = () => {
  return (
    <div>
      <SalonOverview />
      <DashboardCards />
    </div>
  );
};

export default DashboardTab;
