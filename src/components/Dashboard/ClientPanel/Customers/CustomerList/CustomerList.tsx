"use client";

import { useGetCustomersQuery } from "@/Redux/Reducers/ClientPanel/Customers/CustomersApi";
import { useGetSalonListQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/SalonApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [showDateRange, setShowDateRange] = useState<boolean>(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const queryParams: CustomersQueryParams = {
    page: currentPage,
    search: debouncedSearch || undefined,
  };

  // RTK hook
  const {
    data: salonListData,
    isLoading: isLoadingSalons,
    isFetching: isFetchingSalons,
  } = useGetSalonListQuery({
    page: currentPage,
    search: debouncedSearch || undefined,
  });
  const salonList = salonListData?.results || [];
  const {
    data: customersData,
    isLoading: isLoadingCustomers,
    isFetching: isFetchingCustomers,
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
    <>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <h2 className="text-lg font-semibold md:w-auto">Customers</h2>

        <div className="relative flex-1 md:max-w-xs">
          <Search
            size={18}
            className="text-muted-foreground pointer-events-none absolute top-[10px] left-2"
          />
          <Input
            className="focus:!border-primary pl-7 shadow-md focus:!ring-0 dark:shadow-gray-600"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm((e.target as HTMLInputElement).value)
            }
          />
        </div>

        <div className="flex gap-2">
          <Select>
            <SelectTrigger className="shadow-md md:w-48 dark:shadow-gray-600">
              <SelectValue placeholder="Select a salon" />
            </SelectTrigger>
            <SelectContent>
              {salonList.map((salon) => (
                <SelectItem key={salon.uid} value={salon.uid}>
                  {salon.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Popover open={showDateRange} onOpenChange={setShowDateRange}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="shadow-md dark:shadow-gray-600"
              >
                Date Range
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 mt-2">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Filter by Date Range</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      From Date
                    </label>
                    <Input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="focus:!border-primary mt-2 shadow-md focus:!ring-0 dark:shadow-gray-600"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      To Date
                    </label>
                    <Input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="focus:!border-primary mt-2 shadow-md focus:!ring-0 dark:shadow-gray-600"
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
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
          {isLoadingCustomers ? (
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
                  disabled={!customersData.previous || isFetchingCustomers}
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
                  disabled={!customersData.next || isFetchingCustomers}
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
  );
};

export default CustomerList;
