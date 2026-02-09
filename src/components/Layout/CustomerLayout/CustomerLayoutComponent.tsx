"use client";

import { LoaderPinwheel } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CustomerFooter from "./CustomerFooter";
import CustomerNavBar from "./CustomerNavBar";
import CustomerSideBar from "./CustomerSideBar";

interface CustomerLayoutProps {
  children: React.ReactNode;
}

const CUSTOMER_TOKEN_KEY = "customer_token";

export default function CustomerLayoutComponent({
  children,
}: CustomerLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const router = useRouter();

  const handleMobileMenuToggle = () => setIsMobileSidebarOpen((s) => !s);
  const handleMobileMenuClose = () => setIsMobileSidebarOpen(false);

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem(CUSTOMER_TOKEN_KEY)
        : null;

    if (!token) {
      router.replace("/auth/customer-login");
    } else {
      setAuthChecking(false);
    }
  }, [router]);

  if (authChecking) {
    return (
      <div className="grid min-h-screen place-items-center bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center gap-2">
          <LoaderPinwheel className="h-6 w-6 animate-spin" />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Checking authentication…
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <CustomerNavBar onMobileMenuToggle={handleMobileMenuToggle} />
      <div className="flex">
        <CustomerSideBar
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={handleMobileMenuClose}
        />

        <main className="mx-auto min-h-screen flex-1 space-y-6 overflow-y-auto px-4 py-6 md:px-6 lg:px-8">
          {children}
        </main>
      </div>
      <CustomerFooter />
    </div>
  );
}
