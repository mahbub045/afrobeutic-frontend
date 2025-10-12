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
  DropdownMenuSeparator,
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
        <Card className="shadow-md dark:shadow-gray-600">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground flex items-center gap-2 text-xs">
              <span className="bg-primary flex items-center justify-center rounded-lg p-2">
                <Calendar className="size-5 text-white" />
              </span>
            </CardTitle>
            <CardAction>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground gap-1 px-2 py-1 dark:shadow-gray-600"
                  >
                    Last 7 days
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuSeparator />
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
            <h6>BOOKINGS</h6>
            <div className="text-2xl font-bold">0</div>
            <CardDescription className="mt-2 mb-1">
              Completed rate
            </CardDescription>
            <Progress value={50} className="h-1.5" />
          </CardContent>
        </Card>

        {/* Total Income Card */}
        <Card className="shadow-md dark:shadow-gray-600">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground flex items-center gap-2 text-xs">
              <span className="flex items-center justify-center rounded-lg bg-green-600 p-2">
                <DollarSign className="size-5 text-white" />
              </span>
            </CardTitle>
            <CardAction>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground gap-1 px-2 py-1 dark:shadow-gray-600"
                  >
                    Last 7 days
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuSeparator />
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
            <h6>TOTAL INCOME</h6>
            <div className="text-2xl font-bold">$0</div>
          </CardContent>
        </Card>

        {/* Client Requests Card */}
        <Card className="shadow-md dark:shadow-gray-600">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground flex items-center gap-2 text-xs">
              <span className="flex items-center justify-center rounded-lg bg-blue-600 p-2">
                <Inbox className="size-5 text-white" />
              </span>
            </CardTitle>
            <CardAction>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground gap-1 px-2 py-1 dark:shadow-gray-600"
                  >
                    Last 7 days
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuSeparator />
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
            <h6>CLIENT REQUESTS</h6>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        {/* Total Clients Card */}
        <Card className="shadow-md dark:shadow-gray-600">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground flex items-center gap-2 text-xs">
              <span className="flex items-center justify-center rounded-lg bg-purple-600 p-2">
                <Users className="size-5 text-white" />
              </span>
            </CardTitle>
            <CardAction>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground gap-1 px-2 py-1 dark:shadow-gray-600"
                  >
                    Last 7 days
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuSeparator />
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
            <h6>TOTAL CLIENTS</h6>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Overview;
