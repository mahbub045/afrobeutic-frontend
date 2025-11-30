"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatChoiceFieldValue, formatDateTime } from "@/lib/utils";
import { useGetEnquiryDetailsQuery } from "@/Redux/Reducers/AdminPanel/Accounts/Enquiries/EnquiriesApi";
import { EnquiryProps } from "@/Types/AdminPanel/AccountsTypes/EnquiriesTypes/EnquiryType";
import { ChevronLeft, ChevronRight, LoaderPinwheel, X } from "lucide-react";
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

  // Fullscreen image viewer state
  const [viewerOpen, setViewerOpen] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const images = enq?.images ?? [];

  const openViewer = (index: number) => {
    setCurrentIndex(index);
    setViewerOpen(true);
  };

  const closeViewer = () => {
    setViewerOpen(false);
  };

  const showNext = () => {
    if (images.length === 0) return;
    setCurrentIndex((i) => (i + 1) % images.length);
  };

  const showPrev = () => {
    if (images.length === 0) return;
    setCurrentIndex((i) => (i - 1 + images.length) % images.length);
  };

  React.useEffect(() => {
    if (!viewerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeViewer();
      if (e.key === "ArrowRight") {
        if (images.length === 0) return;
        setCurrentIndex((i) => (i + 1) % images.length);
      }
      if (e.key === "ArrowLeft") {
        if (images.length === 0) return;
        setCurrentIndex((i) => (i - 1 + images.length) % images.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewerOpen, images.length]);

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
              <span className="text-xs">{enq.uid}</span>
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
            {enq.images.map((img, idx) => (
              <button
                key={img.uid}
                onClick={() => {
                  openViewer(idx);
                }}
                className="overflow-hidden rounded border p-0"
                aria-label={`Open image ${idx + 1} in fullscreen`}
              >
                <Image
                  src={img.image}
                  alt={img.uid}
                  width={400}
                  height={300}
                  className="h-48 w-full object-cover"
                  unoptimized
                />
              </button>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground text-sm">
            No images attached.
          </div>
        )}
      </div>

      {/* Fullscreen viewer dialog */}
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent
          showCloseButton={false}
          className="fixed inset-0 top-0 left-0 z-50 m-0 translate-x-0 translate-y-0 rounded-none bg-black p-0"
        >
          <DialogTitle className="sr-only">Image viewer</DialogTitle>
          <div className="relative flex h-screen w-full items-center justify-center">
            <button
              type="button"
              onClick={showPrev}
              aria-label="Previous image"
              disabled={images.length <= 1}
              className="absolute top-1/2 left-4 z-50 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white hover:bg-black/60 focus:ring-2 focus:ring-white/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <div className="flex w-full items-center justify-center">
              <div className="relative flex max-h-[90vh] max-w-[90vw] items-center justify-center">
                {images[currentIndex] && (
                  <Image
                    src={images[currentIndex].image}
                    alt={images[currentIndex].uid}
                    width={650}
                    height={720}
                    unoptimized
                    className="mx-auto h-[90vh] w-[90vw] object-contain"
                  />
                )}

                {/* Image counter */}
                <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 rounded bg-black/50 px-3 py-1 text-sm text-white">
                  {currentIndex + 1} / {images.length}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={showNext}
              aria-label="Next image"
              disabled={images.length <= 1}
              className="absolute top-1/2 right-4 z-50 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white hover:bg-black/60 focus:ring-2 focus:ring-white/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <DialogClose className="absolute top-4 right-4 text-white">
              <X />
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex justify-end">
        <Button onClick={() => router.back()} variant="outline">
          Close
        </Button>
      </div>
    </div>
  );
};

export default EnquiryDetails;
