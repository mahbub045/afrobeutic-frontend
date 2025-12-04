"use client";

import { useState } from "react";
import Footer from "./Footer/Footer";

import NavBar from "./NavBar/NavBar";
import SideBar from "./SideBar/SideBar";

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
      <div className="flex">
        <SideBar
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={handleMobileMenuClose}
        />
        {/* Main content */}
        <main className="container mx-auto min-h-screen flex-1 space-y-6 overflow-y-auto px-4 py-6 md:px-6 lg:px-8">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
