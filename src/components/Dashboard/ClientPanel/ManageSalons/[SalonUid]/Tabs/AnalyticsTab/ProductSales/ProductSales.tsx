"use client";

import React, { useState } from "react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCurrencySymbol } from "@/lib/utils";
import { useGetTopProductsQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Analytics/AnalyticsApi";
import { TopProduct } from "@/Types/ClientPanel/ManageSalonTypes/AnalyticsTypes/AnalyticsTypes";
import { LoaderPinwheel } from "lucide-react";
import { useParams } from "next/navigation";

const ProductSales: React.FC = () => {
  const [range, setRange] = useState<string>("this_week");
  const { salonuid } = useParams();

  const { data: topProductsData, isLoading } = useGetTopProductsQuery({
    salonUid: salonuid,
    params: { period: range },
  });

  return (
    <Card className="space-y-4 shadow-md dark:shadow-gray-600">
      <CardHeader className="items-start">
        <div>
          <CardTitle>Product Sales</CardTitle>
          <CardDescription className="mt-2">
            Top 5 Selected Products
          </CardDescription>
        </div>

        <CardAction>
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
        </CardAction>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <LoaderPinwheel className="text-primary animate-spin" size={20} />
          </div>
        ) : !topProductsData || topProductsData.length === 0 ? (
          <div className="p-4 text-center">
            No product sales data available.
          </div>
        ) : (
          <div className="mt-2 grid grid-cols-2 gap-4 md:grid-cols-5">
            {topProductsData.map((s: TopProduct) => (
              <Card
                key={s.name}
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

export default ProductSales;
