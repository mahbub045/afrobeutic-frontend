"use client";
import ProductRevenue from "./ProductRevenue/ProductRevenue";
import Revenue from "./Revenue/Revenue";
import ServiceRevenue from "./ServiceRevenue/ServiceRevenue";

const AnalyticsTab: React.FC = () => {
  return (
    <div>
      <div>
        <Revenue />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <ServiceRevenue />
        <ProductRevenue />
      </div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

export default AnalyticsTab;
