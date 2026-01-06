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

const CustomerAnalysis: React.FC = () => {
  const [range, setRange] = useState<string>("week");

  const data = useMemo(() => {
    // sample datasets for New vs Repeated customers; replace with API data when available
    const datasets: Record<string, (string | number)[][]> = {
      day: [
        ["Customer", "Count"],
        ["New", 12],
        ["Repeated", 8],
      ],
      week: [
        ["Customer", "Count"],
        ["New", 60],
        ["Repeated", 60],
      ],
      month: [
        ["Customer", "Count"],
        ["New", 240],
        ["Repeated", 260],
      ],
    };

    return datasets[range] ?? datasets.week;
  }, [range]);

  const options = {
    title: "New vs Repeated Customers",
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
          <Chart
            chartType="PieChart"
            width="100%"
            height="320px"
            data={data}
            options={options}
            loader={<div className="p-8 text-center">Loading chart…</div>}
          />
        </div>
      </div>
    </section>
  );
};

export default CustomerAnalysis;
