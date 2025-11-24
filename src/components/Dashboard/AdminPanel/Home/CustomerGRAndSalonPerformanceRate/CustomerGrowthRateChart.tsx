"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { month: "Jan", bookings: 150, cancellations: 5 },
  { month: "Feb", bookings: 105, cancellations: 40 },
  { month: "Mar", bookings: 160, cancellations: 8 },
  { month: "Apr", bookings: 300, cancellations: 10 },
  { month: "May", bookings: 195, cancellations: 80 },
  { month: "Jun", bookings: 220, cancellations: 15 },
  { month: "Jul", bookings: 240, cancellations: 18 },
  { month: "Aug", bookings: 200, cancellations: 50 },
  { month: "Sep", bookings: 280, cancellations: 22 },
  { month: "Oct", bookings: 300, cancellations: 25 },
  { month: "Nov", bookings: 320, cancellations: 208 },
  { month: "Dec", bookings: 250, cancellations: 30 },
];

export default function CustomerGrowthRateChart() {
  return (
    <div className="w-full rounded-md bg-white p-4 shadow-sm dark:bg-slate-800">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Customer Growth Rate
          </h3>
          <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
            Monthly bookings vs cancellations
          </p>
        </div>
        <div className="text-xs text-slate-400">Week ▾</div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="colorCancellations" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fb7185" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#fb7185" stopOpacity={0.03} />
            </linearGradient>
          </defs>

          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(val) => `${val / 1000}k`} />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "#cbd5e1", strokeWidth: 2 }}
          />
          <Legend verticalAlign="top" height={36} />

          <Area
            type="monotone"
            dataKey="bookings"
            stroke="#4f46e5"
            fillOpacity={1}
            fill="url(#colorBookings)"
            strokeWidth={2}
            activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
            name="Bookings"
          />

          <Area
            type="monotone"
            dataKey="cancellations"
            stroke="#fb7185"
            fillOpacity={1}
            fill="url(#colorCancellations)"
            strokeWidth={2}
            activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
            name="Cancellations"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: unknown;
  label?: string;
}) {
  if (!active || !payload) return null;

  const arr = Array.isArray(payload)
    ? (payload as Array<Record<string, unknown>>)
    : [];
  if (arr.length === 0) return null;

  const bookings =
    (arr.find((p) => p["dataKey"] === "bookings")?.["value"] as number) ?? 0;
  const cancellations =
    (arr.find((p) => p["dataKey"] === "cancellations")?.["value"] as number) ??
    0;
  const total = bookings + cancellations || 1;

  const bookingsPct = Math.round((bookings / total) * 100);
  const cancellationsPct = 100 - bookingsPct;

  return (
    <div className="rounded bg-white p-2 text-xs shadow-md dark:bg-slate-800">
      <div className="font-medium text-slate-700 dark:text-slate-200">
        {label}
      </div>
      <div className="mt-1 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-sm bg-[#4f46e5]" />
          <span className="text-slate-600 dark:text-slate-300">
            {bookingsPct}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-sm bg-[#fb7185]" />
          <span className="text-slate-600 dark:text-slate-300">
            {cancellationsPct}%
          </span>
        </div>
      </div>
    </div>
  );
}
