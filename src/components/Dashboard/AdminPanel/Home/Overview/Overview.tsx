"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetAdminOverviewStatsQuery } from "@/Redux/Reducers/AdminPanel/Home/OverviewApi";
import { CreditCard, LoaderPinwheel, Scissors, Users } from "lucide-react";
import React from "react";

const Overview: React.FC = () => {
  const {
    data: overviewStats,
    isLoading,
    isError,
  } = useGetAdminOverviewStatsQuery(undefined);

  const totalManagementUsers = overviewStats?.management_users ?? 0;
  const totalAccounts = overviewStats?.accounts ?? 0;
  const totalSalons = overviewStats?.salons ?? 0;

  // helper to show spinner or value inside cards
  const renderStat = (value: number) => {
    if (isLoading) {
      return (
        <LoaderPinwheel className="mx-auto h-6 w-6 animate-spin text-white" />
      );
    }
    return value;
  };

  return (
    <section className="mt-6">
      {/* overall error/loading states still shown above grid */}
      {isError && (
        <p className="text-center text-red-500">
          Failed to load overview stats.
        </p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Management User Card */}
        <Card className="border-0 bg-gradient-to-br from-orange-500 to-orange-400 shadow-md dark:from-orange-950 dark:to-orange-900 dark:shadow-lg dark:shadow-gray-600">
          <CardHeader>
            <CardTitle className="text-muted-foreground flex items-center justify-between gap-3 text-xs dark:text-orange-200">
              <span className="font-medium text-white">
                TOTAL MANAGEMENT USER
              </span>
              <span className="flex items-center justify-center rounded-lg bg-orange-600 p-2 dark:bg-orange-700">
                <Users className="size-5 text-white" />
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white dark:text-orange-100">
              {renderStat(totalManagementUsers)}
            </div>
          </CardContent>
        </Card>

        {/* Total Account Card */}
        <Card className="border-0 bg-gradient-to-br from-blue-500 to-blue-400 shadow-md dark:from-blue-950 dark:to-blue-900 dark:shadow-lg dark:shadow-gray-600">
          <CardHeader>
            <CardTitle className="text-muted-foreground flex items-center justify-between gap-3 text-xs dark:text-blue-200">
              <span className="font-medium text-white">TOTAL ACCOUNT</span>
              <span className="flex items-center justify-center rounded-lg bg-blue-600 p-2 dark:bg-blue-700">
                <CreditCard className="size-5 text-white" />
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white dark:text-blue-100">
              {renderStat(totalAccounts)}
            </div>
          </CardContent>
        </Card>

        {/* Total Salon Card */}
        <Card className="border-0 bg-gradient-to-br from-purple-500 to-purple-400 shadow-md dark:from-purple-950 dark:to-purple-900 dark:shadow-lg dark:shadow-gray-600">
          <CardHeader>
            <CardTitle className="text-muted-foreground flex items-center justify-between gap-3 text-xs dark:text-purple-200">
              <span className="font-medium text-white">TOTAL SALON</span>
              <span className="flex items-center justify-center rounded-lg bg-purple-600 p-2 dark:bg-purple-700">
                <Scissors className="size-5 text-white" />
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white dark:text-purple-100">
              {renderStat(totalSalons)}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Overview;
