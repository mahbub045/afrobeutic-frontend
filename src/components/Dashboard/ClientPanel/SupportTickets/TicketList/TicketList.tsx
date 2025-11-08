"use client";

import { useGetSupportTicketsQuery } from "@/Redux/Reducers/ClientPanel/SupportTickets/SupportTicketsApi";
import { TicketProps } from "@/Types/ClientPanel/SupportTicketsTypes/SupportTicketsType";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatChoiceFieldValue, formatDateTime } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Eye, LoaderPinwheel } from "lucide-react";
import React, { useState } from "react";
import TicketDetail from "../TicketDetail/TicketDetail";
import AddTicketDialog from "./Dialogs/AddTicketDialog";

const TicketList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedTicketUid, setSelectedTicketUid] = useState<string | null>(
    null,
  );

  const {
    data: ticketsData,
    isLoading,
    isError,
    isFetching,
  } = useGetSupportTicketsQuery({ page: currentPage });

  const tickets: TicketProps[] = ticketsData?.results || [];

  const handlePreviousPage = () => {
    if (ticketsData?.previous) setCurrentPage((p) => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    if (ticketsData?.next) setCurrentPage((p) => p + 1);
  };

  const totalPages = ticketsData?.count
    ? Math.ceil(ticketsData.count / (ticketsData.results?.length || 1))
    : 0;

  const getColorBasedOnLevel = (level: string) => {
    switch (level) {
      case "LOW":
        return "default";
      case "MEDIUM":
        return "secondary";
      case "HIGH":
        return "warning";
      case "URGENT":
        return "danger";
      default:
        return "outline";
    }
  };
  const getColorBasedOnStatus = (status: string) => {
    switch (status) {
      case "OPEN":
        return "default";
      case "IN_PROGRESS":
        return "secondary";
      case "RESOLVED":
        return "warning";
      case "CLOSED":
        return "danger";
      default:
        return "outline";
    }
  };

  return (
    <Tabs
      defaultValue="list"
      value={selectedTicketUid ? "detail" : "list"}
      onValueChange={(value) => {
        if (value === "list") setSelectedTicketUid(null);
      }}
    >
      <TabsList className={`mb-4 ${!selectedTicketUid ? "hidden" : ""}`}>
        <TabsTrigger value="list">Tickets List</TabsTrigger>
        <TabsTrigger value="detail">Ticket Detail</TabsTrigger>
      </TabsList>

      <TabsContent value="list" className="space-y-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold"> Support Tickets</h2>
          <AddTicketDialog />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-primary">#</TableHead>
              <TableHead className="text-primary">Subject</TableHead>
              <TableHead className="text-primary text-center">Topic</TableHead>
              <TableHead className="text-primary text-center">Level</TableHead>
              <TableHead className="text-primary text-center">
                Created At
              </TableHead>
              <TableHead className="text-primary text-center">
                Queries
              </TableHead>
              <TableHead className="text-primary text-center">Status</TableHead>
              <TableHead className="text-primary text-center">
                Actions
              </TableHead>
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
                  Something went wrong while loading tickets.
                </TableCell>
              </TableRow>
            ) : tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8">
                  No support tickets found.
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((t, idx) => (
                <TableRow key={t.uid}>
                  <TableCell className="text-start">{idx + 1}</TableCell>
                  <TableCell className="text-start">{t.subject}</TableCell>
                  <TableCell className="text-center">
                    {formatChoiceFieldValue(t.topic)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getColorBasedOnLevel(t.level)}>
                      {formatChoiceFieldValue(t.level)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {formatDateTime(t.created_at)}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-center">
                    {t.queries}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getColorBasedOnStatus(t.status)}>
                      {formatChoiceFieldValue(t.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => setSelectedTicketUid(t.uid)}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex justify-between px-2 py-4">
          <div>
            {ticketsData && ticketsData.count > 0 && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total: {ticketsData.count} ticket
                {ticketsData.count !== 1 ? "s" : ""}
              </div>
            )}
          </div>

          <div>
            {ticketsData &&
              ticketsData.count > (ticketsData.results?.length ?? 0) && (
                <div className="flex items-center justify-center gap-4 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={!ticketsData.previous || isFetching}
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
                    disabled={!ticketsData.next || isFetching}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="detail">
        {selectedTicketUid && <TicketDetail uid={selectedTicketUid} />}
      </TabsContent>
    </Tabs>
  );
};

export default TicketList;
