"use client";

import React, { useMemo, useState } from "react";

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

const ServicesPerformance: React.FC = () => {
  const [range, setRange] = useState<string>("week");

  const topServices = useMemo(() => {
    const datasets: Record<string, { name: string; amount: number }[]> = {
      day: [
        { name: "Facial", amount: 68.34 },
        { name: "Haircut", amount: 42.11 },
        { name: "Makeup Application", amount: 21.25 },
        { name: "Massage", amount: 15.0 },
        { name: "Manicure", amount: 10.5 },
      ],
      week: [
        { name: "Facial", amount: 204.57 },
        { name: "Haircut", amount: 114.72 },
        { name: "Makeup Application", amount: 63.55 },
        { name: "Massage", amount: 45.0 },
        { name: "Manicure", amount: 30.5 },
      ],
      month: [
        { name: "Facial", amount: 850.2 },
        { name: "Haircut", amount: 480.75 },
        { name: "Makeup Application", amount: 270.6 },
        { name: "Massage", amount: 180.0 },
        { name: "Manicure", amount: 122.0 },
      ],
    };

    return datasets[range] ?? datasets.week;
  }, [range]);

  return (
    <Card className="space-y-4 shadow-md dark:shadow-gray-600">
      <CardHeader className="items-start">
        <div>
          <CardTitle>Services/Styles Performance</CardTitle>
          <CardDescription className="mt-2">
            Top 5 Selected Services/Styles
          </CardDescription>
        </div>

        <CardAction>
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
        </CardAction>
      </CardHeader>

      <CardContent>
        <div className="mt-2 grid grid-cols-2 gap-4 md:grid-cols-5">
          {topServices.map((s) => (
            <Card
              key={s.name}
              className="p-4 text-center shadow-md dark:shadow-gray-600"
            >
              <div className="text-muted-foreground text-sm font-medium">
                {s.name}
              </div>
              <div className="text-primary text-xl font-semibold">
                ${s.amount.toFixed(2)}
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServicesPerformance;
