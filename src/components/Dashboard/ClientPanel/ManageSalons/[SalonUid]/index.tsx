"use client";

import Breadcrumbs from "@/components/Dashboard/CommonComponents/Breadcrumbs";
import {
  BarChart2,
  Box,
  Calendar,
  Home,
  Image,
  Scissors,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import * as React from "react";
import BookingsTab from "./Tabs/BookingsTab/BookingsTab";
import ChairsTab from "./Tabs/ChairsTab/ChairsTab";
import DashboardTab from "./Tabs/DashboardTab/DashboardTab";
import EmployeesTab from "./Tabs/EmployeesTab/EmployeesTab";
import LookbookTab from "./Tabs/LookbookTab/LookbookTab";
import ProductsTab from "./Tabs/ProductsTab/ProductsTab";
import ReportTab from "./Tabs/ReportTab/ReportTab";
import ServicesTab from "./Tabs/ServicesTab/ServicesTab";
import SettingsTab from "./Tabs/SettingsTab/SettingsTab";

const SingleSalonContainer: React.FC = () => {
  const { salonuid } = useParams();

  interface MenuItemProps {
    label: string;
    href?: string;
    Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }

  const salonNavMenus: MenuItemProps[] = React.useMemo(
    () => [
      { label: "Dashboard", href: `dashboard`, Icon: Home },
      { label: "Services", href: `services`, Icon: Scissors },
      { label: "Products", href: `products`, Icon: Box },
      { label: "Chairs", href: `chairs`, Icon: ShoppingCart },
      { label: "Bookings", href: `bookings`, Icon: Calendar },
      { label: "LookBook", href: `lookbook`, Icon: Image },
      { label: "Employees", href: `employees`, Icon: Users },
      { label: "Report", href: `report`, Icon: BarChart2 },
      { label: "Settings", href: `settings`, Icon: Settings },
    ],
    [],
  );

  const pathname = usePathname();
  const [activeTab, setActiveTab] = React.useState<string>("dashboard");

  React.useEffect(() => {
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

  // Demo data for tabs (typed)
  type Service = { id: string; name: string; price: string };
  type Product = { id: string; name: string; stock: number };
  type Chair = { id: string; name: string };
  type Booking = { id: string; customer: string };
  type LookBook = { id: string; title: string };
  type Employee = { id: string; name: string };

  const demo = React.useMemo(
    () => ({
      dashboard: {
        title: "Overview",
        content: "Summary metrics and quick links.",
      },
      services: {
        title: "Services",
        items: [
          { id: "s1", name: "Haircut", price: "$15" },
          { id: "s2", name: "Shave", price: "$10" },
        ] as Service[],
      },
      products: {
        title: "Products",
        items: [
          { id: "p1", name: "Shampoo", stock: 32 },
          { id: "p2", name: "Conditioner", stock: 12 },
        ] as Product[],
      },
      chairs: {
        title: "Chairs",
        items: [{ id: "c1", name: "Chair 1" }] as Chair[],
      },
      bookings: {
        title: "Bookings",
        items: [{ id: "b1", customer: "John Doe" }] as Booking[],
      },
      lookbook: {
        title: "LookBook",
        items: [{ id: "l1", title: "Summer" }] as LookBook[],
      },
      employees: {
        title: "Employees",
        items: [{ id: "e1", name: "Jane" }] as Employee[],
      },
      report: { title: "Report", content: "Sales and usage reports." },
      settings: {
        title: "Settings",
        content: "Salon settings and preferences.",
      },
    }),
    [] as const,
  );

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
            label: "Single Salon",
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
              className={`inline-flex items-center gap-2 rounded-md border px-3 py-1 text-sm shadow-md dark:shadow-gray-600 ${
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
        {activeTab === "services" && (
          <ServicesTab items={demo.services.items} />
        )}
        {activeTab === "products" && (
          <ProductsTab items={demo.products.items} />
        )}
        {activeTab === "chairs" && <ChairsTab items={demo.chairs.items} />}
        {activeTab === "bookings" && (
          <BookingsTab items={demo.bookings.items} />
        )}
        {activeTab === "lookbook" && (
          <LookbookTab items={demo.lookbook.items} />
        )}
        {activeTab === "employees" && (
          <EmployeesTab items={demo.employees.items} />
        )}
        {activeTab === "report" && (
          <ReportTab title={demo.report.title} content={demo.report.content} />
        )}
        {activeTab === "settings" && (
          <SettingsTab
            title={demo.settings.title}
            content={demo.settings.content}
          />
        )}
      </section>
    </div>
  );
};

export default SingleSalonContainer;
