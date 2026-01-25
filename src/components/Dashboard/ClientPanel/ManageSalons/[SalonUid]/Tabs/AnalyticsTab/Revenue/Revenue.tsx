import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
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
import {
  useDownloadRevenueReportMutation,
  useGetRevenueAnalyticsQuery,
} from "@/Redux/Reducers/ClientPanel/ManageSalons/Analytics/AnalyticsApi";
import { RevenueProps } from "@/Types/ClientPanel/ManageSalonTypes/AnalyticsTypes/AnalyticsTypes";
import { LoaderPinwheel } from "lucide-react";
import { useParams } from "next/navigation";

const Revenue: React.FC = () => {
  const { salonuid } = useParams();
  const [dateType, setDateType] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(12);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    // Reset to first page when filters/search change
    setPage(1);
  }, [dateType, debouncedSearch]);

  const { data: revenueData, isLoading } = useGetRevenueAnalyticsQuery({
    salonUid: salonuid,
    params: {
      status: "COMPLETED",
      ...(dateType && dateType !== "all" ? { date_type: dateType } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    },
  });
  const [downloadRevenueReport] = useDownloadRevenueReportMutation();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (rev: RevenueProps) => {
    setDownloadingId(rev.uid);
    try {
      const blob = await downloadRevenueReport({
        salonUid: salonuid,
        bookingUid: rev.uid,
      }).unwrap();
      const url = URL.createObjectURL(blob as Blob);
      const ext = (blob as Blob).type === "application/pdf" ? "pdf" : "bin";
      const filename = `${rev.booking_id}-receipt.${ext}`;
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      // optional: show user notification
      console.error("Error downloading invoice:", err);
    } finally {
      setDownloadingId(null);
    }
  };

  const totalCount = revenueData ? revenueData.length : 0;
  const maxPage = Math.max(1, Math.ceil(totalCount / pageSize));
  // keep page within bounds if data or pageSize changes
  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), maxPage));
  }, [totalCount, pageSize, maxPage]);

  const startIdx = (page - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalCount);
  const paginatedData = revenueData ? revenueData.slice(startIdx, endIdx) : [];

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Revenue</h2>
      </header>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Date Range:</label>
          <Select
            defaultValue={dateType}
            onValueChange={(val) => setDateType(val)}
          >
            <SelectTrigger size="sm" className="w-40">
              <SelectValue>
                {(!dateType || dateType === "all") && "All"}
                {dateType === "today" && "Today"}
                {dateType === "next_day" && "Next Day"}
                {dateType === "previous_day" && "Previous Day"}
                {dateType === "this_week" && "This Week"}
                {dateType === "this_month" && "This Month"}
                {dateType === "previous_month" && "Previous Month"}
                {dateType === "last_6_month" && "Last 6 Months"}
                {dateType === "one_year" && "One Year"}
                {dateType === "custom" && "Custom"}
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
            ) : totalCount > 0 ? (
              paginatedData.map((rev: RevenueProps) => (
                <TableRow key={rev.uid}>
                  <TableCell>{rev.booking_id}</TableCell>
                  <TableCell>
                    {rev.customer.first_name} {rev.customer.last_name}
                  </TableCell>
                  <TableCell>{formatDateTime(rev.completed_at)}</TableCell>
                  <TableCell>${rev.final_price}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="link"
                      onClick={() => handleDownload(rev)}
                      disabled={downloadingId === rev.uid}
                    >
                      {downloadingId === rev.uid ? (
                        <LoaderPinwheel className="inline-block h-4 w-4 animate-spin" />
                      ) : (
                        "Download"
                      )}
                    </Button>
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
        <div className="mb-2 flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            <span className="font-medium">Total:</span> {totalCount}
            {totalCount > 0 && (
              <span className="ml-3">
                Showing {startIdx + 1} - {endIdx} of {totalCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Button
                size="xs"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Prev
              </Button>
              <div className="text-sm">
                Page {page} / {maxPage}
              </div>
              <Button
                size="xs"
                onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
                disabled={page >= maxPage}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Revenue;
