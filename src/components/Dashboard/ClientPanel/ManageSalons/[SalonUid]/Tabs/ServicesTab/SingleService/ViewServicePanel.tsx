import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ServiceProps } from "@/Types/ClientPanel/ServicesTypes/ServicesType";
import { ArrowLeft } from "lucide-react";
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
  // API sometimes returns [{ uid, image, order, is_primary }, ...]
  const rawImages = selectedService.images ?? [];

  const imagesToShow: string[] = (() => {
    if (!Array.isArray(rawImages)) return [];
    const items = rawImages as unknown[];
    if (items.length === 0) return [];
    // If the array already contains plain strings, return as-is
    if (typeof items[0] === "string") return items as string[];

    // Otherwise assume objects with `image`, `order` and `is_primary` fields.
    type ImageObj = { image?: string; order?: number; is_primary?: boolean };
    const objs = items as ImageObj[];
    // Sort so that `is_primary === true` items come first, preserving order via `order`.
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

  return (
    <Card className="bg-card space-y-4 rounded-md p-4 shadow-md dark:shadow-gray-600">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{selectedService.name}</h3>
          <p className="text-muted-foreground text-sm">
            {selectedService.category}
          </p>
        </div>
        <div className="text-right">
          <div className="text-muted-foreground text-sm">Price</div>
          <div className="font-medium">${selectedService.price}</div>
        </div>
      </div>

      {selectedService.description ? (
        <div>
          <h4 className="text-muted-foreground text-sm">Description</h4>
          <div className="whitespace-pre-wrap">
            {selectedService.description}
          </div>
        </div>
      ) : null}

      {imagesToShow && imagesToShow.length > 0 ? (
        <div>
          <h4 className="text-muted-foreground text-sm">Images</h4>
          <div className="flex flex-wrap gap-2">
            {imagesToShow.map((src, idx) =>
              src ? (
                <div
                  key={idx}
                  className="bg-muted h-28 w-28 overflow-hidden rounded"
                >
                  <Image
                    src={src}
                    alt={`${selectedService.name}-img-${idx}`}
                    width={112}
                    height={112}
                    className="object-cover"
                  />
                </div>
              ) : null,
            )}
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-muted-foreground text-sm">Created At</h4>
          <div className="text-xs font-medium">
            {selectedService.created_at ?? "Not Found"}
          </div>
        </div>
        <div>
          <h4 className="text-muted-foreground text-sm">Updated At</h4>
          <div className="text-xs font-medium">
            {selectedService.updated_at ?? "Not Found"}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        {onClose ? (
          <Button
            size="xs"
            variant="outline"
            onClick={onClose}
            className="shadow-d dark:shadow-gray-600"
          >
            <ArrowLeft />
            Back
          </Button>
        ) : null}
      </div>
    </Card>
  );
};

export default ViewServicePanel;
