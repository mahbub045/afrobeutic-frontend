import React, { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/utils";
import { useGetRevenueAnalyticsQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Analytics/AnalyticsApi";
import { LoaderPinwheel } from "lucide-react";
import { useParams } from "next/navigation";

export interface RevenueProps {
  uid: string;
  booking_id: string;
  customer: {
    uid: string;
    first_name: string;
    last_name: string;
  };
  completed_at: string;
  final_price: number;
}

const Revenue: React.FC = () => {
  const { salonuid } = useParams();

  const [dateType, setDateType] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data: revenueData, isLoading } = useGetRevenueAnalyticsQuery({
    salonUid: salonuid,
    params: {
      status: "COMPLETED",
      ...(dateType && dateType !== "all" ? { date_type: dateType } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    },
  });

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Revenue</h2>
      </header>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-start">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Date Range:</label>
          <Select
            defaultValue={dateType}
            onValueChange={(val) => setDateType(val)}
          >
            <SelectTrigger size="sm" className="w-40">
              <SelectValue>
                {dateType === "today" && "Today"}
                {dateType === "next_day" && "Next Day"}
                {dateType === "previous_day" && "Previous Day"}
                {dateType === "this_week" && "This Week"}
                {dateType === "this_month" && "This Month"}
                {dateType === "previous_month" && "Previous Month"}
                {dateType === "last_6_month" && "Last 6 Months"}
                {dateType === "one_year" && "One Year"}
                {dateType === "custom" && "Custom"}
                {(!dateType || dateType === "all") && "All"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="next_day">Next Day</SelectItem>
              <SelectItem value="previous_day">Previous Day</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="previous_month">Previous Month</SelectItem>
              <SelectItem value="last_6_month">Last 6 Months</SelectItem>
              <SelectItem value="one_year">One Year</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 md:ml-4">
          <label className="text-sm font-medium">Search:</label>
          <div className="w-full md:w-72">
            <Input
              value={search}
              onChange={(e) => setSearch((e.target as HTMLInputElement).value)}
              placeholder="Booking ID or Customer Name"
            />
          </div>
        </div>
      </div>

      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Customer Name</TableHead>
              <TableHead>Finished At</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead className="text-center">Download Invoice</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-6 text-center">
                  <LoaderPinwheel className="text-primary mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : revenueData && revenueData.length > 0 ? (
              revenueData.map((rev: RevenueProps) => (
                <TableRow key={rev.uid}>
                  <TableCell>{rev.booking_id}</TableCell>
                  <TableCell>
                    {rev.customer.first_name} {rev.customer.last_name}
                  </TableCell>
                  <TableCell>{formatDateTime(rev.completed_at)}</TableCell>
                  <TableCell>${rev.final_price}</TableCell>
                  <TableCell className="text-center">
                    <a className="text-primary hover:underline" href="#">
                      Download
                    </a>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground py-6 text-center text-sm"
                >
                  No revenue records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};

export default Revenue;
