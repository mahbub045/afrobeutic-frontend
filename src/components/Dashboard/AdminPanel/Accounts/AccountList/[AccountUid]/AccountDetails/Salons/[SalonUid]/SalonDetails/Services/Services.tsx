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
import { formatChoiceFieldValue, formatDateTime } from "@/lib/utils";
import { useGetSalonServicesQuery } from "@/Redux/Reducers/AdminPanel/Accounts/Salons/SalonsApi";
import { SalonServicesProps } from "@/Types/AdminPanel/AccountsTypes/SalonsTypes/SalonsType";
import {
  ChevronLeft,
  ChevronRight,
  LoaderPinwheel,
  Search,
} from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const Services: React.FC = () => {
  const params = useParams() as { accountuid?: string; salonuid?: string };
  const { accountuid, salonuid } = params || {};

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  const {
    data: salonServices,
    isLoading,
    isFetching,
  } = useGetSalonServicesQuery({
    accountUid: accountuid,
    salonUid: salonuid,
    params: {
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      page: currentPage,
      page_size: pageSize,
    },
  });

  // don't return early here so hooks run consistently; render loading state below

  const services: SalonServicesProps[] = salonServices?.results ?? [];

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

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-primary text-xl font-semibold">Services</h3>
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
            placeholder="Search services..."
          />
        </div>
        <div />
      </div>

      <Table>
        <TableHeader>
          <tr>
            <TableHead className="text-primary">#</TableHead>
            <TableHead className="text-primary">Name</TableHead>
            <TableHead className="text-primary">Category</TableHead>
            <TableHead className="text-primary">Price</TableHead>
            <TableHead className="text-primary">Duration</TableHead>
            <TableHead className="text-primary">Time Slots</TableHead>
            <TableHead className="text-primary">Gender</TableHead>
            <TableHead className="text-primary">Discount</TableHead>
            <TableHead className="text-primary text-center">Assigned Employees</TableHead>
            <TableHead className="text-primary">Created</TableHead>
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
            services.map((s, index) => (
              <TableRow key={s.uid}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{s.category ?? "-"}</TableCell>
                <TableCell>{s.price ? `$${s.price}` : "-"}</TableCell>
                <TableCell>{s.service_duration ?? "-"}</TableCell>
                <TableCell>
                  {s.available_time_slots && s.available_time_slots.length
                    ? formatChoiceFieldValue(s.available_time_slots.join(", "))
                    : "-"}
                </TableCell>
                <TableCell>
                  {formatChoiceFieldValue(s.gender_specific) ?? "-"}
                </TableCell>
                <TableCell>
                  {s.discount_percentage ? `${s.discount_percentage}%` : "-"}
                </TableCell>
                <TableCell className="text-center">
                  {s.assign_employees && s.assign_employees.length
                    ? s.assign_employees.length
                    : "-"}
                </TableCell>
                <TableCell>
                  {s.created_at ? formatDateTime(s.created_at) : "-"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {/* Pagination */}
      <div className="flex justify-between px-2 py-4">
        <div>
          {salonServices && salonServices.count > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total: {salonServices.count} Services
            </div>
          )}
        </div>
        {salonServices &&
          (salonServices.count ?? 0) > (salonServices.results?.length ?? 0) && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={!salonServices.previous || isFetching}
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
                    Math.ceil((salonServices.count ?? 0) / pageSize),
                  )}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!salonServices.next || isFetching}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
      </div>
    </>
  );
};

export default Services;
