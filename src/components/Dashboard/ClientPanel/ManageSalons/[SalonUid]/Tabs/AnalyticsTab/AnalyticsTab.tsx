"use client";
import Bookings from "./Bookings/Bookings";
import CustomerAnalysis from "./CustomerAnalysis/CustomerAnalysis";
import PeakDaysWeek from "./PeakDaysWeek/PeakDaysWeek";
import PeakHours from "./PeakHours/PeakHours";
import ProductCategoriesRevenue from "./ProductCategoriesRevenue/ProductCategoriesRevenue";
import ProductsRevenue from "./ProductsRevenue/ProductsRevenue";
import Revenue from "./Revenue/Revenue";
import ServiceCategoriesRevenue from "./ServiceCategoriesRevenue/ServiceCategoriesRevenue";
import ServicesRevenue from "./ServicesRevenue/ServicesRevenue";

const AnalyticsTab: React.FC = () => {
  return (
    <div>
      <div>
        <Revenue />
      </div>
      <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2">
        <ServiceCategoriesRevenue />
        <ProductCategoriesRevenue />
      </div>
      <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2">
        <ServicesRevenue />
        <ProductsRevenue />
      </div>
      <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2">
        <Bookings />
        <PeakHours />
      </div>
      <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2">
        <PeakDaysWeek />
        <CustomerAnalysis />
      </div>
    </div>
  );
};

export default AnalyticsTab;
