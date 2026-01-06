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

const ProductsRevenue: React.FC = () => {
  const [range, setRange] = useState<string>("week");

  const data = useMemo(() => {
    // sample datasets for different ranges; replace with real data from API
    const datasets: Record<string, (string | number)[][]> = {
      day: [
        ["Date", "Makeup", "Shampoo", "Skincare"],
        ["2026-01-01", 40, 30, 20],
        ["2026-01-02", 60, 45, 35],
        ["2026-01-03", 50, 40, 30],
      ],
      week: [
        ["Week", "Makeup", "Shampoo", "Skincare", "Fragrance"],
        ["2026-01", 420, 280, 210, 140],
        ["2026-02", 460, 300, 240, 160],
        ["2026-03", 490, 330, 260, 180],
      ],
      month: [
        ["Month", "Makeup", "Shampoo", "Skincare", "Fragrance", "Wellness"],
        ["2025-10", 1700, 980, 640, 420, 210],
        ["2025-11", 1900, 1050, 720, 460, 240],
        ["2025-12", 2150, 1180, 840, 520, 280],
      ],
    };

    return datasets[range] ?? datasets.week;
  }, [range]);

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
    colors: ["#ff7aa2", "#63a4ff", "#ffd166", "#2ec4b6", "#8e44ad"],
    pointSize: 6,
    tooltip: { trigger: "both" },
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

      <div className="w-full">
        <Chart
          chartType="LineChart"
          width="100%"
          height="320px"
          data={data}
          options={options}
          loader={<div className="p-8 text-center">Loading chart…</div>}
        />
      </div>
    </section>
  );
};

export default ProductsRevenue;
