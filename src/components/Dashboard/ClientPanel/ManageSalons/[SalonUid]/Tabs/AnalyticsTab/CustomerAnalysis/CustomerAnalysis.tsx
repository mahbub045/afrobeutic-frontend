"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetCustomerAnalysisQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Analytics/AnalyticsApi";
import { CustomerAnalysisResp } from "@/Types/ClientPanel/ManageSalonTypes/AnalyticsTypes/AnalyticsTypes";
import { LoaderPinwheel } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useMemo, useState } from "react";
import { Chart } from "react-google-charts";

const CustomerAnalysis: React.FC = () => {
  const [range, setRange] = useState<string>("this_week");
  const { salonuid } = useParams();

  const { data: customerAnalysisData, isLoading } = useGetCustomerAnalysisQuery(
    {
      salonUid: salonuid,
      params: { period: range },
    },
  );
  const chartData = useMemo(() => {
    // If API returned counts, use them

    if (customerAnalysisData && typeof customerAnalysisData === "object") {
      const resp = customerAnalysisData as CustomerAnalysisResp;
      const newCount = resp.new_customer_booking_count ?? 0;
      const repeated = resp.repeated_customer_booking_count ?? 0;
      const total = resp.total_bookings ?? newCount + repeated;
      return [
        ["Customer", "Count"],
        ["Total", total],
        ["New", newCount],
        ["Repeated", repeated],
      ];
    }

    // No API data — return only header so caller can detect empty state
    return [["Customer", "Count"]];
  }, [customerAnalysisData]);

  const options = {
    titleTextStyle: { color: "#027f81", fontSize: 14 },
    is3D: true,
    pieStartAngle: 45,
    legend: {
      position: "bottom",
      alignment: "center",
      textStyle: { fontSize: 12, color: "#027f81" },
    },
    backgroundColor: "transparent",
    chartArea: { left: 16, top: 40, width: "90%", height: "70%" },
    pieSliceText: "percentage",
    tooltip: { text: "both" },
  };

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Customer Analysis</h3>
        <div className="flex items-center gap-2">
          <Select defaultValue={range} onValueChange={(val) => setRange(val)}>
            <SelectTrigger size="sm" className="w-40">
              <SelectValue>
                {range === "this_week"
                  ? "This Week"
                  : range === "last_week"
                    ? "Last Week"
                    : range === "this_month"
                      ? "This Month"
                      : "All Time"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="last_week">Last Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="all_time">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="flex w-full flex-col items-center rounded-md shadow-md dark:shadow-gray-600">
        <div className="w-full max-w-2xl">
          {isLoading ? (
            <div className="flex h-[360px] items-center justify-center">
              <LoaderPinwheel className="text-primary animate-spin" size={20} />
            </div>
          ) : chartData.length <= 1 ? (
            <div className="flex h-[360px] items-center justify-center">
              No customer analysis data available.
            </div>
          ) : (
            <Chart
              chartType="PieChart"
              width="100%"
              height="360px"
              data={chartData}
              options={options}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default CustomerAnalysis;
