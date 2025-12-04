"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAccountSwitch } from "@/hooks/use-account-switch";
import { useGetAccountAccesserQuery } from "@/Redux/Reducers/ClientPanel/SwitchAccount/SwitchAccountApi";
import {
  Calendar,
  Clock,
  LoaderPinwheel,
  TrendingUp,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useMemo } from "react";

const WelcomeMessage: React.FC = () => {
  const { data: session, status } = useSession();
  const { activeAccountId } = useAccountSwitch();
  const { data: accountsData } = useGetAccountAccesserQuery();

  const isViewingDifferentAccount =
    activeAccountId && activeAccountId !== session?.user?.account_id;

  const userName = session?.user?.first_name
    ? `${session.user.first_name} ${session.user.last_name || ""}`
    : session?.user?.email?.split("@")[0] || "User";

  // Find the active account details
  const activeAccount = useMemo(() => {
    if (!isViewingDifferentAccount || !accountsData?.results) return null;
    return accountsData.results.find((acc) => acc.uid === activeAccountId);
  }, [isViewingDifferentAccount, activeAccountId, accountsData]);

  const accountDisplayName =
    isViewingDifferentAccount && activeAccount
      ? `${activeAccount.owner_name}'s account`
      : `${userName}'s account`;

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
    <Card className="relative overflow-hidden border shadow-md dark:shadow-gray-600">
      {/* Background Overlay */}
      <div className="pointer-events-none absolute inset-0">
        {/* World Map Background from SVG file */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[1] dark:opacity-5">
          <Image
            src="/images/common/world.svg"
            alt=""
            fill
            className="object-cover opacity-50"
            priority={false}
          />
        </div>

        {/* Top left solid circle */}
        <div className="absolute top-8 left-8 h-8 w-8 rounded-full bg-cyan-400/60 sm:h-12 sm:w-12" />

        {/* Bottom right large circle with blur */}
        <div className="absolute -right-24 -bottom-24 h-32 w-32 rounded-full bg-cyan-300/50 blur-3xl sm:h-40 sm:w-40" />

        {/* Middle right solid circle */}
        <div className="absolute right-12 bottom-24 h-20 w-20 rounded-full bg-cyan-400/50 sm:right-16 sm:bottom-32 sm:h-24 sm:w-24" />

        {/* Wavy lines - prominent and smooth */}
        <svg
          className="absolute top-0 left-0 h-full w-full"
          viewBox="0 0 1200 500"
          preserveAspectRatio="none"
        >
          {/* Dense flowing wave lines */}
          <path
            d="M0,160 Q150,100 300,140 T600,125 T900,145 T1200,130"
            fill="none"
            stroke="rgb(34, 211, 238)"
            strokeWidth="1"
            opacity="0.85"
          />
          <path
            d="M0,166 Q150,106 300,146 T600,131 T900,151 T1200,136"
            fill="none"
            stroke="rgb(34, 211, 238)"
            strokeWidth="1"
            opacity="0.83"
          />
          <path
            d="M0,172 Q150,112 300,152 T600,137 T900,157 T1200,142"
            fill="none"
            stroke="rgb(34, 211, 238)"
            strokeWidth="0.95"
            opacity="0.81"
          />
          <path
            d="M0,178 Q150,118 300,158 T600,143 T900,163 T1200,148"
            fill="none"
            stroke="rgb(34, 211, 238)"
            strokeWidth="0.95"
            opacity="0.79"
          />
          <path
            d="M0,184 Q150,124 300,164 T600,149 T900,169 T1200,154"
            fill="none"
            stroke="rgb(34, 211, 238)"
            strokeWidth="0.9"
            opacity="0.77"
          />
          <path
            d="M0,190 Q150,130 300,170 T600,155 T900,175 T1200,160"
            fill="none"
            stroke="rgb(34, 211, 238)"
            strokeWidth="0.9"
            opacity="0.75"
          />
          <path
            d="M0,196 Q150,136 300,176 T600,161 T900,181 T1200,166"
            fill="none"
            stroke="rgb(34, 211, 238)"
            strokeWidth="0.85"
            opacity="0.73"
          />
          <path
            d="M0,202 Q150,142 300,182 T600,167 T900,187 T1200,172"
            fill="none"
            stroke="rgb(34, 211, 238)"
            strokeWidth="0.85"
            opacity="0.71"
          />
          <path
            d="M0,208 Q150,148 300,188 T600,173 T900,193 T1200,178"
            fill="none"
            stroke="rgb(34, 211, 238)"
            strokeWidth="0.8"
            opacity="0.69"
          />
          <path
            d="M0,214 Q150,154 300,194 T600,179 T900,199 T1200,184"
            fill="none"
            stroke="rgb(34, 211, 238)"
            strokeWidth="0.8"
            opacity="0.67"
          />
          <path
            d="M0,220 Q150,160 300,200 T600,185 T900,205 T1200,190"
            fill="none"
            stroke="rgb(34, 211, 238)"
            strokeWidth="0.75"
            opacity="0.65"
          />
          <path
            d="M0,226 Q150,166 300,206 T600,191 T900,211 T1200,196"
            fill="none"
            stroke="rgb(34, 211, 238)"
            strokeWidth="0.75"
            opacity="0.63"
          />
          <path
            d="M0,232 Q150,172 300,212 T600,197 T900,217 T1200,202"
            fill="none"
            stroke="rgb(34, 211, 238)"
            strokeWidth="0.7"
            opacity="0.61"
          />
          <path
            d="M0,238 Q150,178 300,218 T600,203 T900,223 T1200,208"
            fill="none"
            stroke="rgb(34, 211, 238)"
            strokeWidth="0.7"
            opacity="0.59"
          />
          <path
            d="M0,244 Q150,184 300,224 T600,209 T900,229 T1200,214"
            fill="none"
            stroke="rgb(34, 211, 238)"
            strokeWidth="0.65"
            opacity="0.57"
          />
          <path
            d="M0,250 Q150,190 300,230 T600,215 T900,235 T1200,220"
            fill="none"
            stroke="rgb(34, 211, 238)"
            strokeWidth="0.65"
            opacity="0.55"
          />
          <path
            d="M0,256 Q150,196 300,236 T600,221 T900,241 T1200,226"
            fill="none"
            stroke="rgb(34, 211, 238)"
            strokeWidth="0.6"
            opacity="0.53"
          />
          <path
            d="M0,262 Q150,202 300,242 T600,227 T900,247 T1200,232"
            fill="none"
            stroke="rgb(34, 211, 238)"
            strokeWidth="0.6"
            opacity="0.51"
          />
          <path
            d="M0,268 Q150,208 300,248 T600,233 T900,253 T1200,238"
            fill="none"
            stroke="rgb(34, 211, 238)"
            strokeWidth="0.55"
            opacity="0.49"
          />
          <path
            d="M0,274 Q150,214 300,254 T600,239 T900,259 T1200,244"
            fill="none"
            stroke="rgb(34, 211, 238)"
            strokeWidth="0.5"
            opacity="0.47"
          />
        </svg>

        {/* Additional small circles */}
        <div className="absolute top-14 right-1/4 h-10 w-10 rounded-full bg-cyan-200/40 blur-lg" />
        <div className="absolute top-1/4 left-1/3 h-8 w-8 rounded-full bg-cyan-300/35 blur-md" />
      </div>

      <div className="relative flex flex-col gap-6 p-4 sm:p-6 md:p-8 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Welcome Text Section */}
        <div className="flex-1 space-y-3 sm:space-y-4">
          <h1 className="text-foreground text-2xl font-bold sm:text-3xl md:text-4xl">
            Welcome to Afrobeutic!
          </h1>
          <Badge
            variant="secondary"
            className="bg-secondary hover:bg-secondary/90 inline-flex rounded-md px-3 py-1.5 text-sm font-semibold text-white sm:px-4 sm:py-2 sm:text-base"
          >
            {status === "loading" ? (
              <div className="flex items-center gap-2">
                <LoaderPinwheel className="h-4 w-4 animate-spin sm:h-6 sm:w-10" />
              </div>
            ) : (
              <span>{accountDisplayName}</span>
            )}
          </Badge>
        </div>

        {/* Right: Monitor/Dashboard Display */}
        <div className="flex-shrink-0 self-center">
          {/* Monitor Frame */}
          <div className="relative">
            {/* Monitor Screen */}
            <div className="border-foreground bg-background h-32 w-56 rounded-t-lg border-2 p-4 sm:h-40 sm:w-64 sm:border-3 sm:p-5 lg:h-44 lg:w-72 lg:border-4 lg:p-6">
              {/* Stats Grid (2x2) */}
              <div className="mb-3 grid grid-cols-2 gap-2 sm:mb-4 sm:gap-3">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-1.5 sm:gap-2"
                    >
                      <div
                        className={`${stat.color} flex items-center justify-center rounded-full p-1 sm:p-1.5`}
                      >
                        <Icon className="h-3 w-3 text-white sm:h-4 sm:w-4" />
                      </div>
                      <div className="bg-muted/40 h-1.5 flex-1 rounded-full sm:h-2">
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
              <div className="bg-muted/20 relative h-12 rounded sm:h-14 lg:h-16">
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
              <div className="h-4 w-12 bg-gray-300 sm:h-5 sm:w-14 lg:h-6 lg:w-16 dark:bg-gray-700" />
            </div>
            <div className="flex justify-center">
              <div className="h-0.5 w-16 rounded-full bg-gray-400 sm:h-1 sm:w-20 lg:w-24 dark:bg-gray-600" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WelcomeMessage;
