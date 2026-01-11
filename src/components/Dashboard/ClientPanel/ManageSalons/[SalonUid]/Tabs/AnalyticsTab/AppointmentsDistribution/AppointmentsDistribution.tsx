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

const AppointmentsDistribution: React.FC = () => {
  const [range, setRange] = useState<string>("dayOfWeek");

  const data = useMemo(() => {
    const datasets: Record<string, (string | number)[][]> = {
      dayOfWeek: [
        ["Day", "Appointments"],
        ["Mon", 34],
        ["Tue", 30],
        ["Wed", 27],
        ["Thu", 29],
        ["Fri", 32],
        ["Sat", 23],
        ["Sun", 25],
      ],
      day: [
        ["Hour", "Appointments"],
        ["08:00", 3],
        ["10:00", 6],
        ["12:00", 8],
        ["14:00", 5],
        ["16:00", 7],
      ],
      week: [
        ["Week", "Appointments"],
        ["2025-48", 180],
        ["2025-49", 210],
        ["2025-50", 195],
      ],
      month: [
        ["Month", "Appointments"],
        ["2025-10", 760],
        ["2025-11", 820],
        ["2025-12", 910],
      ],
    };

    return datasets[range] ?? datasets.dayOfWeek;
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
        <div>
          <h3 className="text-2xl font-semibold">Appointments Distribution</h3>
        </div>

        <div className="flex items-center gap-2">
          <Select defaultValue={range} onValueChange={(val) => setRange(val)}>
            <SelectTrigger size="sm" className="w-40">
              <SelectValue>
                {range === "dayOfWeek"
                  ? "Day of Week"
                  : range === "day"
                    ? "Day (Hourly)"
                    : range === "week"
                      ? "Weekly"
                      : "Monthly"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dayOfWeek">Day of Week</SelectItem>
              <SelectItem value="day">Day (Hourly)</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
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

export default AppointmentsDistribution;
