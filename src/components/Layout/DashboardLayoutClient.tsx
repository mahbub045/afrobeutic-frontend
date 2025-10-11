"use client";

import { useState } from "react";
import Footer from "./Footer";
import NavBar from "./NavBar";
import SideBar from "./SideBar";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
}

export default function DashboardLayoutClient({
  children,
}: DashboardLayoutClientProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="bg-background min-h-screen">
      <NavBar onMobileMenuToggle={handleMobileMenuToggle} />
      <div className="flex h-screen">
        <SideBar
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={handleMobileMenuClose}
        />
        {/* Main content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
