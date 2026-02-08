"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  BadgeQuestionMark,
  Banknote,
  BookOpen,
  ChevronRight,
  CircleUserRound,
  Headphones,
  HelpCircle,
  Home,
  LifeBuoy,
  LoaderPinwheel,
  MessageSquare,
  Podcast,
  ShieldUser,
  UserCog,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { useState } from "react";

type SubNavItem = {
  label: string;
  href: string;
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

type NavItem = {
  label: string;
  href?: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children?: SubNavItem[];
};

interface SideBarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  isCollapsed?: boolean;
}

const SideBar: React.FC<SideBarProps> = ({
  isMobileOpen = false,
  onMobileClose = () => {},
  isCollapsed = false,
}) => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Get user role directly from session
  const role: string | null = session?.user?.role
    ? String(session.user.role).toUpperCase()
    : null;

  const toggleExpand = (label: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(label)) {
      newExpanded.delete(label);
    } else {
      newExpanded.add(label);
    }
    setExpandedItems(newExpanded);
  };

  // Build items based on role
  const buildItems = (): NavItem[] => {
    if (role === "MANAGEMENT_ADMIN" || role === "MANAGEMENT_STAFF") {
      return [
        { label: "Home", href: "/dashboard/admin-panel", Icon: Home },
        {
          label: "Managements",
          href: "/dashboard/admin-panel/managements",
          Icon: UserCog,
        },
        {
          label: "Customers",
          href: "/dashboard/admin-panel/customers",
          Icon: Users,
        },
        {
          label: "Accounts",
          href: "/dashboard/admin-panel/accounts",
          Icon: CircleUserRound,
        },
        {
          label: "Pricing Plans",
          href: "/dashboard/admin-panel/pricing-plans",
          Icon: Banknote,
        },
        {
          label: "Subscriptions",
          href: "/dashboard/admin-panel/subscriptions",
          Icon: Podcast,
        },
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
        {
          label: "Chatbots",
          href: "/dashboard/client-panel/chatbots",
          Icon: MessageSquare,
        },
        {
          label: "Customers",
          href: "/dashboard/client-panel/customers",
          Icon: Users,
        },
        {
          label: "Leads",
          href: "/dashboard/client-panel/leads",
          Icon: ShieldUser,
        },
        {
          label: "Enquiries",
          href: "/dashboard/client-panel/enquiries",
          Icon: BadgeQuestionMark,
        },
        // {
        //   label: "Broadcasting",
        //   href: "/dashboard/client-panel/broadcast",
        //   Icon: Megaphone,
        // },
        {
          label: "Help",
          Icon: HelpCircle,
          children: [
            {
              label: "Support",
              href: "/dashboard/client-panel/support-tickets",
              Icon: Headphones,
            },
            { label: "User Guide", href: "/user-guide", Icon: BookOpen },
          ],
        },
      ];
    }
    // empty array if no role matches
    return [];
  };

  const items = buildItems();

  // Check if any child of an item matches the current pathname
  const isChildActive = (item: NavItem): boolean => {
    if (!item.children) return false;
    return item.children.some((child) => child.href === pathname);
  };

  // Check if pathname is a child route of any parent with children
  const isChildRoute = items.some((item) => isChildActive(item));

  // Only match direct items, not parent routes when we're on a child route
  const activeHref =
    items
      .filter((it) => {
        // If we're on a child route, don't match parent items
        if (isChildRoute && it.href && pathname?.startsWith(it.href + "/")) {
          // Check if this is actually a parent of the child route
          const hasChildWithPath = items.some((parent) =>
            parent.children?.some((child) => child.href === pathname),
          );
          if (hasChildWithPath) {
            return false; // Don't highlight this parent item
          }
        }
        return (
          it.href === pathname ||
          (it.href && pathname?.startsWith(it.href + "/"))
        );
      })
      .sort((a, b) => (b.href?.length || 0) - (a.href?.length || 0))[0]?.href ??
    null;

  // Auto-expand parent items if their child is active
  const autoExpandedItems = new Set(expandedItems);
  items.forEach((item) => {
    if (isChildActive(item) && !autoExpandedItems.has(item.label)) {
      autoExpandedItems.add(item.label);
    }
  });

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
      <ul className="h-full space-y-1 bg-white p-4 shadow-md dark:bg-[#171717] dark:shadow-gray-600">
        {items.map((item) => {
          const isExpanded = autoExpandedItems.has(item.label);
          const hasChildren = item.children && item.children.length > 0;
          const active = item.href === activeHref;
          const childActive = isChildActive(item);

          return (
            <li key={item.label}>
              {hasChildren ? (
                <>
                  <button
                    onClick={() => toggleExpand(item.label)}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors ${
                      childActive || isExpanded
                        ? "bg-accent text-primary"
                        : "hover:bg-accent hover:text-accent-foreground !shadow-none"
                    }`}
                  >
                    <item.Icon className="h-5 w-5" />
                    <span className="flex-1 text-sm font-normal">
                      {item.label}
                    </span>
                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                    />
                  </button>
                  {isExpanded && (
                    <ul className="mt-1 ml-4 space-y-1 border-l border-gray-300 pl-2 dark:border-gray-600">
                      {item.children?.map((child) => {
                        const childActive = child.href === pathname;
                        return (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              onClick={onMobileClose}
                              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                                childActive
                                  ? "bg-accent text-primary shadow-md dark:shadow-gray-600"
                                  : "hover:bg-accent hover:text-accent-foreground"
                              }`}
                            >
                              {child.Icon && <child.Icon className="h-4 w-4" />}
                              {child.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </>
              ) : (
                <Link
                  href={item.href!}
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
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <>
      {/* Desktop Sidebar - hidden on small screens, visible from md and up */}
      <aside
        className={`bg-background/50 border-r ${
          isCollapsed ? "hidden md:hidden" : "hidden md:block"
        } w-56`}
      >
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
