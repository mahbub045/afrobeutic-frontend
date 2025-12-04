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
import { Calendar, ChevronDown, DollarSign, Inbox, Users } from "lucide-react";
import React from "react";

const Overview: React.FC = () => {
  return (
    <section className="mt-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Bookings Card */}
        <Card className="border-0 bg-gradient-to-br from-orange-500 to-orange-400 shadow-md dark:from-orange-950 dark:to-orange-900 dark:shadow-lg dark:shadow-gray-600">
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
                <DropdownMenuContent
                  align="end"
                  className="bg-orange-500 text-white"
                >
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
              0
            </div>
            <CardDescription className="mt-2 mb-1 text-white">
              Completed rate
            </CardDescription>
            <Progress value={50} className="h-1.5" />
          </CardContent>
        </Card>

        {/* Total Income Card */}
        <Card className="border-0 bg-gradient-to-br from-green-500 to-green-400 shadow-md dark:from-green-950 dark:to-green-900 dark:shadow-lg dark:shadow-gray-600">
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
                <DropdownMenuContent
                  align="end"
                  className="bg-green-500 text-white"
                >
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
              $0
            </div>
          </CardContent>
        </Card>

        {/* Client Requests Card */}
        <Card className="border-0 bg-gradient-to-br from-blue-500 to-blue-400 shadow-md dark:from-blue-950 dark:to-blue-900 dark:shadow-lg dark:shadow-gray-600">
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
                <DropdownMenuContent
                  align="end"
                  className="bg-blue-500 text-white"
                >
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
              0
            </div>
          </CardContent>
        </Card>

        {/* Total Clients Card */}
        <Card className="border-0 bg-gradient-to-br from-purple-500 to-purple-400 shadow-md dark:from-purple-950 dark:to-purple-900 dark:shadow-lg dark:shadow-gray-600">
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
                <DropdownMenuContent
                  align="end"
                  className="bg-purple-500 text-white"
                >
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
              0
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Overview;
