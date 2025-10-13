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
      <nav className="mt-4 mb-4 flex flex-wrap items-center gap-2">
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
      <h1>Single Salon Page</h1>
      <p>This is a placeholder for the single salon details page.</p>
    </div>
  );
};

export default SingleSalonContainer;
