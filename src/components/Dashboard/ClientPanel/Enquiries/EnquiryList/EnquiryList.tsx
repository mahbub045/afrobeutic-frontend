"use client";

import {
  useGetEnquiriesQuery,
  useGetEnquiryDetailsQuery,
} from "@/Redux/Reducers/ClientPanel/Enquiries/EnquiriesApi";
import { EnquiryProps } from "@/Types/EnquiriesTypes/EnquiryType";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  LoaderPinwheel,
  Plus,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { useState } from "react";
import CreateEnquiryDialogs from "./Dialogs/CreateEnquiryDialogs";
import EditEnquiryDialog from "./Dialogs/EditEnquiryDialog";

const EnquiryList: React.FC = () => {
  const { data: session } = useSession();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isOpenCreateEnquiry, setIsOpenCreateEnquiry] =
    useState<boolean>(false);
  const [isOpenEditEnquiry, setIsOpenEditEnquiry] = useState<boolean>(false);
  const [selectedEnquiryUid, setSelectedEnquiryUid] = useState<string | null>(
    null,
  );

  const {
    data: enquiriesData,
    isLoading,
    isError,
    isFetching,
  } = useGetEnquiriesQuery({ page: currentPage });

  const { data: selectedEnquiryData } = useGetEnquiryDetailsQuery(
    selectedEnquiryUid ?? "",
    { skip: !selectedEnquiryUid },
  );

  const enquiries: EnquiryProps[] = enquiriesData?.results || [];

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
        <h2 className="text-lg font-semibold">Enquiries</h2>
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
                    ) : enq.customer?.name ? (
                      `${enq.customer?.name}`
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
                          onClick={() => handleOpenEditEnquiry(enq.uid)}
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
