"use client";

import Breadcrumbs from "@/components/Dashboard/CommonComponents/Breadcrumbs";
import {
  Armchair,
  BarChart2,
  Box,
  Calendar,
  Clock,
  Home,
  Image,
  MessageCircle,
  Scissors,
  Settings,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AnalyticsTab from "./Tabs/AnalyticsTab/AnalyticsTab";
import BookingsTab from "./Tabs/BookingsTab/BookingsTab";
import ChairsTab from "./Tabs/ChairsTab/ChairsTab";
import DashboardTab from "./Tabs/DashboardTab/DashboardTab";
import EmployeesTab from "./Tabs/EmployeesTab/EmployeesTab";
import IndividualBookingsTab from "./Tabs/IndividualBookingsTab/IndividualBookingsTab";
import LookbookTab from "./Tabs/LookbookTab/LookbookTab";
import MessagesTab from "./Tabs/Messages/MessagesTab";
import OpeningHoursTab from "./Tabs/OpeningHoursTab/OpeningHoursTab";
import ProductsTab from "./Tabs/ProductsTab/ProductsTab";
import ServicesTab from "./Tabs/ServicesTab/ServicesTab";
import SettingsTab from "./Tabs/SettingsTab/SettingsTab";

const SingleSalonContainer: React.FC = () => {
  const { salonuid } = useParams();
  const { data: session } = useSession();

  interface MenuItemProps {
    label: string;
    href?: string;
    Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }

  const salonNavMenus: MenuItemProps[] = useMemo(
    () => [
      { label: "Dashboard", href: `dashboard`, Icon: Home },
      { label: "Opening Hours", href: `opening-hours`, Icon: Clock },
      { label: "Services", href: `services`, Icon: Scissors },
      { label: "Products", href: `products`, Icon: Box },
      ...(session?.user?.account_type !== "INDIVIDUAL_STYLIST"
        ? [
            { label: "Chairs", href: `chairs`, Icon: Armchair },
            { label: "Bookings", href: `bookings`, Icon: Calendar },
          ]
        : []),
      ...(session?.user?.account_type === "INDIVIDUAL_STYLIST"
        ? [{ label: "Bookings", href: `indBookings`, Icon: Calendar }]
        : []),

      { label: "Lookbooks", href: `lookbooks`, Icon: Image },
      { label: "Employees", href: `employees`, Icon: Users },
      { label: "Messages", href: `messages`, Icon: MessageCircle },
      { label: "Analytics", href: `analytics`, Icon: BarChart2 },
      { label: "Settings", href: `settings`, Icon: Settings },
    ],
    [session?.user?.account_type],
  );

  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  useEffect(() => {
    // Prefer URL hash (e.g. #services), fallback to last pathname segment
    const update = () => {
      const hash =
        typeof window !== "undefined" ? window.location.hash.slice(1) : "";
      if (hash) {
        setActiveTab(hash);
        return;
      }
      const seg =
        (pathname ?? "").split("/").filter(Boolean).pop() ?? "dashboard";
      // if seg matches any menu href, set it; otherwise default to dashboard
      setActiveTab(
        salonNavMenus.some((m) => m.href === seg) ? seg : "dashboard",
      );
    };

    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, [pathname, salonNavMenus]);

  return (
    <div>
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
          const isActive = menu.href ? activeTab === menu.href : false;
          return (
            <a
              key={menu.href}
              href={menu.href ? `#${menu.href}` : undefined}
              className={`inline-flex items-center gap-2 rounded-md border px-2 py-1 text-sm shadow-md dark:shadow-gray-600 ${
                isActive
                  ? "bg-primary border-primary text-white"
                  : "border-primary/40 bg-primary/5 text-primary hover:bg-primary/10"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {Icon ? <Icon className="h-4 w-4" /> : null}
              <span>{menu.label}</span>
            </a>
          );
        })}
      </nav>
      {/* Tab content area */}
      <section className="mt-6">
        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "opening-hours" && <OpeningHoursTab />}
        {activeTab === "services" && <ServicesTab />}
        {activeTab === "products" && <ProductsTab />}
        {session?.user?.account_type !== "INDIVIDUAL_STYLIST" &&
          activeTab === "chairs" && <ChairsTab />}
        {session?.user?.account_type !== "INDIVIDUAL_STYLIST" &&
          activeTab === "bookings" && <BookingsTab />}
        {session?.user?.account_type === "INDIVIDUAL_STYLIST" &&
          activeTab === "indBookings" && <IndividualBookingsTab />}
        {activeTab === "lookbooks" && <LookbookTab />}
        {activeTab === "employees" && <EmployeesTab />}
        {activeTab === "messages" && <MessagesTab />}
        {activeTab === "analytics" && <AnalyticsTab />}
        {activeTab === "settings" && <SettingsTab />}
      </section>
    </div>
  );
};

export default SingleSalonContainer;
