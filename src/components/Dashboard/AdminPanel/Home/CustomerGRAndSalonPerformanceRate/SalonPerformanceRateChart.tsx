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
  { month: "Jan", perf: 25 },
  { month: "Feb", perf: 82 },
  { month: "Mar", perf: 58 },
  { month: "Apr", perf: 85 },
  { month: "May", perf: 88 },
  { month: "Jun", perf: 40 },
  { month: "Jul", perf: 92 },
  { month: "Aug", perf: 93 },
  { month: "Sep", perf: 91 },
  { month: "Oct", perf: 44 },
  { month: "Nov", perf: 95 },
  { month: "Dec", perf: 96 },
];

const SalonPerformanceRateChart = () => {
  return (
    <div className="w-full rounded-md bg-white p-4 shadow-sm dark:bg-slate-800">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Salon Performance
          </h3>
          <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
            Monthly salon performance rate
          </p>
        </div>
        <div className="text-xs text-slate-400">Month ▾</div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="perfGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis domain={[20, 100]} tickFormatter={(v) => `${v}%`} />
          <Tooltip
            content={<PerfTooltip />}
            cursor={{ stroke: "#cbd5e1", strokeWidth: 2 }}
          />
          <Legend verticalAlign="top" height={36} />

          <Area
            type="monotone"
            dataKey="perf"
            stroke="#06b6d4"
            fill="url(#perfGradient)"
            strokeWidth={2}
            activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
            name="Performance"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

function PerfTooltip({
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

  const perf = (arr[0]["value"] as number) ?? 0;

  return (
    <div className="rounded bg-white p-2 text-xs shadow-md dark:bg-slate-800">
      <div className="font-medium text-slate-700 dark:text-slate-200">
        {label}
      </div>
      <div className="mt-1 text-slate-600 dark:text-slate-300">{perf}%</div>
    </div>
  );
}

export default SalonPerformanceRateChart;
