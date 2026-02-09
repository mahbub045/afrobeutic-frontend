"use client";

import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

interface NavBarProps {
  onMobileMenuToggle?: () => void;
}

const CUSTOMER_TOKEN_KEY = "customer_token";

export default function CustomerNavBar({ onMobileMenuToggle }: NavBarProps) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(CUSTOMER_TOKEN_KEY);
      // Broadcast logout for other tabs if desired
      localStorage.setItem("logout-event", Date.now().toString());
    }
    router.replace("/auth/customer-login");
  };

  return (
    <nav className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b shadow-md backdrop-blur dark:shadow-gray-600">
      <div className="mx-auto px-4 md:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            {onMobileMenuToggle && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMobileMenuToggle}
                className="md:hidden"
              >
                <Menu className="text-primary h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            )}

            <Link href="/" className="flex items-center space-x-2">
              <div className="relative h-12 w-32">
                <Image
                  src="/images/logo-dark.png"
                  alt="Afrobeutic"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            <Button variant="outline" onClick={handleLogout} className="ml-2">
              Log out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
