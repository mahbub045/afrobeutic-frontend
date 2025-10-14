"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Calendar,
  HelpCircle,
  Home,
  LifeBuoy,
  LoaderPinwheel,
  Megaphone,
  MessageSquare,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";

type NavItem = {
  label: string;
  href: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

interface SideBarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const SideBar: React.FC<SideBarProps> = ({
  isMobileOpen = false,
  onMobileClose = () => {},
}) => {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Get user role directly from session
  const role: string | null = session?.user?.role
    ? String(session.user.role).toUpperCase()
    : null;

  // Build items based on role
  const buildItems = (): NavItem[] => {
    if (role === "MANAGEMENT_ADMIN" || role === "MANAGEMENT_STAFF") {
      return [
        { label: "Home", href: "/dashboard/admin-panel", Icon: Home },
        {
          label: "Manage Salons",
          href: "/dashboard/admin-panel/manage-salons",
          Icon: LifeBuoy,
        },
        { label: "Clients", href: "/dashboard/clients", Icon: Users },
        {
          label: "Client Requests",
          href: "/dashboard/requests",
          Icon: Calendar,
        },
        { label: "Help", href: "/help", Icon: HelpCircle },
      ];
    }

    if (role === "OWNER" || role === "ADMIN" || role === "STAFF") {
      return [
        { label: "Home", href: "/dashboard/client-panel", Icon: Home },
        {
          label: "Manage Salons",
          href: "/dashboard/client-panel/manage-salons",
          Icon: LifeBuoy,
        },
        { label: "Chatbots", href: "/dashboard/chatbots", Icon: MessageSquare },
        { label: "Clients", href: "/dashboard/clients", Icon: Users },
        {
          label: "Client Requests",
          href: "/dashboard/requests",
          Icon: Calendar,
        },
        {
          label: "Broadcasting",
          href: "/dashboard/broadcast",
          Icon: Megaphone,
        },
        { label: "Help", href: "/help", Icon: HelpCircle },
      ];
    }

    // Default: return empty array if no role matches
    return [];
  };

  const items = buildItems();

  // Find the most specific matching nav item (longest href) to avoid highlighting both parent and child
  const activeHref =
    items
      .filter(
        (it) => pathname === it.href || pathname?.startsWith(it.href + "/"),
      )
      .sort((a, b) => b.href.length - a.href.length)[0]?.href ?? null;

  // Render navigation content
  const renderNavContent = () => {
    if (status === "loading") {
      return (
        <div
          role="status"
          aria-busy="true"
          className="flex h-full w-full items-center justify-center"
        >
          <LoaderPinwheel className="h-8 w-8 animate-spin" aria-hidden="true" />
          <span className="sr-only">Loading sidebar…</span>
        </div>
      );
    }

    return (
      <ul className="space-y-1 p-4">
        {items.map((item) => {
          const active = item.href === activeHref;
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
      </ul>
    );
  };

  return (
    <>
      {/* Desktop Sidebar - hidden on small screens, visible from md and up */}
      <aside className="bg-background/50 hidden w-56 border-r md:block">
        <nav className="fixed top-16 h-[calc(100vh-4rem)] w-56 overflow-auto">
          {renderNavContent()}
        </nav>
      </aside>

      {/* Mobile Sidebar - Sheet component for mobile devices */}
      <Sheet open={isMobileOpen} onOpenChange={onMobileClose}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="border-b p-4">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="h-[calc(100vh-5rem)] overflow-auto">
            {renderNavContent()}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default SideBar;
