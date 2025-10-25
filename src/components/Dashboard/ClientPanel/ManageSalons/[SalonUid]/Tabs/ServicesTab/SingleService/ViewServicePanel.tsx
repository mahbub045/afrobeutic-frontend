import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ServiceProps } from "@/Types/ClientPanel/ServicesTypes/ServicesType";
import { ArrowLeft, Edit, Edit2 } from "lucide-react";
import Image from "next/image";

export interface ViewServicePanelProps {
  selectedService: ServiceProps;
  onClose?: () => void; // optional handler to go back to list
}

const ViewServicePanel: React.FC<ViewServicePanelProps> = ({
  selectedService,
  onClose,
}) => {
  if (!selectedService) return null;

  // Normalize images so component can handle both string[] and object[] shapes from the API.
  const rawImages = selectedService.images ?? [];

  const imagesToShow: string[] = (() => {
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
  })();

  const mainImage = imagesToShow.length > 0 ? imagesToShow[0] : undefined;

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
    <Card className="bg-card overflow-hidden rounded-md p-0 shadow-md dark:shadow-gray-600">
      <div className="grid grid-cols-12 gap-0">
        {/* Left: narrow image strip */}
        <div className="bg-muted col-span-4">
          {mainImage ? (
            <div className="relative h-full min-h-[600px] w-full overflow-hidden">
              <Image
                src={mainImage}
                alt={`${selectedService.name}-main`}
                width={450}
                height={600}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="text-muted-foreground flex h-full min-h-[600px] w-full items-center justify-center">
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
  );
};

export default ViewServicePanel;
