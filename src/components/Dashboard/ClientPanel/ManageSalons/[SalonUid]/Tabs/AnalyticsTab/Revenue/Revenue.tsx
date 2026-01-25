import React from "react";

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
  const { data: revenueData, isLoading } = useGetRevenueAnalyticsQuery({
    salonUid: salonuid,
    params: {
      status: "COMPLETED",
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
          <Select defaultValue="today">
            <SelectTrigger size="sm" className="w-40">
              <SelectValue>Today</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 md:ml-4">
          <label className="text-sm font-medium">Search:</label>
          <div className="w-full md:w-72">
            <Input placeholder="Booking ID or Customer Name" />
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
                  <LoaderPinwheel className="mx-auto h-6 w-6 animate-spin text-primary" />
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
