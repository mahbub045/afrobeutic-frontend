"use client";

import { useGetSupportTicketsQuery } from "@/Redux/Reducers/ClientPanel/SupportTickets/SupportTicketsApi";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatChoiceFieldValue } from "@/lib/utils";
import { Eye, LoaderPinwheel, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

type Ticket = {
  uid: string;
  level: string;
  topic: string;
  subject: string;
  queries: string;
};

const TicketList: React.FC = () => {
  const router = useRouter();

  const {
    data: ticketsData,
    isLoading,
    isError,
  } = useGetSupportTicketsQuery(undefined);

  const tickets: Ticket[] = ticketsData?.results || [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Support Tickets</h2>
        <Button size="sm">
          <Plus />
          Create Ticket
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-primary">#</TableHead>
            <TableHead className="text-primary">Subject</TableHead>
            <TableHead className="text-primary text-center">Topic</TableHead>
            <TableHead className="text-primary text-center">Level</TableHead>
            <TableHead className="text-primary text-center">Queries</TableHead>
            <TableHead className="text-primary text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="text-center">
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="py-8">
                <div className="flex items-center justify-center">
                  <LoaderPinwheel className="h-6 w-6 animate-spin" />
                </div>
              </TableCell>
            </TableRow>
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={6} className="py-8">
                Something went wrong while loading tickets.
              </TableCell>
            </TableRow>
          ) : tickets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-8">
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
                  {formatChoiceFieldValue(t.level)}
                </TableCell>
                <TableCell className="text-center leading-1">
                  {t.queries}
                </TableCell>
                <TableCell className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
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

      <div className="mt-4 text-sm text-gray-600">
        {ticketsData && typeof ticketsData.count === "number" && (
          <div>
            Total: {ticketsData.count} ticket
            {ticketsData.count !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketList;
