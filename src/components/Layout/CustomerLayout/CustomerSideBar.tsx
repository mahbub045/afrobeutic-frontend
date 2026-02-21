"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Home, LogOut, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface SideBarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const CUSTOMER_TOKEN_KEY = "customer_token";

export default function CustomerSideBar({
  isMobileOpen = false,
  onMobileClose = () => {},
}: SideBarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const items = [
    { label: "Bookings", href: "/customer/bookings", Icon: Home },
    { label: "Profile", href: "/customer/profile", Icon: User },
  ];

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(CUSTOMER_TOKEN_KEY);
      // Broadcast logout event for other tabs
      localStorage.setItem("logout-event", Date.now().toString());
    }
    // Close mobile sheet first
    onMobileClose?.();
    router.replace("/auth/customer-login");
  };

  const renderNav = () => (
    <ul className="h-full space-y-1 bg-white p-4 shadow-md dark:bg-[#171717] dark:shadow-gray-600">
      {items.map((item) => {
        const active =
          item.href === pathname || pathname?.startsWith(item.href + "/");
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onMobileClose}
              className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
                active
                  ? "bg-accent text-primary shadow-md dark:shadow-gray-600"
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <item.Icon className="h-5 w-5" />
              <span className="text-sm">{item.label}</span>
            </Link>
          </li>
        );
      })}

      <li>
        <button
          type="button"
          onClick={handleLogout}
          className="hover:bg-accent hover:text-accent-foreground text-danger flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm">Log out</span>
        </button>
      </li>
    </ul>
  );

  return (
    <>
      <aside className="hidden w-56 md:block">
        <nav className="fixed top-16 h-[calc(100vh-4rem)] w-56 overflow-auto">
          {renderNav()}
        </nav>
      </aside>

      <Sheet open={isMobileOpen} onOpenChange={onMobileClose}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="border-b p-4">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="h-[calc(100vh-5rem)] overflow-auto">
            {renderNav()}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
