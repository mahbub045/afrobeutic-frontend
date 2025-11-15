"use client";

import Breadcrumbs from "@/components/Dashboard/CommonComponents/Breadcrumbs";
import { setActiveTab, hydrateFromLocalStorage } from "@/Redux/Reducers/ClientPanel/ManageSalons/SingleSalon/singleSalonSlice";
import {
  Armchair,
  BarChart2,
  Box,
  Calendar,
  Clock,
  Home,
  Image,
  Scissors,
  Settings,
  Users,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/Redux/Reducers/Store";
import AnalyticsTab from "./Tabs/AnalyticsTab/AnalyticsTab";
import BookingsTab from "./Tabs/BookingsTab/BookingsTab";
import ChairsTab from "./Tabs/ChairsTab/ChairsTab";
import DashboardTab from "./Tabs/DashboardTab/DashboardTab";
import EmployeesTab from "./Tabs/EmployeesTab/EmployeesTab";
import LookbookTab from "./Tabs/LookbookTab/LookbookTab";
import OpeningHoursTab from "./Tabs/OpeningHoursTab/OpeningHoursTab";
import ProductsTab from "./Tabs/ProductsTab/ProductsTab";
import ServicesTab from "./Tabs/ServicesTab/ServicesTab";
import SettingsTab from "./Tabs/SettingsTab/SettingsTab";

const SingleSalonContainer: React.FC = () => {
  const { salonuid } = useParams();
  const dispatch = useDispatch();
  const activeTab = useSelector((state: RootState) => state.singleSalon.activeTab);
  const isHydrated = useSelector((state: RootState) => state.singleSalon.isHydrated);

  interface MenuItemProps {
    label: string;
    tabName: string;
    Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }

  const salonNavMenus: MenuItemProps[] = useMemo(
    () => [
      { label: "Dashboard", tabName: "dashboard", Icon: Home },
      { label: "Opening Hours", tabName: "opening-hours", Icon: Clock },
      { label: "Services", tabName: "services", Icon: Scissors },
      { label: "Products", tabName: "products", Icon: Box },
      { label: "Chairs", tabName: "chairs", Icon: Armchair },
      { label: "Bookings", tabName: "bookings", Icon: Calendar },
      { label: "Lookbooks", tabName: "lookbooks", Icon: Image },
      { label: "Employees", tabName: "employees", Icon: Users },
      { label: "Analytics", tabName: "analytics", Icon: BarChart2 },
      { label: "Settings", tabName: "settings", Icon: Settings },
    ],
    [],
  );

  // Hydrate from localStorage on mount
  useEffect(() => {
    dispatch(hydrateFromLocalStorage());
  }, [dispatch]);

  const handleTabClick = (tabName: string) => {
    dispatch(setActiveTab(tabName));
  };

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard/client-panel" },
          {
            label: "Manage Salons",
            href: "/dashboard/client-panel/manage-salons",
          },
          {
            label: "Salon Details",
            href: `/dashboard/client-panel/manage-salons/${salonuid}`,
          },
        ]}
      />
      {/* Horizontal pill menu below breadcrumbs */}
      <nav className="mt-4 mb-4 flex flex-wrap items-center justify-center gap-2">
        {salonNavMenus.map((menu) => {
          const Icon = menu.Icon;
          const isActive = activeTab === menu.tabName;
          return (
            <button
              key={menu.tabName}
              onClick={() => handleTabClick(menu.tabName)}
              className={`inline-flex items-center gap-2 rounded-md border px-2 py-1 text-sm shadow-md dark:shadow-gray-600 transition-colors ${
                isActive
                  ? "bg-primary border-primary text-white"
                  : "border-primary/40 bg-primary/5 text-primary hover:bg-primary/10"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {Icon ? <Icon className="h-4 w-4" /> : null}
              <span>{menu.label}</span>
            </button>
          );
        })}
      </nav>
      {/* Tab content area */}
      <section className="mt-6">
        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "opening-hours" && <OpeningHoursTab />}
        {activeTab === "services" && <ServicesTab />}
        {activeTab === "products" && <ProductsTab />}
        {activeTab === "chairs" && <ChairsTab />}
        {activeTab === "bookings" && <BookingsTab />}
        {activeTab === "lookbooks" && <LookbookTab />}
        {activeTab === "employees" && <EmployeesTab />}
        {activeTab === "analytics" && <AnalyticsTab />}
        {activeTab === "settings" && <SettingsTab />}
      </section>
    </div>
  );
};

export default SingleSalonContainer;
