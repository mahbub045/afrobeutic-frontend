"use client";

import { useGetSupportTicketQuery } from "@/Redux/Reducers/ClientPanel/SupportTickets/SupportTicketsApi";
import {
  SupportTicketImage,
  TicketProps,
} from "@/Types/ClientPanel/SupportTicketsTypes/SupportTicketsType";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatChoiceFieldValue, formatDateTime } from "@/lib/utils";
import {
  AlertCircle,
  Calendar,
  FileText,
  Image as ImageIcon,
  LoaderPinwheel,
  MessageSquare,
  Tag,
} from "lucide-react";
import Image from "next/image";
import React from "react";

interface Props {
  uid: string;
}

const TicketDetail: React.FC<Props> = ({ uid }) => {
  const { data, isLoading, isError } = useGetSupportTicketQuery(uid);
  const ticket = data as TicketProps | undefined;

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
        return "default";
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
        return "default";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoaderPinwheel className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <Card className="border-destructive/50 bg-destructive/5 border-dashed">
        <CardContent className="flex items-center justify-center gap-3 p-6">
          <AlertCircle className="text-destructive h-5 w-5" />
          <p className="text-destructive text-sm">
            Unable to load ticket details. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <CardTitle className="mb-3 text-2xl md:text-3xl">
                {ticket.subject}
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant={getColorBasedOnStatus(ticket.status)}>
                  {formatChoiceFieldValue(ticket.status)}
                </Badge>
                <Badge variant={getColorBasedOnLevel(ticket.level)}>
                  {formatChoiceFieldValue(ticket.level)}
                </Badge>
              </div>
            </div>
            <div className="bg-muted rounded-lg p-3 font-mono text-sm">
              <div className="text-muted-foreground mb-1">Ticket ID</div>
              <div className="font-semibold">{ticket.uid}</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Info Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Topic Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Tag className="h-4 w-4" />
              Topic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              {formatChoiceFieldValue(ticket.topic)}
            </p>
          </CardContent>
        </Card>

        {/* Created At Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
              Created At
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              {formatDateTime(ticket.created_at)}
            </p>
          </CardContent>
        </Card>

        {/* Queries Count Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4" />
              Queries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-primary text-sm font-semibold">
              {ticket.queries}
            </p>
          </CardContent>
        </Card>

        {/* Level & Status Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Priority Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-muted-foreground mb-1 text-xs">
                  Priority Level
                </p>
                <Badge variant={getColorBasedOnLevel(ticket.level)}>
                  {formatChoiceFieldValue(ticket.level)}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground mb-1 text-xs">
                  Current Status
                </p>
                <Badge variant={getColorBasedOnStatus(ticket.status)}>
                  {formatChoiceFieldValue(ticket.status)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-muted bg-muted/30 rounded-lg border p-4">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {ticket.queries}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Images Section */}
      {ticket.images && ticket.images.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ImageIcon className="h-4 w-4" />
              Attachments ({ticket.images.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {ticket.images.map((img: SupportTicketImage, idx) => (
                <div
                  key={img.uid}
                  className="group border-muted hover:border-primary relative overflow-hidden rounded-lg border transition-all hover:shadow-md"
                >
                  <Image
                    src={img.image}
                    alt={`Attachment ${idx + 1}`}
                    width={200}
                    height={200}
                    className="h-40 w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Separator */}
      <Separator className="my-2" />

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 sm:flex-none">
          Reply
        </Button>
        <Button variant="outline" className="flex-1 sm:flex-none">
          Update Status
        </Button>
        <Button variant="outline" className="flex-1 sm:flex-none">
          Print
        </Button>
      </div>
    </div>
  );
};

export default TicketDetail;
