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

const ServicesRevenue: React.FC = () => {
  const [range, setRange] = useState<string>("week");

  const data = useMemo(() => {
    // sample datasets for different ranges; replace with real data from API
    const datasets: Record<string, (string | number)[][]> = {
      day: [
        ["Date", "Massage", "Makeup Application"],
        ["2026-01-01", 80, 70],
        ["2026-01-02", 120, 95],
        ["2026-01-03", 90, 60],
      ],
      week: [
        ["Week", "Massage", "Makeup Application", "Facial"],
        ["2026-01", 220, 180, 140],
        ["2026-02", 240, 200, 160],
        ["2026-03", 260, 210, 170],
      ],
      month: [
        ["Month", "Massage", "Makeup Application", "Facial", "Nails"],
        ["2025-10", 600, 480, 380, 210],
        ["2025-11", 720, 520, 410, 260],
        ["2025-12", 810, 590, 480, 310],
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
    <section className="mt-6 space-y-4">
      <header className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Top 5 Revenue Earner Services (Individual)
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

export default ServicesRevenue;
