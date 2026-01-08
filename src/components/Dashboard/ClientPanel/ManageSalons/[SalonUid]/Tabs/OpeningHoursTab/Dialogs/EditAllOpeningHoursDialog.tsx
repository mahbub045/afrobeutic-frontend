import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useEditSingleSalonMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/SingleSalon/SingleSalonApi";
import { EditDashboardProps } from "@/Types/ClientPanel/ManageSalonTypes/SalonListType";
import {
  ErrorMessage,
  Field,
  FieldArray,
  FieldProps,
  Formik,
  Form as FormikForm,
  FormikHelpers,
  FormikProps,
} from "formik";
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import React from "react";
import { toast } from "react-toastify";

import Swal from "sweetalert2";
import * as Yup from "yup";

interface DayEntry {
  day: string;
  opening_start_time: string; // HH:MM
  opening_end_time: string; // HH:MM
  break_start_time?: string;
  break_end_time?: string;
  is_closed: boolean;
}

interface AllFormValues {
  opening_hours: DayEntry[];
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

const EditAllOpeningHoursDialog: React.FC<EditDashboardProps> = ({
  singleSalonData,
  isOpen,
  onClose,
}) => {
  const { salonuid } = useParams();
  const { resolvedTheme } = useTheme();
  const [editAllOpeningHours, { isLoading }] = useEditSingleSalonMutation();

  const days = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];

