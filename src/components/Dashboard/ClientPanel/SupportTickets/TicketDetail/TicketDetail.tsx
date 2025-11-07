"use client";

import { useGetSupportTicketQuery } from "@/Redux/Reducers/ClientPanel/SupportTickets/SupportTicketsApi";
import {
  SupportTicketImage,
  TicketProps,
} from "@/Types/ClientPanel/SupportTicketsTypes/SupportTicketsType";
import { Button } from "@/components/ui/button";
import { LoaderPinwheel } from "lucide-react";
import Image from "next/image";
import React from "react";

interface Props {
  uid: string;
}

const TicketDetail: React.FC<Props> = ({ uid }) => {
  const { data, isLoading, isError } = useGetSupportTicketQuery(uid);
  const ticket = data as TicketProps | undefined;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoaderPinwheel className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (isError || !ticket) {
    return <div className="p-4">Unable to load ticket details.</div>;
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{ticket.subject}</h1>
        <div className="text-muted-foreground text-sm">UID: {ticket.uid}</div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="text-muted-foreground text-sm">Topic</div>
          <div className="font-medium">{ticket.topic}</div>
        </div>

        <div>
          <div className="text-muted-foreground text-sm">Level</div>
          <div className="font-medium">{ticket.level}</div>
        </div>

        <div>
          <div className="text-muted-foreground text-sm">Queries</div>
          <div className="rounded bg-gray-50 p-3 whitespace-pre-wrap">
            {ticket.queries}
          </div>
        </div>

        {ticket.images && ticket.images.length > 0 && (
          <div>
            <div className="text-muted-foreground mb-2 text-sm">Images</div>
            <div className="flex flex-wrap gap-2">
              {ticket.images.map((img: SupportTicketImage) => (
                <Image
                  key={img.uid}
                  src={img.image}
                  alt={ticket.subject}
                  width={144}
                  height={144}
                  className="rounded border object-cover"
                />
              ))}
            </div>
          </div>
        )}

        <div className="pt-4">
          <Button
            variant="outline"
            onClick={() => window.close()}
            className="mr-2"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
