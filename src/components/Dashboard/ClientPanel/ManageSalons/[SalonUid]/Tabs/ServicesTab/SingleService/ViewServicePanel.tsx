import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatChoiceFieldValue, formatDateTime, safe } from "@/lib/utils";
import { useGetServicesDataQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Services/ServicesApi";
import {
  Employee,
  ServiceProps,
  ViewServicePanelProps,
} from "@/Types/ClientPanel/ManageSalonTypes/ServicesTypes/ServicesType";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Edit,
  LoaderPinwheel,
  Maximize2,
} from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import EditServiceBasicInfoDialog from "./Dialogs/EditServiceBasicInfoDialog";
import EditServiceMoreInfoDialog from "./Dialogs/EditServiceMoreInfoDialog";
import FullScreenImageViewer from "./FullScreenImageViewer";

const ViewServicePanel: React.FC<ViewServicePanelProps> = ({
  selectedService,
  onClose,
}) => {
  const { salonuid } = useParams();
  const salonUid = Array.isArray(salonuid) ? salonuid[0] : (salonuid ?? "");

  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState<boolean>(false);
  const [
    isOpenEditServiceBasicInfoDialog,
    setIsOpenEditServiceBasicInfoDialog,
  ] = useState(false);
  const [isOpenEditServiceMoreInfoDialog, setIsOpenEditServiceMoreInfoDialog] =
    useState(false);

  const [displayedService, setDisplayedService] =
    useState<ServiceProps>(selectedService);

  // Re-fetch services data to get updated service
  const { data: serviceData, refetch } = useGetServicesDataQuery(
    {
      salonUid,
      page: 1,
      page_size: 1000, // Fetch enough to find our service
    },
    { skip: !salonUid },
  );

  // Update displayed service when selectedService prop changes
  useEffect(() => {
    setDisplayedService(selectedService);
  }, [selectedService]);

  // Update displayed service when services data refetches (after edit)
  useEffect(() => {
    if (serviceData?.results && Array.isArray(serviceData.results)) {
      const updatedService = (serviceData.results as ServiceProps[]).find(
        (s) => s.uid === selectedService.uid,
      );
      if (updatedService) {
        setDisplayedService(updatedService);
      }
    }
  }, [serviceData, selectedService.uid]);

  const handleEditServiceBasicInfo = () => {
    setIsOpenEditServiceBasicInfoDialog(true);
  };

  const handleEditServiceMoreInfo = () => {
    setIsOpenEditServiceMoreInfoDialog(true);
  };

  const handleEditSuccess = () => {
    // Refetch services to get the latest data
    refetch();
  };

  const handleOpenFullScreen = useCallback(() => {
    setIsFullScreenOpen(true);
  }, []);

  const imagesToShow: string[] = useMemo(() => {
    const rawImages =
      (displayedService as unknown as { images?: unknown[] })?.images ?? [];
    if (!Array.isArray(rawImages)) return [];
    if (rawImages.length === 0) return [];
    // If images are simple strings, return as-is
    if (typeof rawImages[0] === "string") return rawImages as string[];
    // If images are objects, preserve original array order and map to image string
    type ImageObj = { image?: string };
    const objs = rawImages as ImageObj[];
    return objs.map((i) => i.image ?? "");
  }, [displayedService]);

  const mainImage =
    imagesToShow.length > 0
      ? imagesToShow[Math.min(selectedImageIndex, imagesToShow.length - 1)]
      : undefined;

  useEffect(() => {
    setIsImageLoading(imagesToShow.length > 0);
  }, [selectedImageIndex, imagesToShow.length]);

  // typed local helper: use backend's `assign_employees` key directly (no shim)
  const assignEmployees = (
    displayedService as unknown as { assign_employees?: Employee[] }
  )?.assign_employees;

  if (!displayedService) return null;

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
        <div className="grid grid-cols-1 gap-0 md:grid-cols-12">
          {/* Left: Image section (on mobile it shows first) */}
          <div className="bg-muted relative col-span-12 flex flex-col md:col-span-4">
            {mainImage ? (
              <div className="group relative h-[300px] w-full cursor-pointer overflow-hidden md:h-[600px]">
                <Image
                  src={mainImage}
                  alt={`${displayedService.name}-main`}
                  height={600}
                  width={300}
                  className="h-full w-full object-cover"
                  onLoadingComplete={() => setIsImageLoading(false)}
                  onClick={handleOpenFullScreen}
                />

                {/* Fullscreen hint overlay */}
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/20">
                  <button
                    type="button"
                    aria-label="Open image in fullscreen"
                    onClick={handleOpenFullScreen}
                    className="absolute top-2 right-2 z-20 rounded-full bg-white/30 p-2 text-white opacity-100 hover:bg-white/40 focus:outline-none"
                  >
                    <Maximize2 size={20} />
                  </button>
                </div>

                {/* Loading spinner */}
                {isImageLoading && (
                  <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/10">
                    <LoaderPinwheel className="text-primary h-10 w-10 animate-spin" />
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
              <div className="text-muted-foreground flex min-h-[200px] w-full flex-1 items-center justify-center md:min-h-[420px]">
                No image
              </div>
            )}
          </div>

          {/* Right: Details section (on mobile it comes below image) */}
          <div className="col-span-12 p-4 md:col-span-8 md:p-6">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div></div>
              <div>
                {/* <div className="text-muted-foreground text-sm">
                  Service details
                </div> */}
                <a className="text-primary text-lg font-medium hover:underline">
                  {displayedService.name}
                </a>
              </div>

              <div className="text-left md:text-right">
                <div className="text-muted-foreground text-sm">Price</div>
                <div className="text-lg font-semibold">
                  ${safe(displayedService.price)}
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
                onClick={handleEditServiceBasicInfo}
              >
                <Edit size={16} />
              </Button>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div>
                <div className="text-muted-foreground text-xs uppercase">
                  Service name
                </div>
                <div className="text-sm font-medium">
                  {safe(displayedService.name)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs uppercase">
                  Category
                </div>
                <div className="text-sm font-medium">
                  {safe(displayedService.category)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs uppercase">
                  Price $
                </div>
                <div className="text-sm font-medium">
                  {safe(displayedService.price)}
                </div>
              </div>
              <div className="mb-6">
                <div className="text-muted-foreground text-xs uppercase">
                  Description
                </div>
                <div className="mt-1 text-sm whitespace-pre-wrap">
                  {safe(displayedService.description)}
                </div>
              </div>
            </div>

            {/* More info */}
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-base font-semibold">More info</h4>
              <Button
                variant="outline"
                size="sm"
                className="shadow-md dark:shadow-gray-600"
                onClick={handleEditServiceMoreInfo}
              >
                <Edit size={16} />
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div>
                <div className="text-muted-foreground text-xs uppercase">
                  Available time slots
                </div>
                <div className="mt-1 text-sm font-medium">
                  {Array.isArray(displayedService.available_time_slots) ? (
                    <div className="flex flex-wrap gap-2">
                      {(displayedService.available_time_slots as unknown[])
                        .length === 0 ? (
                        <span className="text-sm">-</span>
                      ) : (
                        (
                          displayedService.available_time_slots as unknown[]
                        ).map((slot, idx) => (
                          <Badge key={idx} variant="default">
                            {formatChoiceFieldValue(slot)}
                          </Badge>
                        ))
                      )}
                    </div>
                  ) : (
                    safe(displayedService.available_time_slots)
                  )}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs uppercase">
                  Service Duration
                </div>
                <div className="mt-1 text-sm font-medium">
                  {safe(displayedService.service_duration)}{" "}
                  <span className="text-muted-foreground text-xs">
                    (HH:MM:SS)
                  </span>
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs uppercase">
                  Gender specific
                </div>
                <div className="mt-1 text-sm font-medium">
                  <Badge variant="default">
                    {formatChoiceFieldValue(displayedService.gender_specific || "N/A")}
                  </Badge>
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs uppercase">
                  Discount (%)
                </div>
                <div className="mt-1 text-sm font-medium">
                  {safe(displayedService.discount_percentage)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs uppercase">
                  Created At
                </div>
                <div className="mt-1 text-sm font-medium">
                  {safe(formatDateTime(displayedService.created_at))}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs uppercase">
                  Updated At
                </div>
                <div className="mt-1 text-sm font-medium">
                  {safe(formatDateTime(displayedService.updated_at))}
                </div>
              </div>
            </div>
            {/* Assigned employee and timestamps */}
            <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-muted-foreground text-xs uppercase">
                  Assigned employee
                </div>
                <div className="mt-2">
                  {Array.isArray(assignEmployees) ? (
                    assignEmployees && assignEmployees.length === 0 ? (
                      <span className="text-sm">-</span>
                    ) : (
                      // limit height so it scrolls when there are many employees
                      <Card className="flex max-h-32 gap-1 overflow-y-auto px-2 py-2">
                        {assignEmployees!.map((emp, idx) => (
                          <div
                            key={emp?.uid ?? idx}
                            className="bg-muted flex items-center justify-between gap-10 rounded px-3 py-1"
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {safe(emp?.name ?? "-")}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                {safe(emp?.employee_id ?? "")}
                              </span>
                            </div>
                            <div className="text-muted-foreground text-right text-xs">
                              {safe(emp?.designation ?? "")}
                            </div>
                          </div>
                        ))}
                      </Card>
                    )
                  ) : assignEmployees ? (
                    <span className="bg-muted inline-block rounded px-2 py-1 text-sm">
                      {String(assignEmployees)}
                    </span>
                  ) : (
                    <span className="text-sm">-</span>
                  )}
                </div>
              </div>
              <div className="mt-6">
                {onClose && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onClose}
                    className="flex items-center gap-1 shadow-md dark:shadow-gray-600"
                  >
                    <ArrowLeft size={16} />
                    Back
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
      {/* Dialogs */}
      <EditServiceBasicInfoDialog
        selectedService={displayedService}
        isOpen={isOpenEditServiceBasicInfoDialog}
        onClose={() => setIsOpenEditServiceBasicInfoDialog(false)}
        onEditSuccess={handleEditSuccess}
      />
      <EditServiceMoreInfoDialog
        selectedService={displayedService}
        isOpen={isOpenEditServiceMoreInfoDialog}
        onClose={() => setIsOpenEditServiceMoreInfoDialog(false)}
        onEditSuccess={handleEditSuccess}
      />
      <FullScreenImageViewer
        isOpen={isFullScreenOpen}
        images={imagesToShow}
        currentImageIndex={selectedImageIndex}
        onClose={() => setIsFullScreenOpen(false)}
        onImageChange={setSelectedImageIndex}
        serviceName={displayedService.name}
      />
    </>
  );
};

export default ViewServicePanel;
