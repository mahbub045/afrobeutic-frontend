"use client";
import ProductRevenue from "./ProductRevenue/ProductRevenue";
import Revenue from "./Revenue/Revenue";
import ServiceRevenue from "./ServiceRevenue/ServiceRevenue";
import ServicesRevenue from "./ServicesRevenue/ServicesRevenue";

const AnalyticsTab: React.FC = () => {
  return (
    <div>
      <div>
        <Revenue />
      </div>
      <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2">
        <ServiceRevenue />
        <ProductRevenue />
      </div>
      <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2">
        <ServicesRevenue />
        <ProductRevenue />
      </div>
    </div>
  );
};

export default AnalyticsTab;
