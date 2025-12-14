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
import { useEditBookingMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/Bookings/BookingsApi";
import { EditBookingStatusDialogProps } from "@/Types/ClientPanel/ManageSalonTypes/BookingsTypes/BookingsTypes";
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from "formik";
import { Loader2, Upload, X } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import Swal from "sweetalert2";

import * as Yup from "yup";

const EditBookingStatusDialog: React.FC<EditBookingStatusDialogProps> = ({
  isOpen,
  onClose,
  bookingData,
}) => {
  const { salonuid } = useParams();
  const { resolvedTheme } = useTheme();
  const salonUid = Array.isArray(salonuid) ? salonuid[0] : (salonuid ?? "");
  const dispatch = useDispatch();
  const [editBooking, { isLoading }] = useEditBookingMutation();

  const [imagePreviews, setImagePreviews] = useState<string[]>(
    bookingData?.images || [],
  );

  const validationSchema = Yup.object({
    status: Yup.string()
      .oneOf(["PLACED", "INPROGRESS", "RESCHEDULED", "COMPLETED", "CANCELLED"])
      .required("Status is required"),
    cancellation_reason: Yup.string().when("status", {
      is: "CANCELLED",
      then: (schema) =>
        schema.required(
          "Cancellation reason is required when booking is cancelled.",
        ),
      otherwise: (schema) => schema.optional(),
    }),

    images: Yup.array().max(3, "Maximum 3 images allowed"),
  });

  const initialValues = {
    status: bookingData?.status || "PLACED",
    cancellation_reason: bookingData?.cancellation_reason || "",
    images: [] as File[],
  };

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting }: FormikHelpers<typeof initialValues>,
  ) => {
    try {
      if (!bookingData?.uid || !salonUid) {
        toast.error("Missing booking information.");
        return;
      }

      const basePayload: {
        status: string;
        notes?: string;
        cancellation_reason?: string;
      } = {
        status: values.status,
      };

      if (values.cancellation_reason) {
        basePayload.cancellation_reason = values.cancellation_reason;
      }

      let requestBody: FormData | typeof basePayload = basePayload;

      if (values.images.length > 0) {
        const formData = new FormData();

        formData.append("status", basePayload.status);

        if (basePayload.notes) {
          formData.append("notes", basePayload.notes);
        }

        if (basePayload.cancellation_reason) {
          formData.append(
            "cancellation_reason",
            basePayload.cancellation_reason,
          );
        }

        values.images.forEach((image) => {
          formData.append("images", image);
        });

        requestBody = formData;
      }

      await editBooking({
        salonUid,
        bookingUid: bookingData.uid,
        data: requestBody,
      }).unwrap();

      try {
        dispatch(baseApi.util.invalidateTags(["ChairsBooking"]));
      } catch (e) {
        console.warn("Failed to invalidate ChairsBooking tag:", e);
      }

      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Booking Status Updated",
        html: `Booking status has been updated.`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 2000,
      });

      onClose();
    } catch (error) {
      console.error("Failed to update booking status:", error);
      const errorMessage =
        (error as { data?: { message: string } })?.data?.message ||
        "Failed to update booking status. Please try again.";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (
      field: string,
      value: File[],
      shouldValidate?: boolean,
    ) => void,
    currentImages: File[],
  ) => {
    const files = e.target.files;
    if (!files) return;

    const availableSlots = 3 - currentImages.length;

    if (files.length > availableSlots) {
      return;
    }

    const newImages = Array.from(files);
    setFieldValue("images", [...currentImages, ...newImages]);

    const newPreviews = newImages.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (
    index: number,
    setFieldValue: (
      field: string,
      value: File[],
      shouldValidate?: boolean,
    ) => void,
    images: File[],
  ) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setFieldValue("images", newImages);
    setImagePreviews(newPreviews);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] !max-w-lg overflow-y-auto shadow-md sm:!max-w-lg md:!max-w-xl dark:shadow-gray-600">
        <div className="flex max-h-[95vh] flex-col">
          <div className="pb-6">
            <DialogHeader>
              <DialogTitle className="text-primary">
                Edit Booking Status
              </DialogTitle>
              <DialogDescription>Edit the booking status.</DialogDescription>
            </DialogHeader>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, setFieldValue, isSubmitting }) => (
              <Form className="flex flex-1 flex-col">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">
                      Status <span className="text-red-500">*</span>
                    </Label>
                    <Field id="status" name="status" as="select" required>
                      <option value="" disabled>
                        Select status
                      </option>
                      <option value="PLACED">Placed</option>
                      <option value="INPROGRESS">In-progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="RESCHEDULED">Rescheduled</option>
                      <option value="CANCELLED">Cancelled</option>
                    </Field>
                    <ErrorMessage
                      name="status"
                      component="p"
                      className="text-xs text-red-500"
                    />
                  </div>

                  {values.status === "CANCELLED" && (
                    <div className="space-y-2">
                      <Label htmlFor="cancellation_reason">
                        Cancellation Reason{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Field
                        id="cancellation_reason"
                        name="cancellation_reason"
                        as="textarea"
                        placeholder="Please provide the reason for cancellation..."
                        rows={3}
                        required
                      />
                      <ErrorMessage
                        name="cancellation_reason"
                        component="p"
                        className="text-xs text-red-500"
                      />
                    </div>
                  )}

                  {values.status === "COMPLETED" && (
                    <div className="space-y-2">
                      <Label htmlFor="images">Images (Max 3)</Label>
                      <div className="space-y-3">
                        {imagePreviews.length < 3 && (
                          <div className="flex items-center gap-2">
                            <input
                              id="status-images"
                              name="images"
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) =>
                                handleImageChange(
                                  e,
                                  setFieldValue,
                                  values.images,
                                )
                              }
                              className="hidden"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                document
                                  .getElementById("status-images")
                                  ?.click()
                              }
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Images ({imagePreviews.length}/3)
                            </Button>
                          </div>
                        )}
                        <ErrorMessage
                          name="images"
                          component="p"
                          className="text-xs text-red-500"
                        />
                        {imagePreviews.length > 0 && (
                          <div className="grid grid-cols-3 gap-2">
                            {imagePreviews.map((preview, index) => (
                              <div key={index} className="relative">
                                <Image
                                  src={preview}
                                  alt={`Preview ${index + 1}`}
                                  width={96}
                                  height={96}
                                  className="h-24 w-full rounded-md object-cover"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute -top-2 -right-2 h-6 w-6"
                                  onClick={() =>
                                    removeImage(
                                      index,
                                      setFieldValue,
                                      values.images,
                                    )
                                  }
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting || isLoading}>
                      {isSubmitting || isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Status"
                      )}
                    </Button>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditBookingStatusDialog;
