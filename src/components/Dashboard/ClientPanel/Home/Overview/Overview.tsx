import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { useGetOverviewStatsQuery } from "@/Redux/Reducers/ClientPanel/Home/OverviewApi";
import type { OverviewStatsResponse } from "@/Types/ClientPanel/Home/OverviewTypes";
import { Calendar, ChevronDown, DollarSign, Inbox, Users } from "lucide-react";
import React from "react";

const Overview: React.FC = () => {
  const {
    data: overviewData,
    isLoading,
    isError,
  } = useGetOverviewStatsQuery(undefined);

  const data: OverviewStatsResponse | undefined = overviewData;

  const normalizePercent = (value?: number) => {
    const n = Number(value ?? 0);
    // Accept either fraction (0..1) or percent (0..100)
    const pct = n <= 1 ? n * 100 : n;
    return Math.max(0, Math.min(100, pct));
  };

  const fmtMoney = (value?: number) => {
    const n = Number(value ?? 0);
    if (!Number.isFinite(n)) return "$0.00";
    return `$${n.toFixed(2)}`;
  };

  const totalBookings = data?.card_1?.total_bookings ?? 0;
  const completionRatePct = normalizePercent(
    data?.card_1?.booking_completion_rate,
  );
  const totalIncome = fmtMoney(data?.card_2?.total_income);
  const clientRequests = data?.card_3?.client_requests ?? 0;
  const totalClients = data?.card_4?.total_clients ?? 0;

  const showFallback = isLoading || isError;

  return (
    <section className="mt-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Bookings Card */}
        <Card className="border-0 bg-gradient-to-br from-orange-600 to-orange-400 shadow-md dark:from-orange-950 dark:to-orange-900 dark:shadow-lg dark:shadow-gray-600">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground flex items-center gap-2 text-xs dark:text-orange-200">
              <span className="flex items-center justify-center rounded-lg bg-orange-600 p-2 dark:bg-orange-700">
                <Calendar className="size-5 text-white" />
              </span>
            </CardTitle>
            <CardAction>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 px-2 py-1 text-white hover:bg-orange-600 hover:text-white dark:shadow-gray-600"
                  >
                    Last 7 days
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="text-dark">
                  <DropdownMenuItem>Last 7 days</DropdownMenuItem>
                  <DropdownMenuItem>Last 30 days</DropdownMenuItem>
                  <DropdownMenuItem>This month</DropdownMenuItem>
                  <DropdownMenuItem>This year</DropdownMenuItem>
                  <DropdownMenuItem>All time</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardAction>
          </CardHeader>
          <CardContent className="text-white">
            <h6>BOOKINGS</h6>
            <div className="text-2xl font-bold text-white dark:text-orange-100">
              {showFallback ? 0 : totalBookings}
            </div>
            <CardDescription className="mt-2 mb-1 text-white">
              Completed rate
            </CardDescription>
            <Progress
              value={showFallback ? 0 : completionRatePct}
              className="h-1.5"
            />
          </CardContent>
        </Card>

        {/* Total Income Card */}
        <Card className="border-0 bg-gradient-to-br from-green-600 to-green-400 shadow-md dark:from-green-950 dark:to-green-900 dark:shadow-lg dark:shadow-gray-600">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground flex items-center gap-2 text-xs dark:text-green-200">
              <span className="flex items-center justify-center rounded-lg bg-green-600 p-2 dark:bg-green-700">
                <DollarSign className="size-5 text-white" />
              </span>
            </CardTitle>
            <CardAction>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 px-2 py-1 text-white hover:bg-green-600 hover:text-white dark:shadow-gray-600"
                  >
                    Last 7 days
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="text-dark">
                  <DropdownMenuItem>Last 7 days</DropdownMenuItem>
                  <DropdownMenuItem>Last 30 days</DropdownMenuItem>
                  <DropdownMenuItem>This month</DropdownMenuItem>
                  <DropdownMenuItem>This year</DropdownMenuItem>
                  <DropdownMenuItem>All time</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardAction>
          </CardHeader>
          <CardContent>
            <h6 className="text-white">TOTAL INCOME</h6>
            <div className="text-2xl font-bold text-white dark:text-green-100">
              {showFallback ? "$0.00" : totalIncome}
            </div>
          </CardContent>
        </Card>

        {/* Client Requests Card */}
        <Card className="border-0 bg-gradient-to-br from-blue-600 to-blue-400 shadow-md dark:from-blue-950 dark:to-blue-900 dark:shadow-lg dark:shadow-gray-600">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground flex items-center gap-2 text-xs dark:text-blue-200">
              <span className="flex items-center justify-center rounded-lg bg-blue-600 p-2 dark:bg-blue-700">
                <Inbox className="size-5 text-white" />
              </span>
            </CardTitle>
            <CardAction>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 px-2 py-1 text-white hover:bg-blue-600 hover:text-white dark:shadow-gray-600"
                  >
                    Last 7 days
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="text-dark">
                  <DropdownMenuItem>Last 7 days</DropdownMenuItem>
                  <DropdownMenuItem>Last 30 days</DropdownMenuItem>
                  <DropdownMenuItem>This month</DropdownMenuItem>
                  <DropdownMenuItem>This year</DropdownMenuItem>
                  <DropdownMenuItem>All time</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardAction>
          </CardHeader>
          <CardContent>
            <h6 className="text-white">CLIENT REQUESTS</h6>
            <div className="text-2xl font-bold text-white dark:text-blue-100">
              {showFallback ? 0 : clientRequests}
            </div>
          </CardContent>
        </Card>

        {/* Total Clients Card */}
        <Card className="border-0 bg-gradient-to-br from-purple-600 to-purple-400 shadow-md dark:from-purple-950 dark:to-purple-900 dark:shadow-lg dark:shadow-gray-600">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground flex items-center gap-2 text-xs dark:text-purple-200">
              <span className="flex items-center justify-center rounded-lg bg-purple-600 p-2 dark:bg-purple-700">
                <Users className="size-5 text-white" />
              </span>
            </CardTitle>
            <CardAction>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 px-2 py-1 text-white hover:bg-purple-600 hover:text-white dark:shadow-gray-600"
                  >
                    Last 7 days
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="text-dark">
                  <DropdownMenuItem>Last 7 days</DropdownMenuItem>
                  <DropdownMenuItem>Last 30 days</DropdownMenuItem>
                  <DropdownMenuItem>This month</DropdownMenuItem>
                  <DropdownMenuItem>This year</DropdownMenuItem>
                  <DropdownMenuItem>All time</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardAction>
          </CardHeader>
          <CardContent>
            <h6 className="text-white">TOTAL CLIENTS</h6>
            <div className="text-2xl font-bold text-white dark:text-purple-100">
              {showFallback ? 0 : totalClients}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Overview;
