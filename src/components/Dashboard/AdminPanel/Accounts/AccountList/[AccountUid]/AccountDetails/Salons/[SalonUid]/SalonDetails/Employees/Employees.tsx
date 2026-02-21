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
import { formatDateTime } from "@/lib/utils";
import { useGetSalonEmployeesQuery } from "@/Redux/Reducers/AdminPanel/Accounts/Salons/SalonsApi";
import { SalonEmployeesProps } from "@/Types/AdminPanel/AccountsTypes/SalonsTypes/SalonsType";
import {
  ChevronLeft,
  ChevronRight,
  LoaderPinwheel,
  Search,
} from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const Employees: React.FC = () => {
  const params = useParams() as { accountuid?: string; salonuid?: string };
  const { accountuid, salonuid } = params || {};

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  const {
    data: salonEmployees,
    isLoading,
    isFetching,
  } = useGetSalonEmployeesQuery({
    accountUid: accountuid,
    salonUid: salonuid,
    params: {
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      page: currentPage,
      page_size: pageSize,
    },
  });

  const employees: SalonEmployeesProps[] = salonEmployees?.results ?? [];

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

  const handlePreviousPage = () => {
    if (salonEmployees?.previous) setCurrentPage((p) => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    if (salonEmployees?.next) setCurrentPage((p) => p + 1);
  };

  const totalPages = salonEmployees?.count
    ? Math.max(1, Math.ceil(salonEmployees.count / pageSize))
    : 1;

  const globalIndex = (index: number) =>
    (currentPage - 1) * pageSize + index + 1;

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-primary text-xl font-semibold">Employees</h3>
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
            placeholder="Search employees..."
          />
        </div>
        <div />
      </div>

      <Table>
        <TableHeader>
          <tr>
            <TableHead className="text-primary">#</TableHead>
            <TableHead className="text-primary">Employee ID</TableHead>
            <TableHead className="text-primary">Name</TableHead>
            <TableHead className="text-primary">Phone</TableHead>
            <TableHead className="text-primary">Designation</TableHead>
            <TableHead className="text-primary">Created</TableHead>
          </tr>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="py-8">
                <div className="flex items-center justify-center">
                  <LoaderPinwheel className="text-primary h-6 w-6 animate-spin" />
                </div>
              </TableCell>
            </TableRow>
          ) : employees.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-muted-foreground py-8 text-center"
              >
                No employees found.
              </TableCell>
            </TableRow>
          ) : (
            employees.map((e, index) => (
              <TableRow key={e.uid}>
                <TableCell className="font-medium">
                  {globalIndex(index)}
                </TableCell>
                <TableCell className="font-medium">
                  {e.employee_id ?? e.uid}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {e.image ? (
                      <Image
                        src={e.image}
                        alt={e.name ?? "employee"}
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="bg-muted/40 text-muted-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm">
                        {e.name ? e.name.charAt(0).toUpperCase() : "-"}
                      </div>
                    )}
                    <span className="font-medium">{e.name}</span>
                  </div>
                </TableCell>
                <TableCell>{e.phone ?? "-"}</TableCell>
                <TableCell>{e.designation ?? "-"}</TableCell>
                <TableCell>
                  {e.created_at ? formatDateTime(e.created_at) : "-"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex justify-between px-2 py-4">
        <div>
          {salonEmployees && salonEmployees.count > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total: {salonEmployees.count} Employees
            </div>
          )}
        </div>

        {salonEmployees &&
          (salonEmployees.count ?? 0) >
            (salonEmployees.results?.length ?? 0) && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={!salonEmployees.previous || isFetching}
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
                disabled={!salonEmployees.next || isFetching}
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

export default Employees;
