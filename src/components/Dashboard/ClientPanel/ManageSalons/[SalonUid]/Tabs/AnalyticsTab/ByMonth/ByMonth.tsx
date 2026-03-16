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
import { useGetAppointmentsByMonthQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Analytics/AnalyticsApi";
import { LoaderPinwheel } from "lucide-react";
import { useParams } from "next/navigation";

const ByMonth: React.FC = () => {
  const { salonuid } = useParams();
  const now = new Date();
  const [monthValue, setMonthValue] = useState<number>(now.getMonth() + 1);
  const [yearValue, setYearValue] = useState<number>(now.getFullYear());

  const { data: appointmentByMonthData, isLoading } =
    useGetAppointmentsByMonthQuery({
      salonUid: salonuid,
      params: { month: monthValue, year: yearValue },
    });

  const selectedMonthName = useMemo(
    () =>
      new Date(yearValue, monthValue - 1).toLocaleString(undefined, {
        month: "long",
      }),
    [monthValue, yearValue],
  );

  const chartData = useMemo(() => {
    const raw = (appointmentByMonthData ?? {}) as Record<string, number>;
    const header = ["Day", "Bookings", { role: "tooltip", type: "string" }];
    const rows = Object.keys(raw)
      .sort((a, b) => Number(a) - Number(b))
      .map((k) => {
        const day = Number(k);
        const bookings = raw[k] ?? 0;
        return [
          String(day),
          bookings,
          `${selectedMonthName}:${day}\nBookings: ${bookings}`,
        ];
      });
    return [header, ...rows];
  }, [appointmentByMonthData, selectedMonthName]);

  const options = {
    chartArea: { left: 48, top: 48, width: "95%", height: "70%" },
    legend: {
      position: "top",
      alignment: "center",
      textStyle: { color: "#027f81" },
    },
    vAxis: { minValue: 0, textStyle: { color: "#027f81" } },
    hAxis: {
      textStyle: { color: "#027f81", fontSize: 12 },
      showTextEvery: 1,
      slantedText: false,
    },
    backgroundColor: "transparent",
    colors: ["#2b9cff"],
    tooltip: { trigger: "both" },
  };

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">By Month</h3>
        </div>
        <div className="flex items-center gap-2">
          <Select
            defaultValue={String(monthValue)}
            onValueChange={(val) => setMonthValue(Number(val))}
          >
            <SelectTrigger size="sm" className="w-40">
              <SelectValue>
                {new Date(0, monthValue - 1).toLocaleString(undefined, {
                  month: "long",
                })}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <SelectItem key={m} value={String(m)}>
                  {new Date(0, m - 1).toLocaleString(undefined, {
                    month: "long",
                  })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            defaultValue={String(yearValue)}
            onValueChange={(val) => setYearValue(Number(val))}
          >
            <SelectTrigger size="sm" className="w-28">
              <SelectValue>{String(yearValue)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 6 }, (_, i) => now.getFullYear() - i).map(
                (y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ),
              )}
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
            No bookings data available.
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

export default ByMonth;
