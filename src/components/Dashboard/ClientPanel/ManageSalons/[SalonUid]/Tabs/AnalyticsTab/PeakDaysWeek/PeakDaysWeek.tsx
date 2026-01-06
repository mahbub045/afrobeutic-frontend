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

const PeakDaysWeek: React.FC = () => {
  const [range, setRange] = useState<string>("week");

  const data = useMemo(() => {
    // sample datasets for different ranges; replace with real data from API
    const datasets: Record<string, (string | number)[][]> = {
      day: [
        ["Day", "Peak Days"],
        ["Mon", 0],
        ["Tue", 1],
        ["Wed", 0],
        ["Thu", 0],
        ["Fri", 0],
        ["Sat", 0],
        ["Sun", 0],
      ],
      week: [
        ["Day", "Peak Days"],
        ["Mon", 0],
        ["Tue", 2],
        ["Wed", 0],
        ["Thu", 0],
        ["Fri", 0],
        ["Sat", 0],
        ["Sun", 0],
      ],
      month: [
        ["Day", "Peak Days"],
        ["Mon", 2],
        ["Tue", 2],
        ["Wed", 1],
        ["Thu", 1],
        ["Fri", 2],
        ["Sat", 1],
        ["Sun", 1],
      ],
    };

    return datasets[range] ?? datasets.week;
  }, [range]);

  const options = {
    chartArea: { left: 48, top: 48, width: "88%", height: "70%" },
    legend: {
      position: "top",
      alignment: "center",
      textStyle: { color: "#027f81" },
    },
    vAxis: { minValue: 0, textStyle: { color: "#027f81" } },
    hAxis: { textStyle: { color: "#027f81" } },
    backgroundColor: "transparent",
    colors: ["#2b9cff"],
    tooltip: { trigger: "both" },
  };

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Peak Days in a Week</h3>

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
          chartType="ColumnChart"
          width="100%"
          height="360px"
          data={data}
          options={options}
          loader={<div className="p-8 text-center">Loading chart…</div>}
        />
      </div>
    </section>
  );
};

export default PeakDaysWeek;
