"use client";
import { Eye, EyeOff, LoaderPinwheel, Moon, Sun } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center">
          <LoaderPinwheel className="h-10 w-10 animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl =
    searchParams.get("callbackUrl") ?? "/dashboard/admin-panel";
  const errorParam = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const [showPassword, setShowPassword] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Show toast notification based on URL parameters
  useEffect(() => {
    if (errorParam === "access_denied") {
      toast.error(
        "Access denied. You don't have permission to access this page.",
      );
    } else if (errorParam === "unauthorized") {
      toast.error("Please log in to continue.");
    }
  }, [errorParam]);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated" && session) {
      // Redirect based on user role
      const role = session.user.role;
      if (role === "MANAGEMENT_ADMIN" || role === "MANAGEMENT_STAFF") {
        router.push("/dashboard/admin-panel");
      } else if (role === "OWNER" || role === "ADMIN" || role === "STAFF") {
        router.push("/dashboard/client-panel");
      } else {
        router.push(callbackUrl);
      }
    }
  }, [status, session, router, callbackUrl]);

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="grid min-h-screen place-items-center bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center gap-2">
          <Image
            src="/images/loader/loader-dark.png"
            alt="Logo"
            width={100}
            height={100}
            className="hidden dark:block"
          />
          <Image
            src="/images/loader/loader-light.png"
            alt="Logo"
            width={100}
            height={100}
            className="block dark:hidden"
          />
          <LoaderPinwheel className="h-6 w-6 animate-spin" />
        </div>
      </div>
    );
  }

  // If already authenticated, don't render the form
  if (status === "authenticated") {
    return (
      <div className="grid min-h-screen place-items-center">Redirecting…</div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);

    if (res?.error) {
      const message = res.error || "Invalid email or password!";
      toast.error(message);
      return;
    }

    // Only show success toast if there's no error
    toast.success("Login successful! Redirecting...");
    // The useEffect will handle redirection based on role
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 p-6 dark:from-[#0f1724] dark:via-[#0b1220] dark:to-[#02040a]">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -left-32 h-96 w-96 rounded-full bg-gradient-to-tr from-blue-700/40 to-indigo-600/30 opacity-60 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 -bottom-24 h-96 w-96 rounded-full bg-gradient-to-br from-purple-700/30 to-pink-600/20 opacity-50 blur-3xl" />

      <form
        onSubmit={onSubmit}
        className="relative w-full max-w-sm space-y-4 rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800 dark:shadow-gray-800"
      >
        <div className="relative mx-auto my-2 flex h-14 w-48 items-center justify-center">
          <Image
            src="/images/logo-light.png"
            alt="Afrobeutic Logo"
            fill
            className="block object-contain dark:hidden"
          />

          <Image
            src="/images/logo-dark.png"
            alt="Afrobeutic Logo"
            fill
            className="hidden object-contain dark:block"
          />
        </div>
        {/* theme toggle */}
        <div className="absolute top-3 right-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="cursor-pointer rounded-md bg-gray-100/60 p-2 text-gray-800 transition hover:bg-gray-100/80 dark:bg-gray-700/60 dark:text-gray-100 dark:hover:bg-gray-700/80"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {/* {theme === "dark" ? <Moon /> : <Sun />} */}
            {theme === "dark" ? <Sun /> : <Moon />}
          </button>
        </div>

        <h1 className="mb-1 text-center text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Log in
        </h1>
        <div className="text-center text-sm">Connected with Afrobeutic</div>
        <div className="space-y-1">
          <label className="block text-sm text-gray-700 dark:text-gray-300">
            Email<span className="text-danger">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm text-gray-700 dark:text-gray-300">
            Password<span className="text-danger">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-sm text-gray-600 hover:text-gray-800 dark:text-white/70 dark:hover:text-white"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-full btn-primary"
        >
          {loading ? (
            <LoaderPinwheel className="mr-2 inline h-5 w-5 animate-spin text-white" />
          ) : (
            "Log in"
          )}
        </button>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          You don&apos;t have an account?{" "}
          <a href="/auth/signup" className="text-primary hover:underline">
            Sign up
          </a>
        </p>
      </form>
    </div>
  );
}
