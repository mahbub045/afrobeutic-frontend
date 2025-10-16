import { Card } from "@/components/ui/card";
import Link from "next/link";
import React from "react";

const AccountList: React.FC = () => {
  const accounts = [
    {
      name: "Amina Yusuf",
      email: "amina.yusuf@example.com",
      uid: "acc5237b4d4342ffdd",
      role: "Owner",
    },
    {
      name: "Samuel Ade",
      email: "samuel.ade@example.com",
      uid: "acc-example-2",
      role: "Manager",
    },
    {
      name: "Chidi Okafor",
      email: "chidi.okafor@example.com",
      uid: "acc-example-3",
      role: "Staff",
    },
    {
      name: "Fatima Bello",
      email: "fatima.bello@example.com",
      uid: "acc-example-4",
      role: "Staff",
    },
    // Add more accounts here
  ];

  return (
    <>
      <div className="flex flex-wrap gap-5">
        {accounts.map((account, index) => (
          <div key={index} className="relative w-full max-w-md">
            {/* Role badge stays outside the Link */}
            <div className="absolute top-3 right-3 z-20">
              <span className="bg-secondary rounded px-2 py-1 text-xs text-white">
                {account.role}
              </span>
            </div>

            <Link
              href={`/dashboard/accounts/${account.uid ?? index}`}
              aria-label={`Open account ${account.name}`}
            >
              <Card className="group hover:shadow-primary/10 relative flex min-h-16 w-full transform flex-row items-center gap-4 overflow-hidden border border-gray-200/60 bg-white/80 px-4 py-8 shadow-md backdrop-blur-sm transition-all duration-300 hover:min-h-[5.5rem] hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg dark:border-gray-700/60 dark:bg-gray-900/80 dark:shadow-gray-600">
                <div className="flex w-full flex-row items-center gap-4 transition-all duration-300">
                  <div className="flex flex-col items-start truncate">
                    <h3 className="truncate text-sm font-semibold">
                      {account.name}&apos;s account
                    </h3>
                    <p className="truncate text-xs text-gray-600 dark:text-gray-400">
                      {account.email}
                    </p>
                    <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-medium">Account ID:</span>{" "}
                      {account.uid}
                    </p>
                  </div>
                  <div className="ml-auto" />
                </div>
              </Card>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
};

export default AccountList;
