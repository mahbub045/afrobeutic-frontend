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
import { useGetAppointmentsPeakHoursQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Analytics/AnalyticsApi";
import { LoaderPinwheel } from "lucide-react";
import { useParams } from "next/navigation";

const PeakHours: React.FC = () => {
  const { salonuid } = useParams();
  const [timeRange, setTimeRange] = useState<string>("today");

  const { data: appointmentPeakHoursData, isLoading } =
    useGetAppointmentsPeakHoursQuery({
      salonUid: salonuid,
      params: { period: timeRange },
    });
  const chartData = useMemo(() => {
    const raw = (appointmentPeakHoursData ?? {}) as Record<string, number>;
    const header: (string | number)[] = ["Time", "Bookings"];
    const parseStartHour = (s: string) => {
      const part = s.split("-")[0] ?? s;
      const hour = parseInt(part.split(":")[0] ?? "0", 10);
      return Number.isNaN(hour) ? 0 : hour;
    };
    const rows = Object.keys(raw)
      .sort((a, b) => parseStartHour(a) - parseStartHour(b))
      .map((k) => [k, raw[k] ?? 0]);
    return [header, ...rows];
  }, [appointmentPeakHoursData]);

  const options = {
    chartArea: { left: 48, top: 48, width: "88%", height: "70%" },
    legend: {
      position: "top",
      alignment: "center",
      textStyle: { color: "#027f81" },
    },
    vAxis: {
      minValue: 0,
      textStyle: { color: "#027f81" },
    },
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
            <Select
              defaultValue={timeRange}
              onValueChange={(val) => setTimeRange(val)}
            >
              <SelectTrigger size="sm" className="w-40">
                <SelectValue>
                  {timeRange === "today"
                    ? "Today"
                    : timeRange === "last_7_days"
                      ? "Last 7 Days"
                      : "All Time"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                <SelectItem value="all_time">All Time</SelectItem>
              </SelectContent>
            </Select>
          </label>
        </div>
      </header>

      <div className="w-full shadow-md dark:shadow-gray-600 rounded-md">
        {isLoading ? (
          <div className="flex h-80 items-center justify-center">
            <LoaderPinwheel className="text-primary animate-spin" size={20} />
          </div>
        ) : chartData.length <= 1 ? (
          <div className="flex h-80 items-center justify-center">
            No peak hours data available.
          </div>
        ) : (
          <Chart
            chartType="ColumnChart"
            width="100%"
            height="360px"
            data={chartData}
            options={options}
          />
        )}
      </div>
    </section>
  );
};

export default PeakHours;