  const hours = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0"),
  );
  const minutes = ["00", "15", "30", "45"];

  const schema = Yup.object().shape({
    opening_hours: Yup.array().of(
      Yup.object().shape({
        day: Yup.string().required("Day is required"),
        opening_start_time: Yup.string().when("is_closed", {
          is: false,
          then: (schema) => schema.required("Opening time is required"),
          otherwise: (schema) => schema.notRequired(),
        }),
        opening_end_time: Yup.string()
          .when("is_closed", {
            is: false,
            then: (schema) => schema.required("Closing time is required"),
            otherwise: (schema) => schema.notRequired(),
          })
          .test(
            "is-after-opening",
            "Closing time must be after opening time",
            function (value) {
              const { opening_start_time, is_closed } = this.parent;
              if (is_closed || !opening_start_time || !value) return true;
              return getTimeDifference(opening_start_time, value) > 0;
            },
          ),
        is_closed: Yup.boolean(),
      }),
    ),
  });

  // Helper to convert HH:MM:SS to HH:MM
  const formatTimeForInput = (time: string | undefined): string => {
    if (!time || time === "00:00:00") return "";
    const parts = time.split(":");
    return `${parts[0]}:${parts[1]}`;
  };

  // Build initial values from singleSalonData
  const initialValues: AllFormValues = {
    opening_hours:
      singleSalonData?.opening_hours && singleSalonData.opening_hours.length > 0
        ? singleSalonData?.opening_hours.map((oh) => ({
            day: oh.day,
            opening_start_time:
              formatTimeForInput(oh.opening_start_time) || "08:00",
            opening_end_time:
              formatTimeForInput(oh.opening_end_time) || "22:00",
            is_closed: oh.is_closed || false,
          }))
        : days.map((d) => ({
            day: d,
            opening_start_time: "08:00",
            opening_end_time: "22:00",
            is_closed: false,
          })),
  };

  const handleSubmit = async (
    values: AllFormValues,
    { setSubmitting }: FormikHelpers<AllFormValues>,
  ) => {
    if (!singleSalonData) return;
    setSubmitting(true);
    try {
      const updated = values.opening_hours.map((d) => ({
        day: d.day,
        opening_start_time: d.opening_start_time
          ? `${d.opening_start_time}:00`
          : "00:00:00",
        opening_end_time: d.opening_end_time
          ? `${d.opening_end_time}:00`
          : "00:00:00",
        is_closed: !!d.is_closed,
      }));

      await editAllOpeningHours({
        salonUid: salonuid as string,
        salonData: { opening_hours: updated },
      }).unwrap();

      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Updated",
        html: `Opening hours updated for all days`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 2000,
      });
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update opening hours. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] !max-w-xl overflow-y-auto shadow-md sm:!max-w-2xl md:!max-w-3xl dark:shadow-gray-600">
        <DialogHeader>
          <DialogTitle className="text-primary">
            Edit All Opening Hours
          </DialogTitle>
          <DialogDescription className="text-xs">
            Edit the opening hours for all days of the week.
          </DialogDescription>
        </DialogHeader>

        <Formik<AllFormValues>
          enableReinitialize
          initialValues={initialValues}
          validationSchema={schema}
          onSubmit={handleSubmit}
        >
          {({}) => (
            <FormikForm>
              <div className="space-y-3">
                {/* Header row */}
                <div className="text-muted-foreground bg-muted/50 grid grid-cols-12 gap-2 border-b px-4 py-3 text-xs font-semibold tracking-wide uppercase">
                  <div className="col-span-2">Day</div>
                  <div className="col-span-4">Opening</div>
                  <div className="col-span-4">Closing</div>
                  <div className="col-span-2 text-center">Closed</div>
                </div>

                <FieldArray name="opening_hours">
                  {() => (
                    <div className="space-y-3">
                      <Field name="opening_hours">
                        {({ form }: { form: FormikProps<AllFormValues> }) => (
                          <>
                            {form.values.opening_hours.map(
                              (oh: DayEntry, idx: number) => (
                                <div
                                  key={oh.day || idx}
                                  className="hover:bg-muted/30 grid grid-cols-12 items-center gap-2 border-b px-4 py-4 transition-colors last:border-b-0"
                                >
                                  <div className="text-foreground col-span-2 text-sm font-medium">
                                    {oh.day}
                                  </div>

                                  {/* Opening time */}
                                  <div className="col-span-4">
                                    <div className="flex items-center gap-1">
                                      <Field
                                        as="select"
                                        name={`opening_hours.${idx}.opening_start_time`}
                                        className="border-input bg-background ring-offset-background hover:border-primary/50 focus-visible:ring-primary w-full rounded-md border px-3 py-2 text-sm transition-all focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        disabled={oh.is_closed}
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
                                    </div>
                                    <ErrorMessage
                                      name={`opening_hours.${idx}.opening_start_time`}
                                      component="div"
                                      className="text-danger mt-1 text-xs"
                                    />
                                  </div>

                                  {/* Closing time */}
                                  <div className="col-span-4">
                                    <div className="flex items-center gap-1">
                                      <Field
                                        as="select"
                                        name={`opening_hours.${idx}.opening_end_time`}
                                        className="border-input bg-background ring-offset-background hover:border-primary/50 focus-visible:ring-primary w-full rounded-md border px-3 py-2 text-sm transition-all focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        disabled={oh.is_closed}
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
                                    </div>
                                    <ErrorMessage
                                      name={`opening_hours.${idx}.opening_end_time`}
                                      component="div"
                                      className="text-danger mt-1 text-xs"
                                    />
                                  </div>

                                  {/* Closed toggle */}
                                  <div className="col-span-2 flex justify-center">
                                    <Field
                                      name={`opening_hours.${idx}.is_closed`}
                                    >
                                      {({ field, form }: FieldProps) => (
                                        <Switch
                                          checked={Boolean(field.value)}
                                          onCheckedChange={(v: boolean) => {
                                            form.setFieldValue(field.name, v);

                                            if (v) {
                                              // When marking closed, set times to 00:00
                                              form.setFieldValue(
                                                `opening_hours.${idx}.opening_start_time`,
                                                "00:00",
                                              );
                                              form.setFieldValue(
                                                `opening_hours.${idx}.opening_end_time`,
                                                "00:00",
                                              );
                                            } else {
                                              // When reopening, restore defaults
                                              const current =
                                                form.values.opening_hours[idx];
                                              if (
                                                !current.opening_start_time ||
                                                current.opening_start_time ===
                                                  "00:00"
                                              ) {
                                                form.setFieldValue(
                                                  `opening_hours.${idx}.opening_start_time`,
                                                  "08:00",
                                                );
                                              }
                                              if (
                                                !current.opening_end_time ||
                                                current.opening_end_time ===
                                                  "00:00"
                                              ) {
                                                form.setFieldValue(
                                                  `opening_hours.${idx}.opening_end_time`,
                                                  "22:00",
                                                );
                                              }
                                            }
                                          }}
                                        />
                                      )}
                                    </Field>
                                  </div>
                                </div>
                              ),
                            )}
                          </>
                        )}
                      </Field>
                    </div>
                  )}
                </FieldArray>

                <div className="flex justify-end gap-3 pt-4">
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

export default EditAllOpeningHoursDialog;
