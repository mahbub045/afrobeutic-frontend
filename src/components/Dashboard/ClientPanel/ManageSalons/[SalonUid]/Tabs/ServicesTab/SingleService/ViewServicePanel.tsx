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
  onClose?: () => void;
}

const ViewServicePanel: React.FC<ViewServicePanelProps> = ({
  selectedService,
  onClose,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);

  const imagesToShow: string[] = useMemo(() => {
    const rawImages =
      (selectedService as unknown as { images?: unknown[] })?.images ?? [];
    if (!Array.isArray(rawImages)) return [];
    if (typeof rawImages[0] === "string") return rawImages as string[];
    type ImageObj = { image?: string; order?: number; is_primary?: boolean };
    const objs = rawImages as ImageObj[];
    const sorted = [...objs].sort((a, b) => {
      const aPrimary = !!a?.is_primary;
      const bPrimary = !!b?.is_primary;
      if (aPrimary === bPrimary) {
        const ao = a?.order ?? 0;
        const bo = b?.order ?? 0;
        return ao - bo;
      }
      return aPrimary ? -1 : 1;
    });
    return sorted.map((i) => i.image ?? "");
  }, [selectedService]);

  const mainImage =
    imagesToShow.length > 0
      ? imagesToShow[Math.min(selectedImageIndex, imagesToShow.length - 1)]
      : undefined;

  useEffect(() => {
    setIsImageLoading(imagesToShow.length > 0);
  }, [selectedImageIndex, imagesToShow.length]);

  if (!selectedService) return null;

  const safe = (v: unknown): string => {
    if (v === undefined || v === null || v === "") return "-";
    if (typeof v === "string") return v;
    if (typeof v === "number" || typeof v === "boolean") return String(v);
    try {
      return JSON.stringify(v);
    } catch {
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
        {/* ✅ Responsive layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          {/* Left: Image section (on mobile it shows first) */}
          <div className="relative col-span-12 md:col-span-4 bg-muted flex flex-col">
            {mainImage ? (
              <div className="relative h-[300px] md:h-[600px] w-full overflow-hidden">
                <Image
                  src={mainImage}
                  alt={`${selectedService.name}-main`}
                  height={600}
                  width={300}
                  className="object-cover h-full w-full transition-transform duration-500 ease-in-out hover:scale-110"
                  onLoadingComplete={() => setIsImageLoading(false)}
                />

                {/* Loading spinner */}
                {isImageLoading && (
                  <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/10">
                    <LoaderPinwheel className="h-10 w-10 animate-spin" />
                  </div>
                )}

                {/* Navigation buttons */}
                {imagesToShow.length > 1 && (
                  <>
                    {selectedImageIndex > 0 && (
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
                    )}

                    {selectedImageIndex < imagesToShow.length - 1 && (
                      <button
                        type="button"
                        aria-label="Next image"
                        onClick={() => setSelectedImageIndex((i) => i + 1)}
                        className="absolute top-1/2 right-2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/50 focus:outline-none"
                      >
                        <ChevronRight size={20} />
                      </button>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground flex min-h-[200px] md:min-h-[420px] w-full flex-1 items-center justify-center">
                No image
              </div>
            )}
          </div>

          {/* Right: Details section (on mobile it comes below image) */}
          <div className="col-span-12 md:col-span-8 p-4 md:p-6">
            <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="text-muted-foreground text-sm">Service details</div>
                <a className="text-primary text-lg font-medium hover:underline">
                  {selectedService.name}
                </a>
              </div>

              <div className="text-left md:text-right">
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

            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                  Category
                </div>
                <div className="text-sm font-medium">
                  {safe(selectedService.category)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs uppercase">Price $</div>
                <div className="text-sm font-medium">
                  {safe(selectedService.price)}
                </div>
              </div>
            </div>

            {/* Description */}
            {selectedService.description && (
              <div className="mb-6">
                <div className="text-muted-foreground text-xs uppercase">
                  Description
                </div>
                <div className="mt-1 text-sm whitespace-pre-wrap">
                  {selectedService.description}
                </div>
              </div>
            )}

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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
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
                  Discount (%)
                </div>
                <div className="mt-1 text-sm font-medium">
                  {safe(selectedService.discount)}
                </div>
              </div>
            </div>

            {/* Assigned employee and timestamps */}
            <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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

              <div className="text-left md:text-right text-xs">
                <div className="text-muted-foreground">Created At</div>
                <div className="font-medium">{safe(selectedService.created_at)}</div>
                <div className="text-muted-foreground mt-2">Updated At</div>
                <div className="font-medium">{safe(selectedService.updated_at)}</div>
              </div>
            </div>

            {/* Back button */}
            <div className="mt-6 flex justify-end">
              {onClose && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onClose}
                  className="shadow-md dark:shadow-gray-600 flex items-center gap-1"
                >
                  <ArrowLeft size={16} />
                  Back
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

export default ViewServicePanel;
