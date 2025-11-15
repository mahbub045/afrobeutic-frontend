"use client";

import { useGetEnquiryDetailsQuery } from "@/Redux/Reducers/ClientPanel/Enquiries/EnquiriesApi";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatChoiceFieldValue, formatDateTime, safe } from "@/lib/utils";
import { AlertCircle, LoaderPinwheel } from "lucide-react";
import { useParams } from "next/navigation";
import React from "react";

interface Props {
  uid: string;
}

type NullableString = string | null | undefined;

interface Lead {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

interface Customer {
  name?: string;
  phone?: string;
  created_at?: string;
}

interface Salon {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  status?: NullableString;
}

interface Enquiry {
  uid?: string;
  summary?: string | null;
  status?: NullableString;
  type?: NullableString;
  created_at?: string;
  updated_at?: string;
  source?: NullableString;
  lead?: Lead | null;
  customer?: Customer | null;
  salon?: Salon | null;
  // allow extra unknown properties without using `any`
  [key: string]: unknown;
}

const EnquiryDetails: React.FC = () => {
  const { enquiryuid } = useParams<{ enquiryuid: string }>();

  const { data, isLoading, isError } = useGetEnquiryDetailsQuery(enquiryuid);
  const enq = data as Enquiry | undefined;

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoaderPinwheel className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError || !enq) {
    return (
      <Card className="border-destructive/50 bg-destructive/5 border-dashed">
        <CardContent className="flex items-center justify-center gap-3 p-6">
          <AlertCircle className="text-destructive h-5 w-5" />
          <p className="text-destructive text-sm">
            Unable to load enquiry details. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <CardTitle className="mb-3 text-2xl md:text-3xl truncate">
                {enq.summary || "Enquiry"}
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant={getColorBasedOnStatus(enq.status)}>
                  {formatChoiceFieldValue(enq.status)}
                </Badge>
                <Badge variant={getColorBasedOnType(enq.type)}>
                  {formatChoiceFieldValue(enq.type)}
                </Badge>
              </div>
            </div>
            <div className="bg-muted rounded-lg p-3 font-mono text-sm">
              <div className="text-muted-foreground mb-1">Enquiry ID</div>
              <div className="font-semibold">{enq.uid}</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              Created At
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              {formatDateTime(enq.created_at)}
            </p>
            <p className="text-muted-foreground text-xs">
              Updated: {formatDateTime(enq.updated_at)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Source</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">{enq.source ?? "Not Available"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Person</CardTitle>
          </CardHeader>
          <CardContent>
            {enq.lead ? (
              <div className="text-sm">
                <div className="font-semibold">{`${enq.lead.first_name} ${enq.lead.last_name}`}</div>
                <div className="text-muted-foreground text-xs">
                  {enq.lead.email}
                </div>
                <div className="text-muted-foreground text-xs">
                  {enq.lead.phone}
                </div>
              </div>
            ) : enq.customer ? (
              <div className="text-sm">
                <div className="font-semibold">{safe(enq.customer.name)}</div>
                <div className="text-muted-foreground text-xs">
                  {enq.customer.phone}
                </div>
                <div className="text-muted-foreground text-xs">
                  Joined: {formatDateTime(enq.customer.created_at)}
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">Not Found</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Salon</CardTitle>
          </CardHeader>
          <CardContent>
            {enq.salon ? (
              <div className="text-sm">
                <div className="font-semibold">{safe(enq.salon.name)}</div>
                <div className="text-muted-foreground text-xs">
                  {enq.salon.email}
                </div>
                <div className="text-muted-foreground text-xs">
                  {enq.salon.phone}
                </div>
                <div className="text-muted-foreground text-xs">
                  {enq.salon.city}, {enq.salon.country}
                </div>
                <div className="text-muted-foreground text-xs">
                  Status: {formatChoiceFieldValue(enq.salon.status)}
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">Not Found</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{enq.summary || "-"}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnquiryDetails;
