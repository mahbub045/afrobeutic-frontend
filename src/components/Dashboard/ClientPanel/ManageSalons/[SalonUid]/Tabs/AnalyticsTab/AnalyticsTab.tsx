"use client";
import { useSession } from "next-auth/react";
import ByMonth from "./ByMonth/ByMonth";
import CustomerAnalysis from "./CustomerAnalysis/CustomerAnalysis";
import PeakDays from "./PeakDays/PeakDays";
import PeakHours from "./PeakHours/PeakHours";
import ProductCategoriesRevenue from "./ProductCategoriesRevenue/ProductCategoriesRevenue";
import ProductSales from "./ProductSales/ProductSales";
import ProductsRevenue from "./ProductsRevenue/ProductsRevenue";
import Revenue from "./Revenue/Revenue";
import ServiceCategoriesRevenue from "./ServiceCategoriesRevenue/ServiceCategoriesRevenue";
import ServicesPerformance from "./ServicesPerformance/ServicesPerformance";
import ServicesRevenue from "./ServicesRevenue/ServicesRevenue";
import StaffPerformance from "./StaffPerformance/StaffPerformance";

const AnalyticsTab: React.FC = () => {
  const { data: session } = useSession();
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
      <div className="mt-10">
        <h3 className="text-xl font-semibold md:text-2xl">
          Appointments Distribution
        </h3>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-2">
        <ByMonth />
        <PeakHours />
      </div>
      <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2">
        <PeakDays />
        <CustomerAnalysis />
      </div>
      {session?.user?.account_type === "INDIVIDUAL_STYLIST" ? null : (
        <div className="mt-10 grid grid-cols-1">
          <StaffPerformance />
        </div>
      )}
      <div className="mt-10 grid grid-cols-1">
        <ServicesPerformance />
      </div>
      <div className="mt-10 grid grid-cols-1">
        <ProductSales />
      </div>
    </div>
  );
};

export default AnalyticsTab;
