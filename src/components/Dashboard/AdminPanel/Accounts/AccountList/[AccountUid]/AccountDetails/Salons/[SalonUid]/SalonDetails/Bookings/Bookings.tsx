"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatChoiceFieldValue } from "@/lib/utils";
import { useGetSalonBookingsQuery } from "@/Redux/Reducers/AdminPanel/Accounts/Salons/SalonsApi";
import { SalonBookingsProps } from "@/Types/AdminPanel/AccountsTypes/SalonsTypes/SalonsType";
import {
  ChevronLeft,
  ChevronRight,
  LoaderPinwheel,
  Search,
} from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import ViewBookingDetailsDialog from "./Dialogs/ViewBookingDetailsDialog";

const Bookings: React.FC = () => {
  const params = useParams() as { accountuid?: string; salonuid?: string };
  const { accountuid, salonuid } = params || {};
  const [isViewBookingDetailsDialogOpen, setIsViewBookingDetailsDialogOpen] =
    useState(false);
  const [selectedBooking, setSelectedBooking] =
    useState<SalonBookingsProps | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  const {
    data: salonBookings,
    isLoading,
    isFetching,
  } = useGetSalonBookingsQuery({
    accountUid: accountuid,
    salonUid: salonuid,
    params: {
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      page: currentPage,
      page_size: pageSize,
    },
  });

  const services: SalonBookingsProps[] = salonBookings?.results ?? [];

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm, setDebouncedSearch]);

  // reset to first page whenever the debounced search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const openViewBookingDetailsDialog = (booking: SalonBookingsProps) => {
    setSelectedBooking(booking);
    setIsViewBookingDetailsDialogOpen(true);
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-primary text-xl font-semibold">Bookings</h3>
        <div className="relative mx-4 max-w-xs flex-1">
          <Search
            size={18}
            className="text-muted-foreground pointer-events-none absolute top-[10px] left-2"
          />
          <Input
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm((e.target as HTMLInputElement).value)
            }
            className="focus:!border-primary pl-7 shadow-md focus:!ring-0 dark:shadow-gray-600"
            placeholder="Search bookings..."
          />
        </div>
        <div />
      </div>

      <Table>
        <TableHeader>
          <tr>
            <TableHead className="text-primary">#</TableHead>
            <TableHead className="text-primary">Booking ID</TableHead>
            <TableHead className="text-primary">Booking Date</TableHead>
            <TableHead className="text-primary">Booking Time</TableHead>
            <TableHead className="text-primary">Status</TableHead>
            <TableHead className="text-primary">Booking Duration</TableHead>
            <TableHead className="text-primary">Cancelled By</TableHead>
            <TableHead className="text-primary">Completed At</TableHead>
            <TableHead className="text-primary">Customer</TableHead>
            <TableHead className="text-primary">Chair</TableHead>
            <TableHead className="text-primary">Employee</TableHead>
            <TableHead className="text-primary">Services</TableHead>
            <TableHead className="text-primary">Products</TableHead>
            <TableHead className="text-primary text-center">Action</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={10} className="py-8">
                <div className="flex items-center justify-center">
                  <LoaderPinwheel className="h-6 w-6 animate-spin" />
                </div>
              </TableCell>
            </TableRow>
          ) : services.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={10}
                className="text-muted-foreground py-8 text-center"
              >
                No services found.
              </TableCell>
            </TableRow>
          ) : (
            services?.map((b, index) => (
              <TableRow key={b.uid}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell className="font-medium">{b.booking_id}</TableCell>
                <TableCell>{b.booking_date ?? "-"}</TableCell>
                <TableCell>{b.booking_time ?? "-"}</TableCell>
                <TableCell>{formatChoiceFieldValue(b.status) ?? "-"}</TableCell>
                <TableCell>{b.booking_duration ?? "-"}</TableCell>
                <TableCell>{b.cancelled_by ?? "-"}</TableCell>
                <TableCell>{b.completed_at ?? "-"}</TableCell>
                <TableCell>
                  {b.customer
                    ? `${b.customer.first_name ?? ""} ${
                        b.customer.last_name ?? ""
                      }`.trim() || "-"
                    : "-"}
                </TableCell>
                <TableCell>{b.chair?.name ?? "-"}</TableCell>
                <TableCell>{b.employee?.name ?? "-"}</TableCell>
                <TableCell className="text-center">
                  {b.services?.length ?? "-"}
                </TableCell>
                <TableCell className="text-center">
                  {b.products?.length ?? "-"}
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="shadow-md dark:shadow-gray-600"
                    onClick={() => openViewBookingDetailsDialog(b)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {/* Pagination */}
      <div className="flex justify-between px-2 py-4">
        <div>
          {salonBookings && salonBookings.count > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total: {salonBookings.count} Bookings
            </div>
          )}
        </div>
        {salonBookings &&
          (salonBookings.count ?? 0) > (salonBookings.results?.length ?? 0) && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={!salonBookings.previous || isFetching}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Page {currentPage} of{" "}
                  {Math.max(
                    1,
                    Math.ceil((salonBookings.count ?? 0) / pageSize),
                  )}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!salonBookings.next || isFetching}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
      </div>
      {/* View Booking Details Dialog */}
      {isViewBookingDetailsDialogOpen && selectedBooking && (
        <ViewBookingDetailsDialog
          booking={selectedBooking}
          onClose={() => setIsViewBookingDetailsDialogOpen(false)}
        />
      )}
    </>
  );
};

export default Bookings;
