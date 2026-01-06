"use client";
import Revenue from "./Revenue/Revenue";
import ServiceRevenue from "./ServiceRevenue/ServiceRevenue";

const AnalyticsTab: React.FC = () => {
  return (
    <div>
      <div>
        <Revenue />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2">
        <ServiceRevenue />
      </div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

export default AnalyticsTab;
