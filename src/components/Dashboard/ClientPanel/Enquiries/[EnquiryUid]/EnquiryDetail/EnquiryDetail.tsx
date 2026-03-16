"use client";

import { useGetEnquiryDetailsQuery } from "@/Redux/Reducers/ClientPanel/Enquiries/EnquiriesApi";
import { EnquiryProps } from "@/Types/EnquiriesTypes/EnquiryType";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatChoiceFieldValue, formatDateTime, safe } from "@/lib/utils";
import { AlertCircle, ArrowLeft, Edit, LoaderPinwheel } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import EditEnquiryDialog from "../../../Enquiries/EnquiryList/Dialogs/EditEnquiryDialog";

const EnquiryDetails: React.FC = () => {
  const { enquiryuid } = useParams<{ enquiryuid: string }>();
  const router = useRouter();
  const [isOpenEditEnquiry, setIsOpenEditEnquiry] = useState<boolean>(false);

  const handleEdit = () => {
    setIsOpenEditEnquiry(true);
  };

  const handleBack = () => {
    router.back();
  };

  const { data, isLoading, isError } = useGetEnquiryDetailsQuery(enquiryuid);
  const enq = data as EnquiryProps | undefined;

  const getColorBasedOnType = (type?: string | null) => {
    switch (type) {
      case "GENERAL_INQUIRY":
        return "default";
      case "EMERGENCY":
        return "danger";
      case "CALLBACK_REQUEST":
        return "warning";
      case "COMPLAINT":
        return "destructive";
      case "SPECIAL_REQUEST":
        return "secondary";
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
      <div className="">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBack}
          className="shrink-0"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 overflow-visible md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 flex-1">
              <CardTitle className="mb-3 max-w-72 truncate text-2xl md:max-w-md md:text-3xl">
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
            <div className="bg-muted w-full max-w-full overflow-hidden rounded-lg p-3 font-mono text-sm break-words whitespace-normal md:w-auto">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div className="min-w-0">
                  <div className="text-muted-foreground mb-1">Enquiry ID</div>
                  <div className="font-semibold break-words break-all">
                    {enq.uid}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEdit}
                    className="w-full md:w-auto"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </div>
              </div>
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
            <p className="text-muted-foreground text-sm">
              {formatChoiceFieldValue(enq.source) || "-"}
            </p>
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
                <div className="text-muted-foreground text-xs">
                  Joined: {formatDateTime(enq.lead.created_at)}
                </div>
              </div>
            ) : enq.customer ? (
              <div className="text-sm">
                <div className="font-semibold">{`${safe(enq.customer.first_name)} ${safe(enq.customer.last_name)}`}</div>
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
                  <Badge variant="secondary">
                    {formatChoiceFieldValue(enq.salon.salon_type)}
                  </Badge>
                </div>
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

      <EditEnquiryDialog
        isOpen={isOpenEditEnquiry}
        onClose={() => setIsOpenEditEnquiry(false)}
        enquiryData={enq}
      />
    </div>
  );
};

export default EnquiryDetails;
