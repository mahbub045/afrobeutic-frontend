"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetServiceCategotyiesRevenueQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Analytics/AnalyticsApi";
import { ServiceCategoryRevenue } from "@/Types/ClientPanel/ManageSalonTypes/AnalyticsTypes/AnalyticsTypes";
import { useParams } from "next/navigation";
import React, { useMemo, useState } from "react";
import { Chart } from "react-google-charts";

const ServiceCategoriesRevenue: React.FC = () => {
  const { salonuid } = useParams();
  const { data: serviceCategoriesRevenueData, isLoading } =
    useGetServiceCategotyiesRevenueQuery({ salonUid: salonuid, params: {} });

  const [range, setRange] = useState<string>("week");

  const prettifyCategory = (key: string) => {
    if (!key) return "Unknown";
    const maps: Record<string, string> = {
      BRIDAL_AND_MAKEUP_SERVICES: "Bridal & Makeup Services",
    };
    if (maps[key]) return maps[key];
    return key
      .toLowerCase()
      .split(/_|\s+/)
      .map((w) => w[0]?.toUpperCase() + w.slice(1))
      .join(" ");
  };

  const chartData = useMemo(() => {
    // Expecting an array like: [{ service_category: string, revenue: number }, ...]
    const raw = Array.isArray(serviceCategoriesRevenueData)
      ? (serviceCategoriesRevenueData as ServiceCategoryRevenue[])
      : (serviceCategoriesRevenueData as ServiceCategoryRevenue[]) || [];

    if (!raw.length) return [["Service Category", "Revenue"]];

    const rows = raw
      .slice()
      .sort(
        (a: ServiceCategoryRevenue, b: ServiceCategoryRevenue) =>
          (b.revenue || 0) - (a.revenue || 0),
      )
      .slice(0, 5)
      .map((r: ServiceCategoryRevenue) => [
        prettifyCategory(r.service_category || ""),
        r.revenue || 0,
      ]);

    return [["Service Category", "Revenue"], ...rows];
  }, [serviceCategoriesRevenueData]);

  const options = {
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
        <h3 className="text-lg font-semibold">
          Top 5 Revenue Earner Service Categories
        </h3>
        <div className="flex items-center gap-2">
          <Select defaultValue={range} onValueChange={(val) => setRange(val)}>
            <SelectTrigger size="sm" className="w-40">
              <SelectValue>
                {range === "day"
                  ? "Today"
                  : range === "week"
                    ? "This Week"
                    : "This Month"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="flex w-full flex-col items-center">
        <div className="w-full max-w-2xl">
          {isLoading ? (
            <div className="p-8 text-center">Loading chart…</div>
          ) : chartData.length <= 1 ? (
            <div className="p-8 text-center">No revenue data available.</div>
          ) : (
            <Chart
              chartType="PieChart"
              width="100%"
              height="320px"
              data={chartData}
              options={options}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default ServiceCategoriesRevenue;
