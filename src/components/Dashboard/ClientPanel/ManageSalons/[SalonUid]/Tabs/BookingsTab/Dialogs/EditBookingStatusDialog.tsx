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
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import Swal from "sweetalert2";

import * as Yup from "yup";

const EditBookingStatusDialog: React.FC<EditBookingStatusDialogProps> = ({
  isOpen,
  onClose,
  bookingData,
  onStatusUpdated,
}) => {
  const { salonuid } = useParams();
  const { resolvedTheme } = useTheme();
  const salonUid = Array.isArray(salonuid) ? salonuid[0] : (salonuid ?? "");
  const dispatch = useDispatch();
  const [editBooking, { isLoading }] = useEditBookingMutation();

  const validationSchema = Yup.object({
    status: Yup.string()
      .oneOf([
        "CONFIRMED",
        "INPROGRESS",
        "RESCHEDULED",
        "COMPLETED",
        "CANCELLED",
        "NO_SHOW",
      ])
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
    status: bookingData?.status || "CONFIRMED",
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

      if (bookingData?.uid) {
        onStatusUpdated?.(values.status, values.cancellation_reason || "");
      }

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
            {({ values, isSubmitting }) => (
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
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="INPROGRESS">In-progress</option>
                      <option value="RESCHEDULED">Rescheduled</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="NO_SHOW">No-Show</option>
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
