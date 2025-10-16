"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

export default function Unauthorized() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleSignIn = async () => {
    router.push("/auth/login");
  };

  const handleGoHome = () => {
    router.push("/");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-[#050816] dark:via-[#071020] dark:to-[#000000]">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -left-32 h-96 w-96 rounded-full bg-gradient-to-tr from-blue-700/40 to-indigo-600/30 opacity-60 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 -bottom-24 h-96 w-96 rounded-full bg-gradient-to-br from-purple-700/30 to-pink-600/20 opacity-50 blur-3xl" />

      <Card className="relative mx-4 w-full max-w-md rounded-2xl border border-gray-200/20 bg-white/60 px-8 py-12 text-center shadow-md backdrop-blur-sm dark:border-white/6 dark:bg-white/4 dark:shadow-gray-600">
        <div className="absolute top-4 right-4">
          <button
            type="button"
            onClick={toggleTheme}
            className={`rounded-md p-2 transition ${
              theme === "dark"
                ? "!bg-white/6 !text-white/90 hover:!bg-white/10"
                : "!bg-gray-200 !text-gray-700 hover:!bg-gray-300"
            }`}
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        </div>

        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Session Expired
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600 dark:text-gray-400">
            Your session has expired or you have been logged out from another
            tab. Please sign in again to continue.
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={handleSignIn} className="w-full" size="lg">
              Sign In Again
            </Button>
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Go to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
