import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEditSingleSalonMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/SingleSalon/SingleSalonApi";
import {
  EditDashboardProps,
  OpeningHour,
} from "@/Types/ClientPanel/ManageSalonTypes/SalonListType";
import {
  ErrorMessage,
  Field,
  FieldProps,
  Formik,
  Form as FormikForm,
  FormikHelpers,
} from "formik";
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import React from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as Yup from "yup";

interface EditSingleProps extends EditDashboardProps {
  selectedOpening?: OpeningHour | null;
}

interface SingleFormValues {
  opening_time: string;
  closing_time: string;
  is_closed: boolean;
}

// Helper function to convert time string (HH:MM) to minutes for comparison
const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

// Helper function to calculate duration between two times in minutes
const getTimeDifference = (startTime: string, endTime: string): number => {
  return timeToMinutes(endTime) - timeToMinutes(startTime);
};

const EditSingleOpeningHoursDialog: React.FC<EditSingleProps> = ({
  singleSalonData,
  isOpen,
  onClose,
  selectedOpening,
}) => {
  const { salonuid } = useParams();
  const { resolvedTheme } = useTheme();
  const [editSingleOpeningHour, { isLoading }] = useEditSingleSalonMutation();

  const hours = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0"),
  );
  const minutes = ["00", "15", "30", "45"];

  const initialValues: SingleFormValues = {
    opening_time: selectedOpening?.opening_time?.slice(0, 5) || "08:00",
    closing_time: selectedOpening?.closing_time?.slice(0, 5) || "17:00",
    is_closed: !!selectedOpening?.is_closed,
  };

  const schema = Yup.object().shape({
    opening_time: Yup.string().when("is_closed", {
      is: false,
      then: (schema) => schema.required("Opening time is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    closing_time: Yup.string()
      .when("is_closed", {
        is: false,
        then: (schema) => schema.required("Closing time is required"),
        otherwise: (schema) => schema.notRequired(),
      })
      .test(
        "is-after-opening",
        "Closing time must be after opening time",
        function (value) {
          const { opening_time, is_closed } = this.parent;
          if (is_closed || !opening_time || !value) return true;
          return getTimeDifference(opening_time, value) > 0;
        },
      ),
    break_start_time: Yup.string()
      .nullable()
      .test(
        "break-within-hours",
        "Break start time must be within opening hours",
        function (value) {
          const { opening_time, closing_time, is_closed } = this.parent;
          if (is_closed || !value) return true;
          const breakStart = timeToMinutes(value);
          const openStart = timeToMinutes(opening_time);
          const openEnd = timeToMinutes(closing_time);
          return breakStart >= openStart && breakStart < openEnd;
        },
      ),
    break_end_time: Yup.string()
      .nullable()
      .test(
        "break-within-hours",
        "Break end time must be within opening hours",
        function (value) {
          const { opening_time, closing_time, is_closed } = this.parent;
          if (is_closed || !value) return true;
          const breakEnd = timeToMinutes(value);
          const openStart = timeToMinutes(opening_time);
          const openEnd = timeToMinutes(closing_time);
          return breakEnd > openStart && breakEnd <= openEnd;
        },
      )
      .test(
        "break-end-after-start",
        "Break end time must be after break start time",
        function (value) {
          const { break_start_time, is_closed } = this.parent;
          if (is_closed || !value || !break_start_time) return true;
          return getTimeDifference(break_start_time, value) > 0;
        },
      )
      .test(
        "break-duration",
        "Break duration cannot exceed 2 hours",
        function (value) {
          const { break_start_time, is_closed } = this.parent;
          if (is_closed || !value || !break_start_time) return true;
          const duration = getTimeDifference(break_start_time, value);
          return duration <= 120; // 120 minutes = 2 hours
        },
      ),
    is_closed: Yup.boolean(),
  });

  const handleSubmit = async (
    values: SingleFormValues,
    { setSubmitting }: FormikHelpers<SingleFormValues>,
  ) => {
    if (!singleSalonData) return;
    setSubmitting(true);
    try {
      // Map existing opening_hours and update the selected one
      const updated = (singleSalonData.opening_hours || []).map((h) => {
        if (selectedOpening && h.uid === selectedOpening.uid) {
          return {
            ...h,
            opening_time: values.opening_time
              ? `${values.opening_time}:00`
              : "00:00:00",
            closing_time: values.closing_time
              ? `${values.closing_time}:00`
              : "00:00:00",
            is_closed: !!values.is_closed,
          } as OpeningHour;
        }
        return h;
      });

      await editSingleOpeningHour({
        salonUid: salonuid as string,
        salonData: { opening_hours: updated },
      }).unwrap();

      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Updated",
        html: `Opening hour updated successfully`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 2000,
      });
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update opening hour. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md shadow-md dark:shadow-gray-600">
        <DialogHeader>
          <DialogTitle className="text-primary">Edit Opening Hour</DialogTitle>
          <DialogDescription className="text-xs">
            Update timings for {selectedOpening?.day}
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={schema}
          onSubmit={handleSubmit}
        >
          {({ values }) => (
            <FormikForm>
              <div className="grid gap-4">
                <div>
                  <Label className="mb-2">
                    Opening Start<span className="text-danger">*</span>
                  </Label>
                  <Field
                    as="select"
                    name="opening_time"
                    className="w-full"
                    disabled={values.is_closed}
                  >
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
                    name="opening_time"
                    component="div"
                    className="text-danger mt-1 text-xs"
                  />
                </div>

                <div>
                  <Label className="mb-2">
                    Opening End<span className="text-danger">*</span>
                  </Label>
                  <Field
                    as="select"
                    name="closing_time"
                    className="w-full"
                    disabled={values.is_closed}
                  >
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
                    name="closing_time"
                    component="div"
                    className="text-danger mt-1 text-xs"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Field name="is_closed">
                    {({ field, form }: FieldProps) => (
                      <Switch
                        checked={Boolean(field.value)}
                        onCheckedChange={(v: boolean) => {
                          form.setFieldValue(field.name, v);

                          if (v) {
                            // When marking closed, set times to 00:00
                            form.setFieldValue("opening_time", "00:00");
                            form.setFieldValue("closing_time", "00:00");
                          } else {
                            // When reopening, restore defaults
                            if (
                              !form.values.opening_time ||
                              form.values.opening_time === "00:00"
                            ) {
                              form.setFieldValue("opening_time", "08:00");
                            }
                            if (
                              !form.values.closing_time ||
                              form.values.closing_time === "00:00"
                            ) {
                              form.setFieldValue("closing_time", "22:00");
                            }
                            {
                              form.setFieldValue("break_end_time", "16:00");
                            }
                          }
                        }}
                      />
                    )}
                  </Field>
                  <Label>Mark day as closed</Label>
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="w-40 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </FormikForm>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default EditSingleOpeningHoursDialog;
