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
import type {
  DashboardFilterValue,
  OverviewStatsResponse,
} from "@/Types/ClientPanel/Home/OverviewTypes";
import { Calendar, ChevronDown, DollarSign, Inbox, LoaderPinwheel, Users } from "lucide-react";
import React from "react";

const Overview: React.FC = () => {
  const filterOptions: Array<{ label: string; value: DashboardFilterValue }> = [
    { label: "Last 7 days", value: "last_7_days" },
    { label: "Last 30 days", value: "last_30_days" },
    { label: "This month", value: "this_month" },
    { label: "This year", value: "this_year" },
    { label: "All time", value: "all_time" },
  ];

  const [bookingsFilter, setBookingsFilter] =
    React.useState<DashboardFilterValue>("last_7_days");
  const [incomeFilter, setIncomeFilter] =
    React.useState<DashboardFilterValue>("last_7_days");
  const [requestsFilter, setRequestsFilter] =
    React.useState<DashboardFilterValue>("last_7_days");
  const [clientsFilter, setClientsFilter] =
    React.useState<DashboardFilterValue>("last_7_days");

  const {
    data: bookingsData,
    isLoading: isBookingsLoading,
    isError: isBookingsError,
  } = useGetOverviewStatsQuery({ bookings_filter: bookingsFilter });

  const {
    data: incomeData,
    isLoading: isIncomeLoading,
    isError: isIncomeError,
  } = useGetOverviewStatsQuery({ income_filter: incomeFilter });

  const {
    data: requestsData,
    isLoading: isRequestsLoading,
    isError: isRequestsError,
  } = useGetOverviewStatsQuery({ requests_filter: requestsFilter });

  const {
    data: clientsData,
    isLoading: isClientsLoading,
    isError: isClientsError,
  } = useGetOverviewStatsQuery({ clients_filter: clientsFilter });

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

  const data1: OverviewStatsResponse | undefined = bookingsData;
  const data2: OverviewStatsResponse | undefined = incomeData;
  const data3: OverviewStatsResponse | undefined = requestsData;
  const data4: OverviewStatsResponse | undefined = clientsData;

  const totalBookings = data1?.card_1?.total_bookings ?? 0;
  const completionRatePct = normalizePercent(
    data1?.card_1?.booking_completion_rate,
  );
  const totalIncome = fmtMoney(data2?.card_2?.total_income);
  const clientRequests = data3?.card_3?.client_requests ?? 0;
  const totalClients = data4?.card_4?.total_clients ?? 0;

  const showBookingsFallback = isBookingsLoading || isBookingsError;
  const showIncomeFallback = isIncomeLoading || isIncomeError;
  const showRequestsFallback = isRequestsLoading || isRequestsError;
  const showClientsFallback = isClientsLoading || isClientsError;

  const getFilterLabel = (value: DashboardFilterValue) =>
    filterOptions.find((o) => o.value === value)?.label ?? "Last 7 days";

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
                    {getFilterLabel(bookingsFilter)}
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="text-dark">
                  {filterOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onSelect={() => setBookingsFilter(option.value)}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardAction>
          </CardHeader>
          <CardContent className="text-white">
            <h6>BOOKINGS</h6>
            <div className="text-2xl font-bold text-white dark:text-orange-100">
              {showBookingsFallback ? (
                <LoaderPinwheel className="h-6 w-6 animate-spin" />
              ) : (
                totalBookings
              )}
            </div>
            <CardDescription className="mt-2 mb-1 text-white">
              Completed rate
            </CardDescription>
            <Progress
              value={showBookingsFallback ? 0 : completionRatePct}
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
                    {getFilterLabel(incomeFilter)}
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="text-dark">
                  {filterOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onSelect={() => setIncomeFilter(option.value)}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardAction>
          </CardHeader>
          <CardContent>
            <h6 className="text-white">TOTAL INCOME</h6>
            <div className="text-2xl font-bold text-white dark:text-green-100">
              {showIncomeFallback ? (
                <LoaderPinwheel className="h-6 w-6 animate-spin" />
              ) : (
                totalIncome
              )}
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
                    {getFilterLabel(requestsFilter)}
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="text-dark">
                  {filterOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onSelect={() => setRequestsFilter(option.value)}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardAction>
          </CardHeader>
          <CardContent>
            <h6 className="text-white">CLIENT REQUESTS</h6>
            <div className="text-2xl font-bold text-white dark:text-blue-100">
              {showRequestsFallback ? (
                <LoaderPinwheel className="h-6 w-6 animate-spin" />
              ) : (
                clientRequests
              )}
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
                    {getFilterLabel(clientsFilter)}
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="text-dark">
                  {filterOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onSelect={() => setClientsFilter(option.value)}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardAction>
          </CardHeader>
          <CardContent>
            <h6 className="text-white">TOTAL CLIENTS</h6>
            <div className="text-2xl font-bold text-white dark:text-purple-100">
              {showClientsFallback ? (
                <LoaderPinwheel className="h-6 w-6 animate-spin" />
              ) : (
                totalClients
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Overview;
