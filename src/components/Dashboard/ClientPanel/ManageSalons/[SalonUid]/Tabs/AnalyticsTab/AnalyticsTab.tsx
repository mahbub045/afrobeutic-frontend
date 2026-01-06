"use client";
import ProductRevenue from "./ProductRevenue/ProductRevenue";
import ProductsRevenue from "./ProductsRevenue/ProductsRevenue";
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
        <ProductsRevenue />
      </div>
    </div>
  );
};

export default AnalyticsTab;
