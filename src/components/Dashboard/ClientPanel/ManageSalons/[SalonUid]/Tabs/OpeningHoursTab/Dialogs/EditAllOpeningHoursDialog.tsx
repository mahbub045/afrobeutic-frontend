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
        break_start_time: Yup.string()
          .nullable()
          .test(
            "break-within-hours",
            "Break start time must be within opening hours",
            function (value) {
              const { opening_start_time, opening_end_time, is_closed } =
                this.parent;
              if (is_closed || !value) return true;
              const breakStart = timeToMinutes(value);
              const openStart = timeToMinutes(opening_start_time);
              const openEnd = timeToMinutes(opening_end_time);
              return breakStart >= openStart && breakStart < openEnd;
            },
          ),
        break_end_time: Yup.string()
          .nullable()
          .test(
            "break-within-hours",
            "Break end time must be within opening hours",
            function (value) {
              const { opening_start_time, opening_end_time, is_closed } =
                this.parent;
              if (is_closed || !value) return true;
              const breakEnd = timeToMinutes(value);
              const openStart = timeToMinutes(opening_start_time);
              const openEnd = timeToMinutes(opening_end_time);
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
            opening_start_time: formatTimeForInput(oh.opening_start_time) || "08:00",
            opening_end_time: formatTimeForInput(oh.opening_end_time) || "22:00",
            break_start_time: formatTimeForInput(oh.break_start_time) || "14:00",
            break_end_time: formatTimeForInput(oh.break_end_time) || "16:00",
            is_closed: oh.is_closed || false,
          }))
        : days.map((d) => ({
            day: d,
            opening_start_time: "08:00",
            opening_end_time: "22:00",
            break_start_time: "14:00",
            break_end_time: "16:00",
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
        break_start_time: d.break_start_time
          ? `${d.break_start_time}:00`
          : "00:00:00",
        break_end_time: d.break_end_time
          ? `${d.break_end_time}:00`
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
      <DialogContent className="max-h-[80vh] !max-w-4xl overflow-y-auto shadow-md sm:!max-w-4xl md:!max-w-5xl dark:shadow-gray-600">
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
          {({ values }) => (
            <FormikForm>
              <div className="space-y-3">
                {/* Header row */}
                <div className="text-muted-foreground grid grid-cols-12 gap-2 px-2 py-2 text-xs">
                  <div className="col-span-3">Day</div>
                  <div className="col-span-2">Opening</div>
                  <div className="col-span-2">Closing</div>
                  <div className="col-span-2">Break Start</div>
                  <div className="col-span-2">Break End</div>
                  <div className="col-span-1 text-right">Closed</div>
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
                                  className="grid grid-cols-12 items-center gap-2 rounded-sm border-t px-2 pt-2"
                                >
                                  <div className="col-span-3 text-sm">
                                    {oh.day}
                                  </div>

                                  {/* Opening time */}
                                  <div className="col-span-2">
                                    <div className="flex items-center gap-1">
                                      <Field
                                        as="select"
                                        name={`opening_hours.${idx}.opening_start_time`}
                                        className="w-full focus:ring-0 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                                        style={{
                                          outline: "none",
                                          boxShadow: "none",
                                        }}
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
                                  <div className="col-span-2">
                                    <div className="flex items-center gap-1">
                                      <Field
                                        as="select"
                                        name={`opening_hours.${idx}.opening_end_time`}
                                        className="w-full focus:ring-0 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                                        style={{
                                          outline: "none",
                                          boxShadow: "none",
                                        }}
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

                                  {/* Break start */}
                                  <div className="col-span-2">
                                    <div className="flex items-center gap-1">
                                      <Field
                                        as="select"
                                        name={`opening_hours.${idx}.break_start_time`}
                                        className="w-full focus:ring-0 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                                        style={{
                                          outline: "none",
                                          boxShadow: "none",
                                        }}
                                        disabled={oh.is_closed}
                                      >
                                        <option value="">-</option>
                                        {hours.map((h) =>
                                          minutes.map((m) => (
                                            <option
                                              key={`bs-${h}:${m}`}
                                              value={`${h}:${m}`}
                                            >{`${h}:${m}`}</option>
                                          )),
                                        )}
                                      </Field>
                                    </div>
                                    <ErrorMessage
                                      name={`opening_hours.${idx}.break_start_time`}
                                      component="div"
                                      className="text-danger mt-1 text-xs"
                                    />
                                  </div>

                                  {/* Break end */}
                                  <div className="col-span-2">
                                    <div className="flex items-center gap-1">
                                      <Field
                                        as="select"
                                        name={`opening_hours.${idx}.break_end_time`}
                                        className="w-full focus:ring-0 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                                        style={{
                                          outline: "none",
                                          boxShadow: "none",
                                        }}
                                        disabled={oh.is_closed}
                                      >
                                        <option value="">-</option>
                                        {hours.map((h) =>
                                          minutes.map((m) => (
                                            <option
                                              key={`be-${h}:${m}`}
                                              value={`${h}:${m}`}
                                            >{`${h}:${m}`}</option>
                                          )),
                                        )}
                                      </Field>
                                    </div>
                                    <ErrorMessage
                                      name={`opening_hours.${idx}.break_end_time`}
                                      component="div"
                                      className="text-danger mt-1 text-xs"
                                    />
                                  </div>

                                  {/* Closed toggle */}
                                  <div className="col-span-1 flex justify-end">
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
                                              form.setFieldValue(
                                                `opening_hours.${idx}.break_start_time`,
                                                "00:00",
                                              );
                                              form.setFieldValue(
                                                `opening_hours.${idx}.break_end_time`,
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
                                              if (
                                                !current.break_start_time ||
                                                current.break_start_time ===
                                                  "00:00"
                                              ) {
                                                form.setFieldValue(
                                                  `opening_hours.${idx}.break_start_time`,
                                                  "14:00",
                                                );
                                              }
                                              if (
                                                !current.break_end_time ||
                                                current.break_end_time ===
                                                  "00:00"
                                              ) {
                                                form.setFieldValue(
                                                  `opening_hours.${idx}.break_end_time`,
                                                  "16:00",
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