"use client";

import { useGetSupportTicketsQuery } from "@/Redux/Reducers/ClientPanel/SupportTickets/SupportTicketsApi";
import { TicketProps } from "@/Types/ClientPanel/SupportTicketsTypes/SupportTicketsType";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatChoiceFieldValue, formatDateTime } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  FilterX,
  LoaderPinwheel,
  Search,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import AddTicketDialog from "./Dialogs/AddTicketDialog";
import TicketDetail from "./TicketDetail/TicketDetail";

const TicketList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [selectedTicketUid, setSelectedTicketUid] = useState<string | null>(
    null,
  );
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [topicFilter, setTopicFilter] = useState<string>("ALL");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const {
    data: ticketsData,
    isLoading,
    isError,
    isFetching,
  } = useGetSupportTicketsQuery({
    page: currentPage,
    search: debouncedSearch || undefined,
    // Only include filters if they are not 'ALL'
    topic: topicFilter !== "ALL" ? topicFilter : undefined,
    level: levelFilter !== "ALL" ? levelFilter : undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
  });

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
      case "NEW":
        return "danger";
      case "IN_REVIEW":
        return "warning";
      case "RESOLVED":
        return "default";
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
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold"> Support Tickets</h2>

          <div className="flex w-full max-w-xs items-center gap-3">
            <div className="relative flex-1">
              <Search
                size={18}
                className="text-muted-foreground pointer-events-none absolute top-[10px] left-2"
              />
              <Input
                className="focus:!border-primary pl-7 shadow-md focus:!ring-0 dark:shadow-gray-600"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm((e.target as HTMLInputElement).value)
                }
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div>
              <Button
                size="sm"
                variant={showFilters ? "secondary" : "outline"}
                onClick={() => setShowFilters((s) => !s)}
                className={"text-xs font-semibold"}
              >
                {showFilters ? <FilterX /> : <Filter />} Filters
              </Button>
            </div>
            <AddTicketDialog />
          </div>
        </div>
        {showFilters && (
          <div className="border-border from-background to-muted/20 mb-6 rounded-lg border bg-gradient-to-br p-4 shadow-sm">
            <div className="grid gap-4 md:grid-cols-4 md:items-end">
              <div>
                <Select
                  value={topicFilter}
                  onValueChange={(v) => {
                    setTopicFilter(v);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger size="sm" className="w-full">
                    <SelectValue placeholder="Topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Topics</SelectItem>
                    <SelectItem value="ACCOUNT">Account</SelectItem>
                    <SelectItem value="SALON_MANAGEMENT">
                      Salon Management
                    </SelectItem>
                    <SelectItem value="CHATBOTS">Chatbots</SelectItem>
                    <SelectItem value="CLIENT_REQUESTS">
                      Client Requests
                    </SelectItem>
                    <SelectItem value="OTHERS">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  value={levelFilter}
                  onValueChange={(v) => {
                    setLevelFilter(v);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger size="sm" className="w-full">
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Levels</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  value={statusFilter}
                  onValueChange={(v) => {
                    setStatusFilter(v);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger size="sm" className="w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="NEW">New</SelectItem>
                    <SelectItem value="IN_REVIEW">In Review</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setTopicFilter("ALL");
                    setLevelFilter("ALL");
                    setStatusFilter("ALL");
                    setCurrentPage(1);
                  }}
                  className="text-danger w-full"
                >
                  <X />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        )}

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
