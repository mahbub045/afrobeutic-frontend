"use client";

import { Button } from "@/components/ui/button";
import { getCountryName } from "@/lib/utils";
import { useGetUserDetailsQuery } from "@/Redux/Reducers/AdminPanel/Users/UsersApi";
import { AccountProps } from "@/Types/AdminPanel/UsersTypes/UsersType";
import { ArrowLeft, LoaderPinwheel } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";

const UserDetails: React.FC = () => {
  const { useruid } = useParams();
  const { data: userDetails, isLoading } = useGetUserDetailsQuery({
    userUid: useruid,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoaderPinwheel className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="py-12 text-center text-gray-400">
        No user details available.
      </div>
    );
  }

  const accounts = (userDetails.accounts || []) as AccountProps[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-gray-100">
          User Details
        </h2>
        <div>
          <Link href="/dashboard/admin-panel/users">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-slate-600 shadow-md dark:text-gray-300 dark:shadow-gray-600"
            >
              <ArrowLeft className="h-4 w-4" /> Back to users
            </Button>
          </Link>
        </div>
      </div>

      {/* Profile banner*/}
      <div className="flex flex-col items-center gap-6 rounded-lg bg-white px-6 py-8 text-slate-900 shadow-md sm:flex-row sm:items-stretch dark:bg-slate-900 dark:text-slate-100 dark:shadow-gray-600">
        <div className="flex-shrink-0">
          {userDetails.avatar ? (
            <Image
              src={
                typeof userDetails.avatar === "string" ? userDetails.avatar : ""
              }
              alt={`${userDetails.first_name ?? ""} ${userDetails.last_name ?? ""}`}
              width={120}
              height={120}
              className="h-28 w-28 rounded-full object-cover shadow-inner"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-indigo-100 text-2xl font-semibold text-indigo-700">
              {(
                (userDetails.first_name?.[0] ?? "") +
                (userDetails.last_name?.[0] ?? "")
              ).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {`${userDetails.first_name ?? ""} ${userDetails.last_name ?? ""}`.trim()}
          </div>
          <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {userDetails.email}
          </div>
        </div>

        <div className="flex-shrink-0 text-right">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Country
          </div>
          <div className="text-sm font-medium text-slate-700 dark:text-slate-100">
            {getCountryName(userDetails.country) ?? "—"}
          </div>
          <hr className="my-2 border-dashed" />
          <div className="text-sm text-slate-500 dark:text-slate-400">UID</div>
          <div className="text-sm font-medium text-slate-700 dark:text-slate-100">
            {userDetails.uid}
          </div>
        </div>
      </div>

      {/* Accounts card */}
      <div className="rounded-lg bg-white px-6 py-6 text-slate-900 shadow-md dark:bg-slate-800 dark:text-slate-100 dark:shadow-gray-600">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Accounts ({accounts.length})
          </h3>
        </div>

        {accounts.length > 0 ? (
          <div className="divide-y divide-dashed divide-slate-200 dark:divide-slate-700">
            {accounts.map((a) => (
              <div
                key={a.uid}
                className="flex items-center justify-between py-4"
              >
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {a.name}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {a.owner_name} • {a.owner_email}
                  </div>
                </div>
                <div>
                  <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-white/5 dark:text-indigo-200">
                    {a.role ?? "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-600 dark:text-slate-400">
            This user has no linked accounts.
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetails;
