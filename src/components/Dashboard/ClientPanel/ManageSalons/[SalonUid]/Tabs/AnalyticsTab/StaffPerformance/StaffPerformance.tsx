"use client";

import React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrencySymbol } from "@/lib/utils";
import { useGetTopStaffPerformersQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Analytics/AnalyticsApi";
import { TopStaffPerformer } from "@/Types/ClientPanel/ManageSalonTypes/AnalyticsTypes/AnalyticsTypes";
import { LoaderPinwheel } from "lucide-react";
import { useParams } from "next/navigation";

const StaffPerformance: React.FC = () => {
  const { salonuid } = useParams();

  const { data: topStaffData, isLoading } = useGetTopStaffPerformersQuery({
    salonUid: salonuid,
  });

  return (
    <Card className="space-y-4 shadow-md dark:shadow-gray-600">
      <CardHeader className="items-start">
        <div>
          <CardTitle>Staff Performance</CardTitle>
          <CardDescription className="mt-2">
            Top 5 Revenue Generating Staff
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <LoaderPinwheel className="text-primary animate-spin" size={20} />
          </div>
        ) : !topStaffData || topStaffData.length === 0 ? (
          <div className="p-4 text-center">
            No staff performance data available.
          </div>
        ) : (
          <div className="mt-2 grid grid-cols-2 gap-4 md:grid-cols-5">
            {topStaffData.map((s: TopStaffPerformer) => (
              <Card
                key={s.employee_id}
                className="p-4 text-center shadow-md dark:shadow-gray-600"
              >
                <div className="text-muted-foreground text-sm font-medium">
                  {s.name}
                </div>
                <div className="text-primary text-xl font-semibold">
                  {getCurrencySymbol()}
                  {s.total_revenue.toFixed(2)}
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StaffPerformance;
