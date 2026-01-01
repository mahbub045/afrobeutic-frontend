"use client";

import { useState } from "react";
import Footer from "./Footer/Footer";

import NavBar from "./NavBar/NavBar";
import SideBar from "./SideBar/SideBar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayoutComponent({
  children,
}: DashboardLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleMobileMenuToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileSidebarOpen(false);
  };

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className="bg-background min-h-screen">
      <NavBar
        onMobileMenuToggle={handleMobileMenuToggle}
        onSidebarToggle={handleSidebarToggle}
        isSidebarCollapsed={isSidebarCollapsed}
      />
      <div className="flex">
        <SideBar
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={handleMobileMenuClose}
          isCollapsed={isSidebarCollapsed}
        />
        {/* Main content */}
        <main className="mx-auto min-h-screen flex-1 space-y-6 overflow-y-auto px-4 py-6 md:px-6 lg:px-8">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
