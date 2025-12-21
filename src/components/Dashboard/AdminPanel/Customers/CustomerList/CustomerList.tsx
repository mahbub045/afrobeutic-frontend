"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
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
import { getCountryName } from "@/lib/utils";
import { useGetCustomerListQuery } from "@/Redux/Reducers/AdminPanel/Customers/CustomersApi";
import { CustomerProps } from "@/Types/AdminPanel/CustomersTypes/CustomersTypes";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  LoaderPinwheel,
  Search,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const CustomerList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const {
    data: usersData,
    isLoading,
    isFetching,
  } = useGetCustomerListQuery({
    page: currentPage,
    search: debouncedSearch || undefined,
    role: roleFilter || undefined,
  });

  const users: CustomerProps[] = usersData?.results || [];

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
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm((e.target as HTMLInputElement).value)
            }
          />
        </div>

        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <Select
              value={roleFilter}
              onValueChange={(v: string) => {
                setRoleFilter(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger
                size="sm"
                className="flex w-[130px] items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <SelectValue placeholder="Select a role" />
                </div>
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  <SelectItem value="OWNER">Owner</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Clear Button */}
            {roleFilter && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRoleFilter("");
                  setCurrentPage(1);
                }}
                className="!border !border-red-500 text-red-500 hover:!bg-red-500 hover:text-white"
              >
                <X />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-primary">#</TableHead>
            <TableHead className="text-primary">Name</TableHead>
            <TableHead className="text-primary">Email</TableHead>
            <TableHead className="text-primary text-center">Country</TableHead>
            <TableHead className="text-primary text-center">
              Accounts Access
            </TableHead>
            <TableHead className="text-primary text-center">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="text-center">
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center">
                <div className="flex items-center justify-center">
                  <LoaderPinwheel className="h-6 w-6 animate-spin" />
                </div>
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center">
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            users.map((customer, index) => (
              <TableRow key={customer.uid}>
                <TableCell className="text-start">{index + 1}</TableCell>
                <TableCell className="text-start">
                  <div className="flex items-center gap-3">
                    {customer.avatar ? (
                      <Image
                        src={
                          typeof customer.avatar === "string"
                            ? customer.avatar
                            : ""
                        }
                        alt={`${customer.first_name ?? ""} ${customer.last_name ?? ""}`}
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 font-medium text-indigo-700">
                        {(
                          (customer.first_name?.[0] ?? "") +
                          (customer.last_name?.[0] ?? "")
                        ).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-100">
                        {`${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim()}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-start">
                  {customer.email ?? "—"}
                </TableCell>
                <TableCell>{getCountryName(customer.country) ?? "—"}</TableCell>
                <TableCell className="text-center">
                  {customer.accounts?.length ?? 0}
                </TableCell>
                <TableCell className="text-center">
                  <Link href={`/dashboard/admin-panel/customers/${customer.uid}`}>
                    <Button variant="outline" size="sm">
                      <Eye />
                      View
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex justify-between px-2 py-4">
        <div>
          {usersData && usersData.count > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total: {usersData.count} user{usersData.count !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        <div>
          {usersData && usersData.count > (usersData.results?.length ?? 0) && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  currentPage > 1 && setCurrentPage((p) => Math.max(1, p - 1))
                }
                disabled={!usersData.previous || isFetching}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Page {currentPage} of{" "}
                  {usersData.count
                    ? Math.ceil(
                        usersData.count / (usersData.results?.length || 1),
                      )
                    : 0}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => usersData.next && setCurrentPage((p) => p + 1)}
                disabled={!usersData.next || isFetching}
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
