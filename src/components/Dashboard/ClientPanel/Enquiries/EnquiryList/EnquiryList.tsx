"use client";

import {
  useGetEnquiriesQuery,
  useGetEnquiryDetailsQuery,
} from "@/Redux/Reducers/ClientPanel/Enquiries/EnquiriesApi";
import { EnquiryProps } from "@/Types/EnquiriesTypes/EnquiryType";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { formatChoiceFieldValue, formatDateTime, safe } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Filter,
  LoaderPinwheel,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import CreateEnquiryDialogs from "./Dialogs/CreateEnquiryDialogs";
import EditEnquiryDialog from "./Dialogs/EditEnquiryDialog";
import { useGetCommonCategoriesDataQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Common/CategoriesApi";

const EnquiryList: React.FC = () => {
  const { data: session } = useSession();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [isOpenCreateEnquiry, setIsOpenCreateEnquiry] =
    useState<boolean>(false);
  const [isOpenEditEnquiry, setIsOpenEditEnquiry] = useState<boolean>(false);
  const [selectedEnquiryUid, setSelectedEnquiryUid] = useState<string | null>(
    null,
  );
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [customerSourceFilter, setCustomerSourceFilter] = useState<string>("");
  const [ordering, setOrdering] = useState<string>("-created_at");

   const CATEGORY_TYPE_FILTER = "CUSTOMER_SOURCE";

  // build query params, only include values when present to avoid empty query keys
  const queryParams: Record<string, unknown> = { page: currentPage };
  if (debouncedSearch) queryParams.search = debouncedSearch;
  if (typeFilter) queryParams.type = typeFilter;
  if (statusFilter) queryParams.status = statusFilter;
  if (customerSourceFilter) queryParams.customer__source__name = customerSourceFilter;
  if (ordering) queryParams.ordering = ordering;

  const {
      data: commonCategoriesData,
      refetch,
    } = useGetCommonCategoriesDataQuery({ category_type: CATEGORY_TYPE_FILTER });

  const {
    data: enquiriesData,
    isLoading,
    isError,
    isFetching,
  } = useGetEnquiriesQuery(queryParams);

  const { data: selectedEnquiryData } = useGetEnquiryDetailsQuery(
    selectedEnquiryUid ?? "",
    { skip: !selectedEnquiryUid },
  );

  const enquiries: EnquiryProps[] = enquiriesData?.results || [];

  // Debounce search input to reduce repeated network calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reset to first page when filters/search/order change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, typeFilter, statusFilter, customerSourceFilter, ordering]);

  const handleOpenCreateEnquiry = () => {
    setIsOpenCreateEnquiry(true);
  };

  const handleOpenEditEnquiry = (enquiryUid: string) => {
    setSelectedEnquiryUid(enquiryUid);
    setIsOpenEditEnquiry(true);
  };

  const handlePreviousPage = () => {
    if (enquiriesData?.previous) setCurrentPage((p) => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    if (enquiriesData?.next) setCurrentPage((p) => p + 1);
  };

  const totalPages = enquiriesData?.count
    ? Math.ceil(enquiriesData.count / (enquiriesData.results?.length || 1))
    : 0;

  const getColorBasedOnType = (type?: string | null) => {
    switch (type) {
      case "GENERAL":
        return "default";
      case "EMERGENCY":
        return "danger";
      default:
        return "outline";
    }
  };

  const getColorBasedOnStatus = (status?: string | null) => {
    switch (status) {
      case "NEW":
        return "danger";
      case "IN_REVIEW":
      case "OPEN":
        return "warning";
      case "RESOLVED":
        return "default";
      default:
        return "outline";
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          {" "}
          <h2 className="text-lg font-semibold">Enquiries</h2>
        </div>
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
          {searchTerm && (
            <Button
              size="xs"
              variant="ghost"
              onClick={() => setSearchTerm("")}
              className="absolute top-1 right-1"
            >
              <X />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters((s) => !s)}
          >
            <Filter />
            <span className="ml-1">
              {showFilters ? "Hide" : "Show"} Filters
            </span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleOpenCreateEnquiry}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Enquiry
          </Button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="mb-4">
          <div className="bg-card rounded-md p-4 shadow-md dark:shadow-gray-700">
            <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <Label className="mb-1">Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger size="sm" className="w-full">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERAL">General</SelectItem>
                    <SelectItem value="EMERGENCY">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-1">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger size="sm" className="w-full">
                    <SelectValue placeholder="All status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">New</SelectItem>
                    <SelectItem value="IN_REVIEW">In Review</SelectItem>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-1">Source</Label>
                <Input
                  value={customerSourceFilter}
                  onChange={(e) => setCustomerSourceFilter(e.target.value)}
                  placeholder="e.g. Facebook"
                />
              </div>

              <div>
                <Label className="mb-1">Ordering</Label>
                <Select value={ordering} onValueChange={setOrdering}>
                  <SelectTrigger size="sm" className="w-full">
                    <SelectValue placeholder="Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-created_at">Newest first</SelectItem>
                    <SelectItem value="created_at">Oldest first</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-start">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-danger w-full"
                  onClick={() => {
                    setTypeFilter("");
                    setStatusFilter("");
                    setCustomerSourceFilter("");
                    setOrdering("-created_at");
                    setSearchTerm("");
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>

            {/* <div className="mt-4">
              <div className="flex justify-start">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setTypeFilter("");
                    setStatusFilter("");
                    setLeadSourceFilter("");
                    setOrdering("-created_at");
                    setSearchTerm("");
                  }}
                >
                  Reset
                </Button>
              </div>
            </div> */}
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-primary">#</TableHead>
            <TableHead className="text-primary">Summary</TableHead>
            <TableHead className="text-primary text-center">Type</TableHead>
            <TableHead className="text-primary text-center">
              Created At
            </TableHead>
            <TableHead className="text-primary text-center">Person</TableHead>
            <TableHead className="text-primary text-center">Salon</TableHead>
            <TableHead className="text-primary text-center">Status</TableHead>
            <TableHead className="text-primary text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="text-center">
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="py-8">
                <div className="flex items-center justify-center">
                  <LoaderPinwheel className="h-6 w-6 animate-spin" />
                </div>
              </TableCell>
            </TableRow>
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={8} className="py-8">
                Something went wrong while loading enquiries.
              </TableCell>
            </TableRow>
          ) : enquiries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-8">
                No enquiries found.
              </TableCell>
            </TableRow>
          ) : (
            enquiries.map((enq, idx) => {
              return (
                <TableRow key={enq.uid}>
                  <TableCell className="text-start">{idx + 1}</TableCell>
                  <TableCell className="max-w-[100px] truncate text-start">
                    {enq.summary || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getColorBasedOnType(enq.type)}>
                      {formatChoiceFieldValue(enq.type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {formatDateTime(enq.created_at)}
                  </TableCell>
                  <TableCell className="text-center">
                    {enq.lead ? (
                      `${enq.lead.first_name} ${enq.lead.last_name}`
                    ) : enq.customer ? (
                      `${enq.customer?.first_name} ${enq.customer?.last_name}`
                    ) : (
                      <small className="text-muted-foreground">Not Found</small>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {enq.salon?.name ? safe(enq.salon.name) : "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getColorBasedOnStatus(enq.status)}>
                      {formatChoiceFieldValue(enq.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex justify-center gap-1">
                    <div>
                      <Link
                        href={`/dashboard/client-panel/enquiries/${enq.uid}`}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                    <div>
                      {(session?.user?.role === "OWNER" ||
                        session?.user?.role === "ADMIN") && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={() =>
                            enq.uid && handleOpenEditEnquiry(enq.uid)
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <div className="flex justify-between px-2 py-4">
        <div>
          {enquiriesData && enquiriesData.count > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total: {enquiriesData.count} Enquiries
            </div>
          )}
        </div>

        <div>
          {enquiriesData &&
            enquiriesData.count > (enquiriesData.results?.length ?? 0) && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={!enquiriesData.previous || isFetching}
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
                  disabled={!enquiriesData.next || isFetching}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
        </div>
      </div>
      {/* Modals */}
      <CreateEnquiryDialogs
        isOpen={isOpenCreateEnquiry}
        onClose={() => setIsOpenCreateEnquiry(false)}
      />
      <EditEnquiryDialog
        isOpen={isOpenEditEnquiry}
        onClose={() => setIsOpenEditEnquiry(false)}
        enquiryData={selectedEnquiryData}
      />
    </div>
  );
};

export default EnquiryList;
