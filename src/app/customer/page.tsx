"use client";

import { LoaderPinwheel } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  ConsumerProfile,
  fetchConsumerProfile,
} from "@/services/customer-auth";

const CUSTOMER_TOKEN_KEY = "customer_token";

export default function CustomerHomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ConsumerProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem(CUSTOMER_TOKEN_KEY)
          : null;

      if (!token) {
        router.replace("/auth/customer-login");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await fetchConsumerProfile(token);
        setProfile(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load.";
        setError(message);

        if (typeof window !== "undefined") {
          localStorage.removeItem(CUSTOMER_TOKEN_KEY);
        }
        router.replace("/auth/customer-login");
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [router]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center gap-2">
          <LoaderPinwheel className="h-6 w-6 animate-spin" />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Loading customer profile…
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 dark:bg-gray-900">
      <div className="mx-auto w-full max-w-xl rounded-lg border bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Customer Profile
        </h1>

        {error ? (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}

        <div className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <div>
            <span className="font-medium">Name:</span>{" "}
            {(profile?.first_name || "") + " " + (profile?.last_name || "")}
          </div>
          <div>
            <span className="font-medium">Phone:</span> {profile?.phone}
          </div>
          <div>
            <span className="font-medium">Role:</span> {profile?.role}
          </div>
        </div>

        <button
          className="btn-full btn-primary mt-6"
          onClick={() => {
            if (typeof window !== "undefined") {
              localStorage.removeItem(CUSTOMER_TOKEN_KEY);
            }
            router.replace("/auth/customer-login");
          }}
        >
          Log out
        </button>
      </div>
    </div>
  );
}
