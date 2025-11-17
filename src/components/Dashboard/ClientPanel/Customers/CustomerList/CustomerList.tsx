"use client";

import { useGetCustomersQuery } from "@/Redux/Reducers/ClientPanel/Customers/CustomersApi";
import { useGetSalonListQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/SalonApi";
import {
  Booking,
  CustomerProps,
  CustomersQueryParams,
} from "@/Types/ClientPanel/CustomersTypes/CustomersType";
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
import { formatChoiceFieldValue, formatDateTime } from "@/lib/utils";
import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Eye,
  LoaderPinwheel,
  Search,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const CustomerList: React.FC = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [selectedSalon, setSelectedSalon] = useState<string>("");
  const [showDateRange, setShowDateRange] = useState<boolean>(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const queryParams: CustomersQueryParams = {
    page: currentPage,
    search: debouncedSearch || undefined,
    salon__uid: selectedSalon || undefined,
    created_at__gte: fromDate || undefined,
    created_at__lte: toDate || undefined,
  };

  // RTK hook
  const { data: salonListData, isLoading: isLoadingSalons } =
    useGetSalonListQuery({
      page: currentPage,
      search: debouncedSearch || undefined,
    });
  const salonList = salonListData?.results || [];
  const {
    data: customersData,
    isLoading: isLoadingCustomers,
    isFetching: isFetchingCustomers,
  } = useGetCustomersQuery(queryParams);

  const customers: CustomerProps[] =
    (customersData && customersData.results) || [];

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

  const handleClearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedSalon("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
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
          <Select value={selectedSalon} onValueChange={setSelectedSalon}>
            <SelectTrigger className="text-primary shadow-md md:w-48 dark:shadow-gray-600">
              <SelectValue placeholder="All salons" />
            </SelectTrigger>
            <SelectContent>
              {salonList.map((salon) => (
                <SelectItem key={salon.uid} value={salon.uid}>
                  {isLoadingSalons ? "Loading..." : salon.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Popover open={showDateRange} onOpenChange={setShowDateRange}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="text-primary shadow-md dark:shadow-gray-600"
              >
                <CalendarRange />
                Date Range
              </Button>
            </PopoverTrigger>
            <PopoverContent className="mt-2 w-48">
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
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="text-danger shadow-md dark:shadow-gray-600"
          >
            <X />
            Clear Filters
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-primary">#</TableHead>
            <TableHead className="text-primary">Name</TableHead>
            <TableHead className="text-primary">Email</TableHead>
            <TableHead className="text-primary text-center">Phone</TableHead>
            <TableHead className="text-primary text-center">Salon</TableHead>
            <TableHead className="text-primary text-center">Chair</TableHead>
            <TableHead className="text-primary text-center">Bookings</TableHead>
            <TableHead className="text-primary text-center">
              Recent booking
            </TableHead>
            <TableHead className="text-primary text-center">
              Recent booking Status
            </TableHead>
            <TableHead className="text-primary text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="text-center">
          {isLoadingCustomers ? (
            <TableRow>
              <TableCell colSpan={10} className="py-8 text-center">
                <div className="flex items-center justify-center">
                  <LoaderPinwheel className="h-6 w-6 animate-spin" />
                </div>
              </TableCell>
            </TableRow>
          ) : customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="py-8 text-center">
                No customers found.
              </TableCell>
            </TableRow>
          ) : (
            customers.map((c, index) => {
              const latest = getLatestBooking(c.booking);
              return (
                <TableRow key={c.uid}>
                  <TableCell className="text-start">{index + 1}</TableCell>
                  <TableCell className="text-start">
                    {c.first_name} {c.last_name}
                  </TableCell>
                  <TableCell className="text-start">{c.email ?? "—"}</TableCell>
                  <TableCell>{c.phone ?? "—"}</TableCell>
                  <TableCell>{latest?.salon?.name ?? "—"}</TableCell>
                  <TableCell>{latest?.chair?.name ?? "—"}</TableCell>
                  <TableCell>{c.booking?.length ?? 0}</TableCell>
                  <TableCell>
                    {latest
                      ? formatDateTime(
                          `${latest.booking_date}T${latest.booking_time}`,
                        )
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
