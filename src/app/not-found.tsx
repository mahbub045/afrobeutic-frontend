"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, HelpCircle, Home, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleGoHome = () => {
    router.push("/");
  };

  const handleGoBack = () => {
    router.back();
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="from-background via-muted/10 to-accent/5 flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
      <div className="w-full max-w-2xl">
        <Card className="relative border-2 shadow-xl">
          {/* Theme Toggle Button */}
          <div className="absolute top-4 right-4 z-10">
            <button
              type="button"
              onClick={toggleTheme}
              className="cursor-pointer rounded-md bg-gray-100/60 p-2 text-gray-800 transition hover:bg-gray-100/80 dark:bg-gray-700/60 dark:text-gray-100 dark:hover:bg-gray-700/80"
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          </div>

          <CardHeader className="space-y-6 pb-8 text-center">
            {/* 404 Number */}
            <div className="relative">
              <h1 className="text-muted-foreground/20 text-9xl font-bold select-none">
                404
              </h1>
              <div className="absolute inset-0 flex items-center justify-center">
                <HelpCircle className="text-muted-foreground/60 h-24 w-24" />
              </div>
            </div>

            <div className="space-y-2">
              <CardTitle className="text-foreground text-3xl font-bold">
                Page Not Found
              </CardTitle>
              <CardDescription className="mx-auto max-w-md text-lg">
                Sorry, we couldn&apos;t find the page you&apos;re looking for.
                It might have been moved, deleted, or you entered the wrong URL.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Action Buttons */}
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                onClick={handleGoHome}
                size="lg"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Go to Homepage
              </Button>

              <Button
                onClick={handleGoBack}
                variant="outline"
                size="lg"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
            </div>

            {/* Help Section */}
            <div className="space-y-4 text-center">
              <div className="space-y-2">
                <h4 className="text-foreground font-medium">Need Help?</h4>
                <p className="text-muted-foreground text-sm">
                  If you believe this is an error, please contact our support
                  team.
                </p>
              </div>

              <div className="flex flex-col justify-center gap-2 text-sm sm:flex-row">
                <Button
                  variant="link"
                  className="text-primary h-auto p-0 hover:underline"
                  onClick={() => router.push("/contact")}
                >
                  Contact Support
                </Button>
                <span className="text-muted-foreground hidden sm:inline">
                  •
                </span>
                <Button
                  variant="link"
                  className="text-primary h-auto p-0 hover:underline"
                  onClick={() =>
                    (window.location.href = "mailto:support@afrobeutic.com")
                  }
                >
                  Email Us
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-xs">
            Error Code: 404 • Page Not Found • {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
