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
import { useGetProductCategoriesRevenueQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Analytics/AnalyticsApi";
import { ProductCategoryRevenue } from "@/Types/ClientPanel/ManageSalonTypes/AnalyticsTypes/AnalyticsTypes";
import { LoaderPinwheel } from "lucide-react";
import { useParams } from "next/navigation";

const ProductCategoriesRevenue: React.FC = () => {
  const { salonuid } = useParams();
  const [range, setRange] = useState<string>("this_week");

  const { data: productCategoriesRevenueData, isLoading } =
    useGetProductCategoriesRevenueQuery({
      salonUid: salonuid,
      params: { period: range },
    });

  const chartData = useMemo(() => {
    // Expecting an array like: [{ product_category: string, revenue: number }, ...]
    const raw = Array.isArray(productCategoriesRevenueData)
      ? (productCategoriesRevenueData as ProductCategoryRevenue[])
      : (productCategoriesRevenueData as ProductCategoryRevenue[]) || [];

    if (!raw.length) return [["Product Category", "Revenue"]];

    const rows = raw
      .slice()
      .sort(
        (a: ProductCategoryRevenue, b: ProductCategoryRevenue) =>
          (b.revenue || 0) - (a.revenue || 0),
      )
      .slice(0, 5)
      .map((r: ProductCategoryRevenue) => [
        formatChoiceFieldValue(r.product_category || ""),
        r.revenue || 0,
      ]);

    return [["Product Category", "Revenue"], ...rows];
  }, [productCategoriesRevenueData]);

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
          Top 5 Revenue Earner Product Categories
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

export default ProductCategoriesRevenue;
