"use client";

import React, { useMemo, useState } from "react";
import { Chart } from "react-google-charts";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatChoiceFieldValue } from "@/lib/utils";
import { useGetProductRevenueQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Analytics/AnalyticsApi";
import { ProductRevenue } from "@/Types/ClientPanel/ManageSalonTypes/AnalyticsTypes/AnalyticsTypes";
import { LoaderPinwheel } from "lucide-react";
import { useParams } from "next/navigation";

const ProductsRevenue: React.FC = () => {
  const [range, setRange] = useState<string>("this_week");
  const { salonuid } = useParams();

  const { data: productsRevenueData, isLoading } = useGetProductRevenueQuery({
    salonUid: salonuid,
    params: { period: range },
  });

  const chartData = useMemo(() => {
    // Expecting an array like: [{ service_name: string, revenue: number }, ...]
    const raw = Array.isArray(productsRevenueData)
      ? (productsRevenueData as ProductRevenue[])
      : (productsRevenueData as ProductRevenue[]) || [];

    if (!raw.length) return [["Product", "Revenue"]];

    const rows = raw
      .slice()
      .sort(
        (a: ProductRevenue, b: ProductRevenue) =>
          (b.revenue || 0) - (a.revenue || 0),
      )
      .slice(0, 5)
      .map((r: ProductRevenue) => [
        formatChoiceFieldValue(r.product_name || ""),
        r.revenue || 0,
      ]);

    return [["Product", "Revenue"], ...rows];
  }, [productsRevenueData]);

  const options = {
    backgroundColor: "transparent",
    chartArea: { left: 48, top: 48, width: "88%", height: "70%" },
    legend: {
      position: "top",
      alignment: "center",
      textStyle: { color: "#027f81" },
    },
    hAxis: { textStyle: { color: "#027f81" } },
    vAxis: { minValue: 0, textStyle: { color: "#027f81" } },
    colors: ["#2ec4b6", "#63a4ff", "#ff7aa2", "#ffd166", "#8e44ad"],
    pointSize: 6,
    tooltip: { trigger: "both" },
  };
  const prettifyRange = (key: string) => {
    const map: Record<string, string> = {
      this_week: "This Week",
      last_week: "Last Week",
      this_month: "This Month",
      last_6_months: "Last 6 Months",
      last_year: "Last Year",
    };
    return map[key] ?? key;
  };

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Top 5 Revenue Earner Products (Individual)
        </h3>
        <div className="flex items-center gap-2">
          <Select defaultValue={range} onValueChange={(val) => setRange(val)}>
            <SelectTrigger size="sm" className="w-40">
              <SelectValue>{prettifyRange(range)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="last_week">Last Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_6_months">Last 6 Months</SelectItem>
              <SelectItem value="last_year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="flex w-full flex-col items-center shadow-md dark:shadow-gray-600">
        <div className="w-full max-w-2xl">
          {isLoading ? (
            <div className="flex h-80 items-center justify-center">
              <LoaderPinwheel className="text-primary animate-spin" size={20} />
            </div>
          ) : chartData.length <= 1 ? (
            <div className="flex h-80 items-center justify-center">
              No revenue data available.
            </div>
          ) : (
            <Chart
              chartType="LineChart"
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

export default ProductsRevenue;
