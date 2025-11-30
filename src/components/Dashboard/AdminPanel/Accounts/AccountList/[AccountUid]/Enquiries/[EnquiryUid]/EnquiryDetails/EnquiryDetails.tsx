"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatChoiceFieldValue, formatDateTime } from "@/lib/utils";
import { useGetEnquiryDetailsQuery } from "@/Redux/Reducers/AdminPanel/Accounts/Enquiries/EnquiriesApi";
import { EnquiryProps } from "@/Types/AdminPanel/AccountsTypes/EnquiriesTypes/EnquiryType";
import { LoaderPinwheel } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React from "react";

const EnquiryDetails: React.FC = () => {
  const { accountuid, enquiryuid } = useParams() as {
    accountuid?: string;
    enquiryuid?: string;
  };

  const router = useRouter();

  const { data, isLoading, isError } = useGetEnquiryDetailsQuery({
    accountUid: accountuid,
    enquiryUid: enquiryuid,
  });

  const enq = data as EnquiryProps | undefined;

  const getStatusVariant = (status?: string) => {
    switch ((status || "").toUpperCase()) {
      case "NEW":
        return "default" as const;
      case "IN_REVIEW":
        return "warning" as const;
      case "CANCELLED":
        return "destructive" as const;
      case "RESOLVED":
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  };

  const getLevelVariant = (level?: string) => {
    switch ((level || "").toUpperCase()) {
      case "EMERGENCY":
        return "danger" as const;
      case "GENERAL":
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoaderPinwheel className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError || !enq) {
    return (
      <div className="p-6">
        <div className="text-destructive mb-4 text-center">
          Failed to load enquiry.
        </div>
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => router.back()}>
            Go back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-primary text-2xl font-semibold">{enq.subject}</h2>
          <div className="text-muted-foreground mt-1 text-sm">
            {formatChoiceFieldValue(enq.topic)}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <Badge variant={getStatusVariant(enq.status)}>
            {formatChoiceFieldValue(enq.status)}
          </Badge>
          <div className="text-muted-foreground text-sm">
            Created: {formatDateTime(enq.created_at)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-md border p-4 md:col-span-2">
          <h3 className="mb-2 text-lg font-medium">Queries</h3>
          <div className="prose max-w-none text-sm whitespace-pre-wrap">
            {enq.queries}
          </div>
        </div>

        <aside className="rounded-md border p-4">
          <h4 className="mb-2 text-sm font-semibold">Details</h4>
          <div className="text-sm">
            <div className="mb-2 flex justify-between">
              <span className="text-muted-foreground">UID</span>
              <span>{enq.uid}</span>
            </div>
            <div className="mb-2 flex justify-between">
              <span className="text-muted-foreground">Level</span>
              <Badge variant={getLevelVariant(enq.level)}>
                {formatChoiceFieldValue(enq.level)}
              </Badge>
            </div>
            <div className="mb-2 flex justify-between">
              <span className="text-muted-foreground">Topic</span>
              <span>{formatChoiceFieldValue(enq.topic)}</span>
            </div>
            <div className="mb-2 flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span>
                <Badge variant={getStatusVariant(enq.status)}>
                  {formatChoiceFieldValue(enq.status)}
                </Badge>
              </span>
            </div>
            <div className="mb-2 flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>{formatDateTime(enq.created_at)}</span>
            </div>
          </div>
        </aside>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-medium">Images</h3>
        {enq.images && enq.images.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {enq.images.map((img) => (
              <div key={img.uid} className="overflow-hidden rounded border">
                <Image
                  src={img.image}
                  alt={img.uid}
                  width={400}
                  height={300}
                  className="h-48 w-full object-cover"
                  unoptimized
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground text-sm">
            No images attached.
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={() => router.back()} variant="outline">
          Close
        </Button>
      </div>
    </div>
  );
};

export default EnquiryDetails;
