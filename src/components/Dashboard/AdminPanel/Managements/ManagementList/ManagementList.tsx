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
import {
  formatChoiceFieldValue,
  formatDateTime,
  getCountryName,
} from "@/lib/utils";
import { useGetManagementsListQuery } from "@/Redux/Reducers/AdminPanel/Managements/ManagementsApi";
import { ManagementsProps } from "@/Types/AdminPanel/ManagementsTypes/ManagementsType";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  LoaderPinwheel,
  Plus,
  Search,
  Trash,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import DeleteManagementUserDialog from "./Dialogs/DeleteManagementUserDialog";
import EditManagementUserDialog from "./Dialogs/EditManagementUserDialog";
import RegisterManagementDialog from "./Dialogs/RegisterManagementDialog";

const ManagementList: React.FC = () => {
  const { data: session } = useSession();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] =
    useState<boolean>(false);
  const [selectedManagementUser, setSelectedManagementUser] =
    useState<ManagementsProps | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);

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
    role: roleFilter || undefined,
  });

  const rows: ManagementsProps[] =
    (managementData && managementData.results) || [];

  const handleRegisterDialogOpen = () => {
    setIsRegisterDialogOpen(true);
  };
  const handleDeleteDialogOpen = (management: ManagementsProps) => {
    setSelectedManagementUser(management);
    setIsDeleteDialogOpen(true);
  };
  const handleEditDialogOpen = (management: ManagementsProps) => {
    setSelectedManagementUser(management);
    setIsEditDialogOpen(true);
  };

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
                className="flex w-[190px] items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <SelectValue placeholder="Select a role" />
                </div>
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  <SelectItem value="MANAGEMENT_ADMIN">
                    Management Admin
                  </SelectItem>
                  <SelectItem value="MANAGEMENT_STAFF">
                    Management Staff
                  </SelectItem>
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

          <div>
            {session?.user?.role === "MANAGEMENT_ADMIN" && (
              <Button
                variant="default"
                size="sm"
                onClick={handleRegisterDialogOpen}
              >
                <Plus />
                Register User
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
            <TableHead className="text-primary text-center">Role</TableHead>
            <TableHead className="text-primary text-center">
              Last Login
            </TableHead>
            {session?.user?.role === "MANAGEMENT_ADMIN" && (
              <TableHead className="text-primary text-center">
                Actions
              </TableHead>
            )}
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
                    {m.avatar ? (
                      <Image
                        src={
                          typeof m.avatar === "string"
                            ? m.avatar
                            : (m.avatar ?? "")
                        }
                        alt={`${m.first_name ?? ""} ${m.last_name ?? ""}`}
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 font-medium text-indigo-700">
                        {(
                          (m.first_name?.[0] ?? "") + (m.last_name?.[0] ?? "")
                        ).toUpperCase()}
                      </div>
                    )}
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
                {session?.user?.role === "MANAGEMENT_ADMIN" &&
                  (session?.user?.uid !== m.uid ? (
                    <TableCell className="flex items-center justify-center gap-2">
                      <div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="shadow-md dark:shadow-gray-600"
                          onClick={() => handleEditDialogOpen(m)}
                        >
                          <Edit />
                        </Button>
                      </div>
                      <div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-danger shadow-md dark:shadow-gray-600"
                          onClick={() => handleDeleteDialogOpen(m)}
                        >
                          <Trash />
                        </Button>
                      </div>
                    </TableCell>
                  ) : (
                    <TableCell className="text-warning/80 py-4 text-[10px]">
                      Can&apos;t perform this action
                    </TableCell>
                  ))}
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
      {/* Dialogs */}
      <RegisterManagementDialog
        isOpen={isRegisterDialogOpen}
        onClose={() => setIsRegisterDialogOpen(false)}
      />
      <EditManagementUserDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        managementUser={selectedManagementUser}
      />
      <DeleteManagementUserDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        managementUser={selectedManagementUser}
      />
    </>
  );
};

export default ManagementList;
