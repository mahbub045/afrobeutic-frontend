"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import React from "react";

const SignupSuccess: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-[#050816] dark:via-[#071020] dark:to-[#000000]">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -left-32 h-96 w-96 rounded-full bg-gradient-to-tr from-blue-700/40 to-indigo-600/30 opacity-60 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 -bottom-24 h-96 w-96 rounded-full bg-gradient-to-br from-purple-700/30 to-pink-600/20 opacity-50 blur-3xl" />

      <div className="relative mx-4 w-full max-w-xl rounded-xl border bg-white/60 px-8 py-12 text-center shadow-md backdrop-blur-sm dark:bg-white/4 dark:shadow-gray-600">
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

        <div className="from-primary/10 to-primary/5 dark:from-primary/30 dark:to-primary/20 mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br shadow-inner">
          <CheckCircle className="text-primary dark:text-primary h-16 w-16" />
        </div>

        <h1 className="mb-2 text-2xl font-extrabold text-gray-900 md:text-3xl dark:text-white">
          Account created
        </h1>

        <p className="mx-auto mb-6 max-w-lg text-sm text-gray-600 dark:text-white/80">
          Thanks for signing up! We sent a verification link to your email.
          <b className="text-warning"> Please check your inbox </b> (or spam
          folder) and follow the link to activate your account.
        </p>

        <Button>
          <Link href="/auth/login">Go to Sign in</Link>
        </Button>

        <p className="mt-6 text-xs text-gray-500 dark:text-white/60">
          Didn’t receive the email? Check again in a few minutes or request a
          new{" "}
          <Link
            href="/auth/signup"
            className="text-primary text-sm font-bold hover:underline"
          >
            Sign-up
          </Link>{" "}
          form.
        </p>
      </div>
    </div>
  );
};

export default SignupSuccess;
