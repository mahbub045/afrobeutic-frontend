"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
import {
  formatChoiceFieldValue,
  formatDateTime,
  getCountryName,
} from "@/lib/utils";
import { useGetManagementsListQuery } from "@/Redux/Reducers/AdminPanel/Managements/ManagementsApi";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  LoaderPinwheel,
  Plus,
  Search,
} from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

interface ManagementItem {
  uid: string;
  avatar?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  country?: string | null;
  role?: string | null;
  last_login?: string | null;
}

const ManagementList: React.FC = () => {
  const { data: session } = useSession();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const {
    data: managementData,
    isLoading,
    isFetching,
  } = useGetManagementsListQuery({
    page: currentPage,
    search: debouncedSearch || undefined,
  });

  const rows: ManagementItem[] =
    (managementData && managementData.results) || [];

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <h2 className="text-lg font-semibold md:w-auto">Managements</h2>

        <div className="relative flex-1 md:max-w-xs">
          <Search
            size={18}
            className="text-muted-foreground pointer-events-none absolute top-[10px] left-2"
          />
          <Input
            className="focus:!border-primary pl-7 shadow-md focus:!ring-0 dark:shadow-gray-600"
            placeholder="Search managements..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm((e.target as HTMLInputElement).value)
            }
          />
        </div>

        <div className="flex gap-2">
          <div>
            <Select>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Roles</SelectLabel>
                  <SelectItem value="MANAGEMENT_ADMIN">
                    Management Admin
                  </SelectItem>
                  <SelectItem value="MANAGEMENT_STAFF">
                    Management Staff
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Button variant="default" size="sm">
              <Plus />
              Add New
            </Button>
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
            <TableHead className="text-primary text-center">Role</TableHead>
            <TableHead className="text-primary text-center">
              Last Login
            </TableHead>
            <TableHead className="text-primary text-center">Actions</TableHead>
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
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center">
                No management users found.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((m, index) => (
              <TableRow key={m.uid}>
                <TableCell className="text-start">{index + 1}</TableCell>
                <TableCell className="text-start">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 font-medium text-indigo-700">
                      {(
                        (m.first_name?.[0] ?? "") + (m.last_name?.[0] ?? "")
                      ).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-100">
                        {`${m.first_name ?? ""} ${m.last_name ?? ""}`.trim()}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-start">{m.email ?? "—"}</TableCell>
                <TableCell>{getCountryName(m.country) ?? "—"}</TableCell>
                <TableCell>{formatChoiceFieldValue(m.role) ?? "—"}</TableCell>
                <TableCell>
                  {m.last_login ? formatDateTime(m.last_login) : "Never"}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="shadow-md dark:shadow-gray-600"
                    >
                      <Edit />
                      Edit
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div className="flex justify-between px-2 py-4">
        <div>
          {managementData && managementData.count > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total: {managementData.count} user
              {managementData.count !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        <div>
          {managementData &&
            managementData.count > (managementData.results?.length ?? 0) && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    currentPage > 1 && setCurrentPage((p) => Math.max(1, p - 1))
                  }
                  disabled={!managementData.previous || isFetching}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Page {currentPage} of{" "}
                    {managementData.count
                      ? Math.ceil(
                          managementData.count /
                            (managementData.results?.length || 1),
                        )
                      : 0}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    managementData.next && setCurrentPage((p) => p + 1)
                  }
                  disabled={!managementData.next || isFetching}
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

export default ManagementList;
