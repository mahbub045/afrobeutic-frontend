"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatChoiceFieldValue, formatDateTime } from "@/lib/utils";
import { useGetCustomerBookingsQuery } from "@/Redux/Api/CustomerBaseApi";
import {
  CustomerBooking,
  CustomerBookingsResponse,
} from "@/Types/Customer/BookingTypes";
import { ChevronLeft, ChevronRight, Eye, LoaderPinwheel } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const BookingList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);

  const {
    data: bookingsData,
    isLoading,
    isFetching,
    isError,
  } = useGetCustomerBookingsQuery({ page: currentPage });

  const bookings: CustomerBooking[] =
    (bookingsData as CustomerBookingsResponse)?.results || [];

  const totalPages = bookingsData?.count
    ? Math.ceil(bookingsData.count / (bookingsData.results?.length || 1))
    : 0;

  const handlePreviousPage = () => {
    if (bookingsData?.previous) {
      setCurrentPage((p) => Math.max(1, p - 1));
    }
  };

  const handleNextPage = () => {
    if (bookingsData?.next) {
      setCurrentPage((p) => p + 1);
    }
  };

  const getStatusVariant = (status?: string) => {
    switch (status) {
      case "PLACED":
        return "default";
      case "INPROGRESS":
        return "warning";
      case "RESCHEDULED":
        return "secondary";
      case "COMPLETED":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div>
      {isLoading || isFetching ? (
        <div className="flex justify-center py-12">
          <LoaderPinwheel className="h-8 w-8 animate-spin" />
        </div>
      ) : isError ? (
        <div className="text-center text-red-600">Failed to load bookings.</div>
      ) : bookings.length === 0 ? (
        <div className="py-8 text-center">No bookings available.</div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Salon</TableHead>
                <TableHead className="text-center">Date / Time</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-center">Final</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.uid}>
                  <TableCell>
                    <Link
                      href={`/customer/bookings/${b.uid}`}
                      className="text-primary underline"
                    >
                      {b.booking_id || b.uid}
                    </Link>
                  </TableCell>
                  <TableCell>{b.salon?.name || "-"}</TableCell>
                  <TableCell className="text-center">
                    {formatDateTime(`${b.booking_date}T${b.booking_time}`)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getStatusVariant(b.status)}>
                      {formatChoiceFieldValue(b.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {b.total_price?.toFixed(2) ?? "0.00"}
                  </TableCell>
                  <TableCell className="text-center">
                    {b.final_price?.toFixed(2) ?? "0.00"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Link href={`/customer/bookings/${b.uid}`}>
                      <Button size="sm" variant="outline">
                        <Eye />
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* styled pagination mimicking customer list pattern */}
          <div className="mt-4 flex justify-between px-2 py-4">
            <div>
              {bookingsData && bookingsData.count > 0 && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total: {bookingsData.count} booking
                  {bookingsData.count !== 1 ? "s" : ""}
                </div>
              )}
            </div>

            <div>
              {bookingsData &&
                bookingsData.count > (bookingsData.results?.length ?? 0) && (
                  <div className="flex items-center justify-center gap-4 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={!bookingsData.previous || isFetching}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>

                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Page {currentPage} of {totalPages}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={!bookingsData.next || isFetching}
                      className="flex items-center gap-2"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BookingList;
