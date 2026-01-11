import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalonOverviewProps } from "@/Types/ClientPanel/ManageSalonTypes/DashboardTypes/SalonOverviewType";
import {
  Calendar,
  DollarSign,
  LoaderPinwheel,
  Scissors,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import React from "react";

const SalonOverview: React.FC<SalonOverviewProps> = ({
  isLoading,
  salonOverviewData,
}) => {
  const { data: session } = useSession();
  return (
    <div
      className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${session?.user?.account_type === "INDIVIDUAL_STYLIST" ? "" : "lg:grid-cols-4"}`}
    >
      {/* Employees Card */}
      {session?.user?.account_type === "INDIVIDUAL_STYLIST" ? null : (
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 shadow-md dark:from-blue-950 dark:to-blue-900 dark:shadow-lg dark:shadow-blue-900/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-muted-foreground text-sm font-medium dark:text-blue-200">
              Total Employees
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-200 dark:bg-blue-700">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {isLoading ? (
                <LoaderPinwheel className="animate-spin" />
              ) : (
                salonOverviewData?.total_employees || 0
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Services Card */}
      <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 shadow-md dark:from-purple-950 dark:to-purple-900 dark:shadow-lg dark:shadow-purple-900/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-muted-foreground text-sm font-medium dark:text-purple-200">
            Total Services
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-200 dark:bg-purple-700">
            <Scissors className="h-4 w-4 text-purple-600 dark:text-purple-300" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {isLoading ? (
                <LoaderPinwheel className="animate-spin" />
              ) : (
                salonOverviewData?.total_services || 0
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Card */}
      <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 shadow-md dark:from-green-950 dark:to-green-900 dark:shadow-lg dark:shadow-green-900/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-muted-foreground text-sm font-medium dark:text-green-200">
            Total Products
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-200 dark:bg-green-700">
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-300" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900 dark:text-green-100">
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {isLoading ? (
                <LoaderPinwheel className="animate-spin" />
              ) : (
                salonOverviewData?.total_products || 0
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chairs Card */}
      {session?.user?.account_type === "INDIVIDUAL_STYLIST" ? null : (
        <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100 shadow-md dark:from-orange-950 dark:to-orange-900 dark:shadow-lg dark:shadow-orange-900/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-muted-foreground text-sm font-medium dark:text-orange-200">
              Total Chairs
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-200 dark:bg-orange-700">
              <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {isLoading ? (
                  <LoaderPinwheel className="animate-spin" />
                ) : (
                  salonOverviewData?.total_chairs || 0
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SalonOverview;
