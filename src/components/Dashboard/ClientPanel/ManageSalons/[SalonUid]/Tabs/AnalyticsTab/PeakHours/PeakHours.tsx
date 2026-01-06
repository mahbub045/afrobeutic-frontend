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

const PeakHours: React.FC = () => {
  const [timeRange, setTimeRange] = useState<string>("today");
  const [month, setMonth] = useState<string>("all");

  const data = useMemo(() => {
    // sample peak-hour distribution (values between 0 and 1)
    const sample = {
      today: [
        ["Time", "Peak Hours"],
        ["09-11", 0.2],
        ["11-13", 0.35],
        ["13-15", 0.45],
        ["15-17", 0.25],
        ["17-19", 0.15],
      ],
      week: [
        ["Time", "Peak Hours"],
        ["09-11", 0.4],
        ["11-13", 0.6],
        ["13-15", 0.7],
        ["15-17", 0.5],
        ["17-19", 0.35],
      ],
      month: [
        ["Time", "Peak Hours"],
        ["09-11", 0.45],
        ["11-13", 0.55],
        ["13-15", 0.65],
        ["15-17", 0.5],
        ["17-19", 0.4],
      ],
    };

    return sample[timeRange as keyof typeof sample] ?? sample.today;
  }, [timeRange]);

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
        <h3 className="text-lg font-semibold">Peak Hours</h3>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <span className="text-sm">Time Range:</span>
            <Select
              defaultValue={timeRange}
              onValueChange={(val) => setTimeRange(val)}
            >
              <SelectTrigger size="sm" className="w-40">
                <SelectValue>
                  {timeRange === "today"
                    ? "Today"
                    : timeRange === "week"
                      ? "This Week"
                      : "This Month"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </label>

          <label className="flex items-center gap-2">
            <span className="text-sm">Month:</span>
            <Select defaultValue={month} onValueChange={(val) => setMonth(val)}>
              <SelectTrigger size="sm" className="w-44">
                <SelectValue>
                  {month === "all" ? "All Months" : month}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                <SelectItem value="01">January</SelectItem>
                <SelectItem value="02">February</SelectItem>
                <SelectItem value="03">March</SelectItem>
                <SelectItem value="04">April</SelectItem>
                <SelectItem value="05">May</SelectItem>
                <SelectItem value="06">June</SelectItem>
                <SelectItem value="07">July</SelectItem>
                <SelectItem value="08">August</SelectItem>
                <SelectItem value="09">September</SelectItem>
                <SelectItem value="10">October</SelectItem>
                <SelectItem value="11">November</SelectItem>
                <SelectItem value="12">December</SelectItem>
              </SelectContent>
            </Select>
          </label>
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

export default PeakHours;
