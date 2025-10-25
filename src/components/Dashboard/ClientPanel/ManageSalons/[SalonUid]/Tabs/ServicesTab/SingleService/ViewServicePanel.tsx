import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceProps } from "@/Types/ClientPanel/ServicesTypes/ServicesType";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Edit,
  LoaderPinwheel,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";

export interface ViewServicePanelProps {
  selectedService: ServiceProps;
  onClose?: () => void; // optional handler to go back to list
}

const ViewServicePanel: React.FC<ViewServicePanelProps> = ({
  selectedService,
  onClose,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);

  // Normalize images so component can handle both string[] and object[] shapes from the API.
  const imagesToShow: string[] = useMemo(() => {
    const rawImages =
      (selectedService as unknown as { images?: unknown[] })?.images ?? [];
    if (!Array.isArray(rawImages)) return [];
    const items = rawImages as unknown[];
    if (items.length === 0) return [];
    if (typeof items[0] === "string") return items as string[];
    type ImageObj = { image?: string; order?: number; is_primary?: boolean };
    const objs = items as ImageObj[];
    const sorted = [...objs].sort((a, b) => {
      const aPrimary = !!a?.is_primary;
      const bPrimary = !!b?.is_primary;
      if (aPrimary === bPrimary) {
        const ao = typeof a?.order === "number" ? a.order : 0;
        const bo = typeof b?.order === "number" ? b.order : 0;
        return ao - bo;
      }
      return aPrimary ? -1 : 1;
    });
    return sorted.map((i) => i?.image ?? "");
  }, [selectedService]);

  const mainImage =
    imagesToShow.length > 0
      ? imagesToShow[Math.min(selectedImageIndex, imagesToShow.length - 1)]
      : undefined;

  // When the selected image index changes, show the loading spinner until
  // next/image reports the image finished loading via onLoadingComplete.
  useEffect(() => {
    if (imagesToShow.length > 0) {
      setIsImageLoading(true);
    } else {
      setIsImageLoading(false);
    }
  }, [selectedImageIndex, imagesToShow.length]);

  if (!selectedService) return null;

  const safe = (v: unknown): string => {
    if (v === undefined || v === null || v === "") return "-";
    if (typeof v === "string") return v;
    if (typeof v === "number" || typeof v === "boolean") return String(v);
    try {
      return JSON.stringify(v);
    } catch (e) {
      return String(v);
    }
  };

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Service details</h2>
        <TabsList className="shadow-md dark:shadow-gray-600">
          <TabsTrigger value="list" className="px-3">
            List
          </TabsTrigger>
          <TabsTrigger value="details" className="px-3">
            Details
          </TabsTrigger>
        </TabsList>
      </div>
      <Card className="bg-card overflow-hidden rounded-md p-0 shadow-md dark:shadow-gray-600">
        <div className="grid grid-cols-12 gap-0">
          {/* Left: narrow image strip */}
          <div className="bg-muted relative col-span-4 flex flex-col">
            {mainImage ? (
              <div className="relative h-[600px] w-full overflow-hidden">
                <Image
                  src={mainImage}
                  alt={`${selectedService.name}-main`}
                  fill
                  className=" object-cover transition-transform duration-500 ease-in-out hover:scale-110"
                  onLoadingComplete={() => setIsImageLoading(false)}
                />

                {/* spinner while image loads */}
                {isImageLoading ? (
                  <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/10">
                    <LoaderPinwheel className="h-10 w-10 animate-spin" />
                  </div>
                ) : null}

                {imagesToShow.length > 1 ? (
                  <>
                    {selectedImageIndex > 0 ? (
                      <button
                        type="button"
                        aria-label="Previous image"
                        onClick={() =>
                          setSelectedImageIndex((i) => Math.max(0, i - 1))
                        }
                        className="absolute top-1/2 left-2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/50 focus:outline-none"
                      >
                        <ChevronLeft size={20} />
                      </button>
                    ) : null}
                    {/* hide Next button when on last image */}
                    {selectedImageIndex < imagesToShow.length - 1 ? (
                      <button
                        type="button"
                        aria-label="Next image"
                        onClick={() => setSelectedImageIndex((i) => i + 1)}
                        className="absolute top-1/2 right-2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/50 focus:outline-none"
                      >
                        <ChevronRight size={20} />
                      </button>
                    ) : null}
                  </>
                ) : null}
              </div>
            ) : (
              <div className="text-muted-foreground flex min-h-[420px] w-full flex-1 items-center justify-center">
                No image
              </div>
            )}
          </div>

          {/* Middle: details column (narrow) */}
          <div className="col-span-8 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-muted-foreground text-sm">
                  Service details
                </div>
                <a className="text-primary text-lg font-medium hover:underline">
                  {selectedService.name}
                </a>
              </div>

              <div className="text-right">
                <div className="text-muted-foreground text-sm">Price</div>
                <div className="text-lg font-semibold">
                  ${safe(selectedService.price)}
                </div>
              </div>
            </div>

            {/* Basic info */}
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-base font-semibold">Basic info</h4>
              <Button
                variant="outline"
                size="sm"
                className="shadow-md dark:shadow-gray-600"
              >
                <Edit size={16} />
              </Button>
            </div>

            <div className="mb-6 grid grid-cols-3 gap-6">
              <div>
                <div className="text-muted-foreground text-xs uppercase">
                  Service name
                </div>
                <div className="text-sm font-medium">
                  {safe(selectedService.name)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs uppercase">
                  Service category
                </div>
                <div className="text-sm font-medium">
                  {safe(selectedService.category)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs uppercase">
                  Price $
                </div>
                <div className="text-sm font-medium">
                  {safe(selectedService.price)}
                </div>
              </div>
            </div>

            {/* Description (full width) */}
            {selectedService.description ? (
              <div className="mb-6">
                <div className="text-muted-foreground text-xs uppercase">
                  Description
                </div>
                <div className="mt-1 text-sm whitespace-pre-wrap">
                  {selectedService.description}
                </div>
              </div>
            ) : null}

            {/* More info */}
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-base font-semibold">More info</h4>
              <Button
                variant="outline"
                size="sm"
                className="shadow-md dark:shadow-gray-600"
              >
                <Edit size={16} />
              </Button>
            </div>

            <div className="grid grid-cols-3 items-start gap-6">
              <div className="col-span-2">
                <div className="text-muted-foreground text-xs uppercase">
                  Available time slots
                </div>
                <div className="mt-1 text-sm font-medium">
                  {Array.isArray(selectedService.available_time_slots)
                    ? JSON.stringify(selectedService.available_time_slots)
                    : safe(selectedService.available_time_slots)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs uppercase">
                  Booking lead time
                </div>
                <div className="mt-1 text-sm font-medium">
                  {safe(selectedService.booking_lead_time)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs uppercase">
                  Cancellation policy
                </div>
                <div className="mt-1 text-sm font-medium">
                  {safe(selectedService.cancellation_policy ? "yes" : "no")}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs uppercase">
                  Gender specific
                </div>
                <div className="mt-1 text-sm font-medium">
                  {safe(selectedService.gender_specific)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs uppercase">
                  Discount (percentage %)
                </div>
                <div className="mt-1 text-sm font-medium">
                  {safe(selectedService.discount)}
                </div>
              </div>
            </div>

            {/* Assigned employee and timestamps */}
            <div className="mt-6 flex items-center justify-between">
              <div>
                <div className="text-muted-foreground text-xs uppercase">
                  Assigned employee
                </div>
                <div className="mt-2">
                  {selectedService.assigned_employee ? (
                    <span className="bg-muted inline-block rounded px-2 py-1 text-sm">
                      {selectedService.assigned_employee}
                    </span>
                  ) : (
                    <span className="text-sm">-</span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="text-muted-foreground text-xs">Created At</div>
                <div className="text-xs font-medium">
                  {safe(selectedService.created_at)}
                </div>
                <div className="text-muted-foreground mt-2 text-xs">
                  Updated At
                </div>
                <div className="text-xs font-medium">
                  {safe(selectedService.updated_at)}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              {onClose ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onClose}
                  className="shadow-d dark:shadow-gray-600"
                >
                  <ArrowLeft />
                  Back
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

export default ViewServicePanel;
