"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetAppointmentsPeakDaysQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Analytics/AnalyticsApi";
import { LoaderPinwheel } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useMemo, useState } from "react";
import { Chart } from "react-google-charts";

const PeakDays: React.FC = () => {
  const [range, setRange] = useState<string>("this_week");
  const { salonuid } = useParams();

  const { data: appointmentPeakDaysData, isLoading } =
    useGetAppointmentsPeakDaysQuery({
      salonUid: salonuid,
      params: { period: range },
    });

  const chartData = useMemo(() => {
    const raw = (appointmentPeakDaysData ?? {}) as Record<string, number>;
    const header: (string | number)[] = ["Day", "Bookings"];
    const weekOrder = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    // If API returns those keys, keep the canonical order; otherwise fallback to keys order
    const rows: (string | number)[][] = weekOrder.map((d) => [d, raw[d] ?? 0]);
    // If API returned other keys (not matching weekOrder), include them as well
    const extraKeys = Object.keys(raw).filter((k) => !weekOrder.includes(k));
    if (extraKeys.length) {
      extraKeys.sort();
      extraKeys.forEach((k) => rows.push([k, raw[k] ?? 0]));
    }

    return [header, ...rows];
  }, [appointmentPeakDaysData]);
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
        <h3 className="text-lg font-semibold">Peak Days in a Week</h3>

        <div className="flex items-center gap-2">
          <Select defaultValue={range} onValueChange={(val) => setRange(val)}>
            <SelectTrigger size="sm" className="w-40">
              <SelectValue>
                {range === "this_week"
                  ? "This Week"
                  : range === "last_week"
                    ? "Last Week"
                    : range === "all_time"
                      ? "All Time"
                      : "This Week"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="last_week">Last Week</SelectItem>
              <SelectItem value="all_time">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="w-full rounded-md shadow-md dark:shadow-gray-600">
        {isLoading ? (
          <div className="flex h-[360px] items-center justify-center">
            <LoaderPinwheel className="text-primary animate-spin" size={20} />
          </div>
        ) : chartData.length <= 1 ? (
          <div className="flex h-[360px] items-center justify-center">
            No peak days data available.
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

export default PeakDays;
