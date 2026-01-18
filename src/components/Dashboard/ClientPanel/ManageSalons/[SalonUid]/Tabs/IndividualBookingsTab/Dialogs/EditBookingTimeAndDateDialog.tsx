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
import { EditBookingDialogProps } from "@/Types/ClientPanel/ManageSalonTypes/BookingsTypes/BookingsTypes";
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from "formik";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import Swal from "sweetalert2";

import * as Yup from "yup";

const EditBookingTimeAndDateDialog: React.FC<EditBookingDialogProps> = ({
  isOpen,
  onClose,
  bookingData,
}) => {
  const { salonuid } = useParams();
  const { resolvedTheme } = useTheme();
  const salonUid = Array.isArray(salonuid) ? salonuid[0] : (salonuid ?? "");

  // RTK hooks
  const dispatch = useDispatch();
  const [editBooking, { isLoading }] =
    useUpdateIndividualBookingStatusMutation();

  const hours = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0"),
  );
  const minutes = ["00", "15", "30", "45"];

  // Validation schema
  const validationSchema = Yup.object({
    booking_date: Yup.string().required("Booking date is required"),
    booking_time: Yup.string().required("Booking time is required"),
    notes: Yup.string(),
  });

  const initialValues = {
    booking_date: bookingData?.booking_date || "",
    booking_time: bookingData?.booking_time?.slice(0, 5) || "",
    notes: bookingData?.notes || "",
  };

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting }: FormikHelpers<typeof initialValues>,
  ) => {
    try {
      await editBooking({
        salonUid: salonUid,
        bookingUid: bookingData?.uid || "",
        data: {
          booking_date: values.booking_date,
          booking_time: values.booking_time,
          notes: values.notes,
        },
      }).unwrap();

      // Invalidate IndividualBookings tag to force refetch for useGetIndividualBookingsQuery
      // This ensures any views that rely on Individual bookings will refresh
      try {
        dispatch(baseApi.util.invalidateTags(["IndividualBookings"]));
      } catch (e) {
        // non-blocking if dispatch fails for some reason
        console.warn("Failed to invalidate Bookings tag:", e);
      }

      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Booking Updated Successfully",
        html: `Booking has been updated.`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 2000,
      });

      onClose();
    } catch (error) {
      console.error("Failed to update booking:", error);
      const errorMessage =
        (error as { data?: { message: string } })?.data?.message ||
        "Failed to update booking. Please try again.";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] !max-w-xl overflow-y-auto shadow-md md:!max-w-2xl dark:shadow-gray-600">
        <div className="flex max-h-[95vh] flex-col">
          <div className="pb-6">
            <DialogHeader>
              <DialogTitle className="text-primary">
                Edit Booking Date And Time
              </DialogTitle>
              <DialogDescription>
                Edit the booking details below.
              </DialogDescription>
            </DialogHeader>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, values }) => (
              <Form className="flex flex-1 flex-col">
                <div className="space-y-4">
                  {/* Booking Date and Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="booking_date">
                        Booking Date <span className="text-red-500">*</span>
                      </Label>
                      <Field
                        id="booking_date"
                        name="booking_date"
                        as="input"
                        type="date"
                        value={values.booking_date}
                        required
                      />
                      <ErrorMessage
                        name="booking_date"
                        component="p"
                        className="text-xs text-red-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="booking_time">
                        Booking Time <span className="text-red-500">*</span>
                      </Label>
                      <Field
                        id="booking_time"
                        name="booking_time"
                        as="select"
                        value={values.booking_time}
                        required
                      >
                        <option value="">Select time</option>
                        {hours.map((h) =>
                          minutes.map((m) => (
                            <option
                              key={`${h}:${m}`}
                              value={`${h}:${m}`}
                            >{`${h}:${m}`}</option>
                          )),
                        )}
                      </Field>
                      <ErrorMessage
                        name="booking_time"
                        component="p"
                        className="text-xs text-red-500"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Field
                      id="notes"
                      name="notes"
                      as="textarea"
                      placeholder="Keep additional notes about the booking..."
                      rows={3}
                      className="w-full rounded border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Form Actions */}
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
                        "Update Booking"
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

export default EditBookingTimeAndDateDialog;
