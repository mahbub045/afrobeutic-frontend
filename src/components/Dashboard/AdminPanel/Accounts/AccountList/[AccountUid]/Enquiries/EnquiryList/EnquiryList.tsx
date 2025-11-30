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
import { useGetEnquiryListQuery } from "@/Redux/Reducers/AdminPanel/Accounts/Enquiries/EnquiriesApi";
import { EnquiryProps } from "@/Types/AdminPanel/AccountsTypes/EnquiriesTypes/EnquiryType";
import {
  ChevronLeft,
  ChevronRight,
  LoaderPinwheel,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const EnquiryList: React.FC = () => {
  const { accountuid } = useParams();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  const {
    data: enquiryData,
    isLoading,
    isFetching,
  } = useGetEnquiryListQuery({
    accountUid: accountuid,
    params: {
      page: currentPage,
      page_size: pageSize,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    },
  });

  const enquiries: EnquiryProps[] = enquiryData?.results ?? [];

  useEffect(() => {
    const handler = setTimeout(
      () => setDebouncedSearch(searchTerm.trim()),
      500,
    );
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // reset page when account changes or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [accountuid, debouncedSearch]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-primary mb-4 text-xl font-semibold">Enquiries</h3>
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
            placeholder="Search enquiries..."
          />
        </div>
        <div />
      </div>

      <Table>
        <TableHeader>
          <tr>
            <TableHead className="text-primary">#</TableHead>
            <TableHead className="text-primary">Level</TableHead>
            <TableHead className="text-primary">Topic</TableHead>
            <TableHead className="text-primary">Subject</TableHead>
            <TableHead className="text-primary">Queries</TableHead>
            <TableHead className="text-primary">Status</TableHead>
            <TableHead className="text-primary">Created At</TableHead>
            <TableHead className="text-primary text-center">Action</TableHead>
          </tr>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={9} className="py-8">
                <div className="flex items-center justify-center">
                  <LoaderPinwheel className="h-6 w-6 animate-spin" />
                </div>
              </TableCell>
            </TableRow>
          ) : enquiries.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={9}
                className="text-muted-foreground py-8 text-center"
              >
                No enquiries found.
              </TableCell>
            </TableRow>
          ) : (
            enquiries.map((e, idx) => (
              <TableRow key={e.uid}>
                <TableCell className="font-medium">{idx + 1}</TableCell>
                <TableCell>{formatChoiceFieldValue(e.level) ?? "-"}</TableCell>
                <TableCell>{formatChoiceFieldValue(e.topic) ?? "-"}</TableCell>
                <TableCell>{e.subject ?? "-"}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {e.queries ?? "-"}
                </TableCell>
                <TableCell>{formatChoiceFieldValue(e.status) ?? "-"}</TableCell>
                <TableCell>{formatDateTime(e.created_at)}</TableCell>
                <TableCell className="text-center">
                  <Link
                    href={`/dashboard/admin-panel/accounts/${accountuid}/enquiries/${e.uid}`}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="shadow-md dark:shadow-gray-600"
                    >
                      View
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex justify-between px-2 py-4">
        <div>
          {enquiryData && enquiryData.count > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total: {enquiryData.count} Enquiries
            </div>
          )}
        </div>

        {enquiryData &&
          (enquiryData.count ?? 0) > (enquiryData.results?.length ?? 0) && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={!enquiryData.previous || isFetching}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Page {currentPage} of{" "}
                  {Math.max(1, Math.ceil((enquiryData.count ?? 0) / pageSize))}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!enquiryData.next || isFetching}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
      </div>
    </div>
  );
};

export default EnquiryList;
