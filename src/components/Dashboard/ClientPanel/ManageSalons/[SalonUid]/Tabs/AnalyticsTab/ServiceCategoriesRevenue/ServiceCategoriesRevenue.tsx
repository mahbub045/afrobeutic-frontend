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

const ServiceCategoriesRevenue: React.FC = () => {
  const [range, setRange] = useState<string>("week");

  const data = useMemo(() => {
    // sample datasets for different ranges; replace with real data from API
    const datasets: Record<string, (string | number)[][]> = {
      day: [
        ["Service", "Revenue"],
        ["Skin", 120],
        ["Massage", 80],
        ["Hair", 50],
      ],
      week: [
        ["Service", "Revenue"],
        ["Skin", 420],
        ["Massage", 290],
        ["Hair", 160],
        ["Nails", 120],
        ["Makeup", 90],
      ],
      month: [
        ["Service", "Revenue"],
        ["Skin", 1800],
        ["Massage", 1200],
        ["Hair", 650],
        ["Nails", 480],
        ["Makeup", 310],
      ],
    };

    return datasets[range] ?? datasets.week;
  }, [range]);

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

export default ServiceCategoriesRevenue;
