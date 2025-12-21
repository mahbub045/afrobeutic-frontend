import { Badge } from "@/components/ui/badge";
import {
  formatChoiceFieldValue,
  formatDateTime,
  getCountryName,
} from "@/lib/utils";
import { useGetSalonDetailsQuery } from "@/Redux/Reducers/AdminPanel/Accounts/Salons/SalonsApi";
import { Check, Copy, LoaderPinwheel } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import Bookings from "./Bookings/Bookings";
import Employees from "./Employees/Employees";
import Products from "./Products/Products";
import SalonOverviews from "./SalonOverviews/SalonOverviews";
import Services from "./Services/Services";

const SalonDetails: React.FC = () => {
  const { accountuid, salonuid } = useParams();
  const { data: salonDetails, isLoading } = useGetSalonDetailsQuery({
    accountUid: accountuid,
    salonUid: salonuid,
  });
  const salon = salonDetails;
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(salon?.address ?? "");
      setCopied(true);
      timeoutRef.current = window.setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      console.error("Failed to copy address to clipboard", e);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <LoaderPinwheel
          className="h-8 w-8 animate-spin text-gray-500 dark:text-gray-400"
          aria-hidden="true"
        />
        <span className="sr-only">Loading salon…</span>
      </div>
    );
  }

  if (!salonDetails) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            No salon data found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl shadow-md dark:shadow-gray-600">
        <div className="flex items-center gap-4 p-6">
          <div className="bg-primary/10 flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg dark:bg-gray-800">
            {salon.logo ? (
              <Image
                src={salon.logo}
                alt={salon.name ?? "Salon"}
                width={96}
                height={96}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-3xl font-semibold text-gray-800 dark:text-gray-500">
                {(salon.name || "?").charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {salon.name}
                </h2>
                <Badge variant="secondary">
                  {formatChoiceFieldValue(salon.salon_type)}
                </Badge>
              </div>

              <div>
                <Badge>{formatChoiceFieldValue(salon.status)}</Badge>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-start gap-2">
              <span className="truncate text-sm text-gray-600 dark:text-gray-300">
                {salon.address}
              </span>
              <button
                type="button"
                onClick={copyAddress}
                aria-label="Copy address"
                className="inline-flex items-center justify-center rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold text-gray-600 uppercase dark:text-gray-400">
                Contact
              </h3>
              <p className="mt-2 text-sm text-gray-800 dark:text-gray-200">
                {salon.email}
              </p>
              <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">
                {salon.phone}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-600 uppercase dark:text-gray-400">
                Location & Web
              </h3>
              <p className="mt-2 text-sm text-gray-800 dark:text-gray-200">
                {salon.street}, {salon.city} {salon.postal_code}
              </p>
              <p className="mt-1 text-sm">
                {salon.website ? (
                  <a
                    href={salon.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    {new URL(salon.website).host}
                  </a>
                ) : (
                  <span className="text-gray-500">—</span>
                )}
              </p>
            </div>
          </div>

          <div className="mt-4 border-t pt-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Created:{" "}
              <span className="text-gray-800 dark:text-gray-200">
                {formatDateTime(salon.created_at)}
              </span>
            </div>
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Country:{" "}
              <span className="text-gray-800 dark:text-gray-200">
                {getCountryName(salon.country)}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Add additional salon details below */}
      <div className="pt-10">
        <SalonOverviews />
      </div>
      <div className="pt-10">
        <Services />
      </div>
      <div className="pt-10">
        <Products />
      </div>
      <div className="pt-10">
        <Employees />
      </div>
      <div className="pt-10">
        <Bookings />
      </div>
    </>
  );
};

export default SalonDetails;
