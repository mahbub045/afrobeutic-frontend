"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useEditLookBookMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/LookBook/LookBookApi";
import { EditLookBookImageDialogProps } from "@/Types/ClientPanel/ManageSalonTypes/LookBookTypes/LookBookType";
import { X } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const EditLookBookImageDialog: React.FC<EditLookBookImageDialogProps> = ({
  isOpen,
  onClose,
  selectedLookBook,
  onEditSuccess,
}) => {
  const { salonuid } = useParams();
  const { resolvedTheme } = useTheme();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const MAX_IMAGES = 3;

  // RTK Hooks
  const [editLookBook, { isLoading: isEditingLookBook }] =
    useEditLookBookMutation();

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedImages([]);
    }
  }, [isOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const remainingSlots = MAX_IMAGES - selectedImages.length;

    if (newFiles.length > remainingSlots) {
      toast.warning(
        `You can only add ${remainingSlots} more image(s). Max is ${MAX_IMAGES}.`,
      );
      const limitedFiles = newFiles.slice(0, remainingSlots);
      setSelectedImages([...selectedImages, ...limitedFiles]);
    } else {
      setSelectedImages([...selectedImages, ...newFiles]);
    }

    // Reset input
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      if (selectedImages.length === 0) {
        toast.info("Please select at least one image.");
        return;
      }

      if (!selectedLookBook) {
        toast.error("No lookbook selected.");
        return;
      }

      const formData = new FormData();
      selectedImages.forEach((file) => {
        formData.append("images", file);
      });

      const salonUid = Array.isArray(salonuid) ? salonuid[0] : salonuid;

      await editLookBook({
        salonUid,
        lookBookUid: selectedLookBook.uid,
        lookBookData: formData,
      }).unwrap();

      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Updated successfully",
        html: `Successfully updated images for <b class="text-primary">${selectedLookBook.customer.first_name} ${selectedLookBook.customer.last_name}</b>`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 2000,
      });

      onEditSuccess?.();
      onClose();
    } catch (error: unknown) {
      const errData: unknown =
        error && typeof error === "object" && "data" in error
          ? (error as { data?: unknown }).data
          : undefined;

      const generic = (() => {
        if (errData && typeof errData === "object") {
          const obj = errData as Record<string, unknown>;
          if (typeof obj.detail === "string") return obj.detail;
          if (typeof obj.message === "string") return obj.message;
        }
        if (error instanceof Error) return error.message;
        return "Failed to update images.";
      })();
      toast.error(generic);
      console.error("Edit LookBook Images Error:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="shadow-md sm:max-w-lg dark:shadow-gray-700">
        <DialogHeader>
          <DialogTitle className="text-primary">
            Edit LookBook Images
          </DialogTitle>
          <DialogDescription>
            Upload up to {MAX_IMAGES} images for this lookbook.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="lookbook-images" className="mb-2 block">
              Select Images (Max {MAX_IMAGES})
            </Label>
            <input
              id="lookbook-images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={selectedImages.length >= MAX_IMAGES}
              className="block w-full cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-[#181818]"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {selectedImages.length} / {MAX_IMAGES} images selected
            </p>
          </div>

          {/* Image Preview Grid */}
          {selectedImages.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {selectedImages.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="relative h-24 w-24 overflow-hidden rounded-md border"
                >
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={`preview-${index}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isEditingLookBook}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isEditingLookBook || selectedImages.length === 0}
              onClick={handleSubmit}
            >
              {isEditingLookBook ? "Uploading..." : "Upload Images"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditLookBookImageDialog;
