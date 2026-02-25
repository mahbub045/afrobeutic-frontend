import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { baseApi } from "@/Redux/Api/BaseApi";
import { useUpdateIndividualBookingStatusMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/IndividualBookings/IndividualBookingsApi";
import { AddLookBookImageDialogProps } from "@/Types/ClientPanel/ManageSalonTypes/IndividualBookingTypes/IndividualBookingTypes";
import { Upload, X } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import Swal from "sweetalert2";

const AddLookBookImageDialog: React.FC<AddLookBookImageDialogProps> = ({
  isOpen,
  onOpenChange,
  bookingUid,
  onSuccess,
}) => {
  const { salonuid } = useParams();
  const salonUid = Array.isArray(salonuid) ? salonuid[0] : (salonuid ?? "");
  const { resolvedTheme } = useTheme();
  const dispatch = useDispatch();

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const [editBooking, { isLoading }] =
    useUpdateIndividualBookingStatusMutation();

  const MAX_IMAGES = 3;
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const remainingSlots = MAX_IMAGES - selectedImages.length;

    if (newFiles.length > remainingSlots) {
      Swal.fire({
        icon: "warning",
        title: "Too many images",
        text: `You can only upload ${MAX_IMAGES} images maximum. You have ${remainingSlots} slot(s) remaining.`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
      });
      return;
    }

    // Validate file types
    const validFiles = newFiles.filter((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not a valid image format`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Add new files
    const updatedFiles = [...selectedImages, ...validFiles];
    setSelectedImages(updatedFiles);

    // Create preview URLs
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviews]);

    // Reset input
    e.currentTarget.value = "";
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);

    // Revoke the removed URL
    URL.revokeObjectURL(previewUrls[index]);

    setSelectedImages(newImages);
    setPreviewUrls(newPreviews);
  };

  const handleUpload = async () => {
    if (selectedImages.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No images selected",
        text: "Please select at least one image to upload.",
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
      });
      return;
    }

    if (!bookingUid) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Booking ID is missing. Please try again.",
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
      });
      return;
    }

    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      selectedImages.forEach((image) => {
        formData.append("images", image);
      });

      await editBooking({
        salonUid,
        bookingUid,
        data: formData,
      }).unwrap();

      try {
        dispatch(
          baseApi.util.invalidateTags(["IndividualBookings", "LookBook"]),
        );
      } catch (e) {
        console.warn(e);
      }

      Swal.fire({
        icon: "success",
        title: "Images uploaded",
        text: `${selectedImages.length} image(s) uploaded successfully.`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        iconColor: "#037375",
        confirmButtonColor: "#037375",
        timer: 2000,
      });

      // Clean up preview URLs
      previewUrls.forEach((url) => URL.revokeObjectURL(url));

      setSelectedImages([]);
      setPreviewUrls([]);
      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to upload images:", error);
      Swal.fire({
        icon: "error",
        title: "Upload failed",
        text: "Failed to upload images. Please try again.",
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
      });
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Clean up preview URLs
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      setSelectedImages([]);
      setPreviewUrls([]);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[80vh] !max-w-2xl overflow-y-auto shadow-md">
        <DialogHeader>
          <DialogTitle className="text-primary">
            Upload Look Book Images
          </DialogTitle>
          <DialogDescription>
            Upload up to 3 images for this booking. Supported formats: JPEG,
            PNG, WebP.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Area */}
          <div className="space-y-2">
            <Label>
              Images ({selectedImages.length}/{MAX_IMAGES})
            </Label>
            <div className="relative">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageSelect}
                disabled={selectedImages.length >= MAX_IMAGES || isLoading}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                  selectedImages.length >= MAX_IMAGES
                    ? "cursor-not-allowed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-900"
                    : "border-primary hover:bg-primary/5 dark:hover:bg-primary/10 cursor-pointer"
                }`}
              >
                <Upload className="text-primary mb-2 h-6 w-6" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedImages.length >= MAX_IMAGES
                    ? "Maximum 3 images reached"
                    : `You can upload ${MAX_IMAGES - selectedImages.length} more image(s)`}
                </p>
              </label>
            </div>
          </div>

          {/* Image Previews */}
          {previewUrls.length > 0 && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="grid grid-cols-3 gap-2">
                {previewUrls.map((url, index) => (
                  <div
                    key={index}
                    className="group relative aspect-square overflow-hidden rounded-lg border"
                  >
                    <Image
                      src={url}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      disabled={isLoading}
                      className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed"
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isLoading || selectedImages.length === 0}
            >
              {isLoading
                ? "Uploading..."
                : `Upload ${selectedImages.length} Image(s)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddLookBookImageDialog;
