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
import {
  useDeleteLookBookImageMutation,
  useEditLookBookMutation,
} from "@/Redux/Reducers/ClientPanel/ManageSalons/LookBook/LookBookApi";
import { EditLookBookImageDialogProps } from "@/Types/ClientPanel/ManageSalonTypes/LookBookTypes/LookBookType";
import { Trash2, X } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const dialogContentRef = useRef<HTMLDivElement | null>(null);

  type NormalizedLookBookImage = { uid?: string; url: string };

  const truncate = (value: string, max = 500) => {
    if (value.length <= max) return value;
    return `${value.slice(0, max)}...`;
  };

  const formatApiError = (error: unknown, fallback: string) => {
    if (!error) return fallback;

    // RTK Query usually returns either:
    // - { status: number | string, data?: unknown, error?: string }
    // - SerializedError { message?: string }
    const errObj =
      typeof error === "object" && error !== null
        ? (error as Record<string, unknown>)
        : null;

    const data = errObj?.data;
    const plainError = errObj?.error;

    const fromData = (payload: unknown): string | null => {
      if (!payload) return null;
      if (typeof payload === "string") return payload;

      if (typeof payload === "object") {
        const obj = payload as Record<string, unknown>;

        const direct =
          (typeof obj.detail === "string" && obj.detail) ||
          (typeof obj.message === "string" && obj.message) ||
          (typeof obj.error === "string" && obj.error) ||
          (typeof obj.title === "string" && obj.title) ||
          null;
        if (direct) return direct;

        // DRF-ish field errors: { field: ["msg"], non_field_errors: [...] }
        const errors = obj.errors ?? obj;
        if (errors && typeof errors === "object") {
          const errsObj = errors as Record<string, unknown>;

          const picked: string[] = [];
          for (const [key, val] of Object.entries(errsObj)) {
            if (!val) continue;
            if (typeof val === "string") {
              picked.push(key === "non_field_errors" ? val : `${key}: ${val}`);
              continue;
            }
            if (Array.isArray(val)) {
              const msg = val.filter((x) => typeof x === "string").join(", ");
              if (msg)
                picked.push(
                  key === "non_field_errors" ? msg : `${key}: ${msg}`,
                );
              continue;
            }
          }

          if (picked.length > 0) return picked.join("\n");
        }

        try {
          return JSON.stringify(payload);
        } catch {
          return null;
        }
      }

      return null;
    };

    const messageFromData = fromData(data);
    if (messageFromData) {
      return truncate(messageFromData);
    }

    if (typeof plainError === "string" && plainError)
      return truncate(plainError);
    if (error instanceof Error && error.message) return truncate(error.message);
    if (errObj && typeof errObj.message === "string" && errObj.message)
      return truncate(errObj.message);

    return fallback;
  };

  // RTK Hooks
  const [editLookBook, { isLoading: isEditingLookBook }] =
    useEditLookBookMutation();
  const [deleteLookBookImage, { isLoading: isDeletingImage }] =
    useDeleteLookBookImageMutation();

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedImages([]);
    }
  }, [isOpen]);

  const salonUid = useMemo(() => {
    const id = Array.isArray(salonuid) ? salonuid[0] : salonuid;
    return id ?? "";
  }, [salonuid]);

  const existingImages: NormalizedLookBookImage[] = useMemo(() => {
    const raw = (selectedLookBook as unknown as { images?: unknown })?.images;
    if (!raw || !Array.isArray(raw)) return [];

    // Most common shape: string[] (URLs)
    if (raw.length > 0 && typeof raw[0] === "string") {
      return (raw as string[]).filter(Boolean).map((url) => ({ url }));
    }

    // Alternative shape: { uid, image }[] (or similar)
    const mapped: Array<NormalizedLookBookImage | null> = (
      raw as unknown[]
    ).map((item): NormalizedLookBookImage | null => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;

      const uid =
        (typeof obj.uid === "string" && obj.uid) ||
        (typeof obj.image_uid === "string" && obj.image_uid) ||
        (typeof obj.lookbook_image_uid === "string" &&
          obj.lookbook_image_uid) ||
        undefined;

      const url =
        (typeof obj.image === "string" && obj.image) ||
        (typeof obj.url === "string" && obj.url) ||
        (typeof obj.src === "string" && obj.src) ||
        "";

      if (!url) return null;
      return { uid, url };
    });

    return mapped.filter((x): x is NormalizedLookBookImage => x !== null);
  }, [selectedLookBook]);

  const selectedImagePreviews = useMemo(() => {
    return selectedImages.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [selectedImages]);

  useEffect(() => {
    return () => {
      selectedImagePreviews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [selectedImagePreviews]);

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
      toast.error(formatApiError(error, "Failed to update images."));
      console.error("Edit LookBook Images Error:", error);
    }
  };

  const handleDeleteExistingImage = async (img: NormalizedLookBookImage) => {
    try {
      if (!selectedLookBook) {
        toast.error("No lookbook selected.");
        return;
      }

      if (!img.uid) {
        toast.error("This image cannot be deleted because it has no image id.");
        return;
      }

      const result = await Swal.fire({
        icon: "warning",
        title: "Delete image?",
        html: `This will permanently delete this lookbook image for <b class="text-primary">${selectedLookBook.customer.first_name} ${selectedLookBook.customer.last_name}</b>.`,
        showCancelButton: true,
        confirmButtonText: "Yes, delete",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#d33",
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        target: dialogContentRef.current ?? undefined,
        showLoaderOnConfirm: true,
        allowOutsideClick: () => !Swal.isLoading(),
        preConfirm: async () => {
          try {
            await deleteLookBookImage({
              salonUid,
              lookBookUid: selectedLookBook.uid,
              imageUid: img.uid,
            }).unwrap();
            return true;
          } catch (err: unknown) {
            const msg = formatApiError(err, "Failed to delete image.");
            toast.error(msg);
            Swal.showValidationMessage(msg);
            throw err;
          }
        },
      });

      if (!result.isConfirmed) return;

      toast.success("Image deleted successfully.");

      onEditSuccess?.();
    } catch (error: unknown) {
      toast.error(formatApiError(error, "Failed to delete image."));
      console.error("Delete LookBook Image Error:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        ref={dialogContentRef}
        className="shadow-md sm:max-w-lg dark:shadow-gray-700"
      >
        <DialogHeader>
          <DialogTitle className="text-primary">
            Edit LookBook Images
          </DialogTitle>
          <DialogDescription>
            Upload up to {MAX_IMAGES} images for this lookbook.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Current Images</div>
              <div className="grid grid-cols-3 gap-3">
                {existingImages.map((img, index) => (
                  <div
                    key={`${img.url}-${index}`}
                    className="relative h-24 w-24 overflow-hidden rounded-md border"
                  >
                    <Image
                      src={img.url}
                      alt={`existing-${index}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      aria-label="Delete image"
                      onClick={() => handleDeleteExistingImage(img)}
                      disabled={isDeletingImage}
                      className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-60"
                      title={img.uid ? "Delete" : "Cannot delete (missing id)"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
              {selectedImagePreviews.map(({ file, url }, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="relative h-24 w-24 overflow-hidden rounded-md border"
                >
                  <Image
                    src={url}
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
              disabled={isEditingLookBook || isDeletingImage}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isEditingLookBook ||
                isDeletingImage ||
                selectedImages.length === 0
              }
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
