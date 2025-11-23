"use client";

import { Bell, Menu, Moon, Sun } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { logOut } from "@/Redux/Api/BaseApi";
import UserDropdown from "./UserDropdown";

interface NavBarProps {
  onMobileMenuToggle?: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ onMobileMenuToggle }) => {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();

  const handleSignOut = async () => {
    // Broadcast logout event to all tabs
    localStorage.setItem("logout-event", Date.now().toString());

    // // Clear active account from localStorage
    // localStorage.removeItem("activeAccountId");
    await logOut();

    // Perform the actual sign out
  };

  return (
    <nav className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b shadow-md backdrop-blur dark:shadow-gray-600">
      <div className="mx-auto px-4 md:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button - only visible on mobile */}
            {onMobileMenuToggle && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMobileMenuToggle}
                className="lg:hidden dark:shadow-gray-600"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            )}

            <Link href="/" className="flex items-center space-x-2">
              <div className="relative h-14 w-28">
                {/* Light logo (shown in light mode) */}
                <Image
                  src="/images/logo-light.png"
                  alt="Afrobeutic Logo"
                  fill
                  className="block object-contain dark:hidden"
                />

                {/* Dark logo (shown in dark mode) */}
                <Image
                  src="/images/logo-dark.png"
                  alt="Afrobeutic Logo"
                  fill
                  className="hidden object-contain dark:block"
                />
              </div>
            </Link>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="dark:shadow-gray-600"
            >
              <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative dark:shadow-gray-600"
            >
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs text-white">
                3
              </Badge>
              <span className="sr-only">Notifications</span>
            </Button>

            {/* User Authentication */}
            <UserDropdown
              status={status}
              session={session}
              onSignOut={handleSignOut}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;