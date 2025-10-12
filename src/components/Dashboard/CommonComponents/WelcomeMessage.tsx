"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  LoaderPinwheel,
  TrendingUp,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";

const WelcomeMessage: React.FC = () => {
  const { data: session, status } = useSession();

  const userName = session?.user?.first_name
    ? `${session.user.first_name} ${session.user.last_name || ""}`
    : session?.user?.email?.split("@")[0] || "User";

  const stats = [
    {
      icon: Calendar,
      label: "Appointments",
      value: "24",
      color: "bg-purple-500",
    },
    {
      icon: Users,
      label: "Clients",
      value: "156",
      color: "bg-blue-500",
    },
    {
      icon: TrendingUp,
      label: "Growth",
      value: "+12%",
      color: "bg-purple-400",
    },
    {
      icon: Clock,
      label: "Pending",
      value: "8",
      color: "bg-gray-400",
    },
  ];

  // Mock chart data points
  const chartPoints = [
    { x: 10, y: 60 },
    { x: 25, y: 45 },
    { x: 40, y: 55 },
    { x: 55, y: 35 },
    { x: 70, y: 50 },
    { x: 85, y: 25 },
    { x: 100, y: 30 },
  ];

  // Generate SVG path for chart
  const generatePath = () => {
    return chartPoints
      .map((point, index) => {
        const command = index === 0 ? "M" : "L";
        return `${command} ${point.x} ${point.y}`;
      })
      .join(" ");
  };

  return (
    <Card className="border shadow-md dark:shadow-gray-600">
      <div className="flex flex-col gap-8 p-8 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Welcome Text Section */}
        <div className="flex-1 space-y-4">
          <h1 className="text-foreground text-3xl font-bold md:text-4xl">
            Welcome to Afrobeutic!
          </h1>
          <Badge
            variant="secondary"
            className="bg-secondary hover:bg-secondary/90 rounded-md px-4 py-2 text-base font-semibold text-white"
          >
            {status === "loading" ? (
              <div className="flex items-center gap-2">
                <LoaderPinwheel className="h-6 w-10 animate-spin" />
              </div>
            ) : (
              <span>{userName}&apos;s account</span>
            )}
          </Badge>
        </div>

        {/* Right: Monitor/Dashboard Display */}
        <div className="flex-shrink-0">
          {/* Monitor Frame */}
          <div className="relative">
            {/* Monitor Screen */}
            <div className="border-foreground bg-background h-44 w-72 rounded-t-lg border-4 p-6">
              {/* Stats Grid (2x2) */}
              <div className="mb-4 grid grid-cols-2 gap-3">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className={`${stat.color} flex items-center justify-center rounded-full p-1.5`}
                      >
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-muted/40 h-2 flex-1 rounded-full">
                        <div
                          className={`${stat.color} h-full rounded-full`}
                          style={{ width: "70%" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chart */}
              <div className="bg-muted/20 relative h-16 rounded">
                <svg
                  className="h-full w-full"
                  viewBox="0 0 120 80"
                  preserveAspectRatio="none"
                >
                  {/* Chart line */}
                  <path
                    d={generatePath()}
                    fill="none"
                    stroke="rgb(124, 58, 237)"
                    strokeWidth="2"
                    className="drop-shadow-md"
                  />
                  {/* Data points */}
                  {chartPoints.map((point, index) => (
                    <circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r="2"
                      fill="rgb(124, 58, 237)"
                    />
                  ))}
                </svg>
              </div>
            </div>

            {/* Monitor Stand */}
            <div className="flex justify-center">
              <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700" />
            </div>
            <div className="flex justify-center">
              <div className="h-1 w-24 rounded-full bg-gray-400 dark:bg-gray-600" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WelcomeMessage;
