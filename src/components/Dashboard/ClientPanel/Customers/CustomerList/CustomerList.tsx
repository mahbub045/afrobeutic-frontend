"use client";

import { useGetCustomersQuery } from "@/Redux/Reducers/ClientPanel/Customers/CustomersApi";
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
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  LoaderPinwheel,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type Booking = {
  booking_date: string;
  booking_time: string;
  status: string;
  booking_id?: string;
};

type Customer = {
  uid: string;
  name: string;
  phone?: string | null;
  booking: Booking[];
};

type CustomersQueryParams = {
  salonUid?: string; // kept for symmetry if needed later
  page?: number;
  search?: string;
};

const CustomerList: React.FC = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const queryParams: CustomersQueryParams = {
    page: currentPage,
    search: debouncedSearch || undefined,
  };
  const {
    data: customersData,
    isLoading,
    isFetching,
  } = useGetCustomersQuery(queryParams);

  const customers: Customer[] = (customersData && customersData.results) || [];

  function getLatestBooking(bookings: Booking[] | undefined) {
    if (!bookings || bookings.length === 0) return null;
    // Find the booking with the latest timestamp using a single pass
    return bookings.reduce(
      (latest, b) => {
        if (!latest) return b;
        const latestTs = new Date(
          `${latest.booking_date}T${latest.booking_time}`,
        ).getTime();
        const ts = new Date(`${b.booking_date}T${b.booking_time}`).getTime();
        return ts > latestTs ? b : latest;
      },
      bookings[0] as Booking | null,
    );
  }

  const handlePreviousPage = () => {
    if (customersData?.previous) setCurrentPage((p) => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    if (customersData?.next) setCurrentPage((p) => p + 1);
  };

  const totalPages = customersData?.count
    ? Math.ceil(customersData.count / (customersData.results?.length || 1))
    : 0;

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:justify-between">
        <h2 className="text-lg font-semibold">Customers</h2>

        <div className="relative">
          <Search
            size={18}
            className="text-muted-foreground pointer-events-none absolute top-[10px] left-2"
          />
          <Input
            className="focus:!border-primary min-w-xs pl-7 shadow-md focus:!ring-0 md:min-w-md dark:shadow-gray-600"
            placeholder="Search customers by name, phone or salon name..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm((e.target as HTMLInputElement).value)
            }
          />
        </div>

        <div className="text-muted-foreground text-sm">&nbsp;</div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-center">Phone</TableHead>
            <TableHead className="text-center">Bookings</TableHead>
            <TableHead className="text-center">Recent booking</TableHead>
            <TableHead className="text-center">Recent booking Status</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="text-center">
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center">
                <div className="flex items-center justify-center">
                  <LoaderPinwheel className="h-6 w-6 animate-spin" />
                </div>
              </TableCell>
            </TableRow>
          ) : customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center">
                No customers found.
              </TableCell>
            </TableRow>
          ) : (
            customers.map((c, index) => {
              const latest = getLatestBooking(c.booking);
              return (
                <TableRow key={c.uid}>
                  <TableCell className="text-start">{index + 1}</TableCell>
                  <TableCell className="text-start">{c.name}</TableCell>
                  <TableCell>{c.phone ?? "—"}</TableCell>
                  <TableCell>{c.booking?.length ?? 0}</TableCell>
                  <TableCell>
                    {latest
                      ? new Date(
                          `${latest.booking_date}T${latest.booking_time}`,
                        ).toLocaleString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {formatChoiceFieldValue(latest?.status) ?? "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      className="shadow-md dark:shadow-gray-600"
                      size="sm"
                      onClick={() =>
                        router.push(
                          `/dashboard/client-panel/customers/${c.uid}`,
                        )
                      }
                    >
                      <Eye />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <div className="flex justify-between px-2 py-4">
        <div>
          {customersData && customersData.count > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total: {customersData.count} customer
              {customersData.count !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        <div>
          {customersData &&
            customersData.count > (customersData.results?.length ?? 0) && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={!customersData.previous || isFetching}
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
                  disabled={!customersData.next || isFetching}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default CustomerList;
