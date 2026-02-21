"use client";

import { useGetAccountsListQuery } from "@/Redux/Reducers/AdminPanel/Accounts/AccountsApi";
import { AccountListProps } from "@/Types/AdminPanel/AccountsTypes/AccountsTypes";
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
import { Eye, LoaderPinwheel, Search } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { formatDateTime } from "../../../../../lib/utils";

const AccountList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const {
    data: accountsData,
    isLoading,
    isFetching,
  } = useGetAccountsListQuery({
    page: currentPage,
    search: debouncedSearch || undefined,
  });

  const accounts = accountsData?.results || [];

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <h2 className="text-lg font-semibold md:w-auto">Accounts</h2>

        <div className="relative flex-1 md:max-w-xs">
          <Search
            size={18}
            className="text-muted-foreground pointer-events-none absolute top-[10px] left-2"
          />
          <Input
            className="focus:!border-primary pl-7 shadow-md focus:!ring-0 dark:shadow-gray-600"
            placeholder="Search accounts..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm((e.target as HTMLInputElement).value)
            }
          />
        </div>

        <div>
          <Link href="/dashboard/admin-panel/accounts/create">
            <Button>Create account</Button>
          </Link>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-primary">#</TableHead>
            <TableHead className="text-primary">Account</TableHead>
            <TableHead className="text-primary text-center">Users</TableHead>
            <TableHead className="text-primary text-center">Created</TableHead>
            <TableHead className="text-primary text-center">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="text-center">
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center">
                <div className="flex items-center justify-center">
                  <LoaderPinwheel className="text-primary h-6 w-6 animate-spin" />
                </div>
              </TableCell>
            </TableRow>
          ) : accounts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center">
                No accounts found.
              </TableCell>
            </TableRow>
          ) : (
            accounts.map((a: AccountListProps, idx: number) => {
              return (
                <TableRow key={a.uid}>
                  <TableCell className="text-start">{idx + 1}</TableCell>
                  <TableCell className="text-start">
                    <div className="font-medium text-gray-800 dark:text-gray-100">
                      {a.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {a.users ? a.users.length : 0}
                  </TableCell>
                  <TableCell className="text-center">
                    {formatDateTime(a.created_at)}
                  </TableCell>
                  <TableCell className="flex justify-center gap-2 text-center">
                    <Link href={`/dashboard/admin-panel/accounts/${a.uid}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="shadow-md dark:shadow-gray-600"
                      >
                        <Eye />
                        Details
                      </Button>
                    </Link>
                    <Link
                      href={`/dashboard/admin-panel/accounts/${a.uid}/enquiries`}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="shadow-md dark:shadow-gray-600"
                      >
                        <Eye />
                        Enquiries
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <div className="flex justify-between px-2 py-4">
        <div>
          {accountsData && accountsData.count > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total: {accountsData.count} account
              {accountsData.count !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        <div>
          {accountsData &&
            accountsData.count > (accountsData.results?.length ?? 0) && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    currentPage > 1 && setCurrentPage((p) => Math.max(1, p - 1))
                  }
                  disabled={!accountsData.previous || isFetching}
                  className="flex items-center gap-2"
                >
                  Previous
                </Button>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Page {currentPage} of{" "}
                    {accountsData.count
                      ? Math.ceil(
                          accountsData.count /
                            (accountsData.results?.length || 1),
                        )
                      : 0}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    accountsData.next && setCurrentPage((p) => p + 1)
                  }
                  disabled={!accountsData.next || isFetching}
                  className="flex items-center gap-2"
                >
                  Next
                </Button>
              </div>
            )}
        </div>
      </div>
    </>
  );
};

export default AccountList;
