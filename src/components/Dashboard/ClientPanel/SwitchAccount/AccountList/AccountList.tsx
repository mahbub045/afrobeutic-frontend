import { Badge } from "@/components/ui/badge";
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
      role: "Admin",
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
      {/* Responsive grid: 1 col xs, 2 sm, 3 md, 4 lg */}
      <div className="grid auto-rows-fr grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        {accounts.map((account, index) => (
          <div key={index} className="relative w-full">
            <Link
              href={`/dashboard/accounts/${account.uid ?? index}`}
              aria-label={`Open account ${account.name}`}
            >
              <Card className="group hover:shadow-primary/10 relative flex h-full min-h-20 w-full transform flex-row items-center gap-4 overflow-hidden border border-gray-200/60 bg-white/80 px-4 pt-8 pb-6 shadow-md backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg dark:border-gray-700/60 dark:bg-gray-900/80 dark:shadow-gray-600">
                {/* Badge inside the Card so it visually sits in the top-right of the card */}
                <div className="absolute top-1 right-1 z-30">
                  <Badge
                    variant="secondary"
                    className="w-fit text-xs text-white"
                  >
                    {account.role}
                  </Badge>
                </div>

                <div className="flex w-full flex-row items-center gap-4">
                  <div className="flex flex-col items-start truncate">
                    <h3 className="text-primary truncate text-base font-semibold lg:text-lg">
                      {account.name}&apos;s account
                    </h3>
                    <p className="truncate text-xs">{account.email}</p>
                    <p className="mt-2 truncate text-xs text-gray-500 dark:text-gray-400">
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
