"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatUnderscoredLabel } from "@/lib/utils";
import { useGetEmployeesDataQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Employees/EmployeesApi";
import { useEditServiceMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/Services/ServicesApi";
import {
  Employee,
  ServiceProps,
} from "@/Types/ClientPanel/ManageSalonTypes/ServicesTypes/ServicesType";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as Yup from "yup";

export interface EditServiceMoreInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedService: ServiceProps;
  onEditSuccess?: () => void;
}

const AVAILABLE_SLOTS = [
  "MORNING",
  "AFTERNOON",
  "EVENING",
  "AFTER_EVENING",
  "ANYTIME",
];

const GENDER_OPTIONS = ["UNISEX", "MALE", "FEMALE"];

const EditServiceMoreInfoDialog: React.FC<EditServiceMoreInfoDialogProps> = ({
  isOpen,
  onClose,
  selectedService,
  onEditSuccess,
}) => {
  const { salonuid } = useParams();
  const salonUid = Array.isArray(salonuid) ? salonuid[0] : (salonuid ?? "");
  const { resolvedTheme } = useTheme();

  //   RTK Hooks
  const { data: employeesData, isLoading: isLoadingEmployees } =
    useGetEmployeesDataQuery({ salonUid });
  const [editService, { isLoading: isEditingService }] =
    useEditServiceMutation();

  // normalize assigned employees to array of uids for the form
  const initialAssigned: string[] = (() => {
    const raw = (selectedService as unknown as { assign_employees?: unknown })
      ?.assign_employees;
    if (!raw) return [];
    if (Array.isArray(raw)) {
      if (raw.length === 0) return [];
      // if entries are objects
      if (typeof raw[0] === "object") {
        return (raw as Employee[])
          .map((e) => e?.uid)
          .filter(Boolean) as string[];
      }
      // assume array of strings
      return raw as string[];
    }
    return [];
  })();

  interface MoreInfoFormValues {
    service_duration: string;
    available_time_slots: string[];
    gender_specific: string;
    discount_percentage: number;
    assign_employees: string[];
  }

  // duration format: HH:MM or HH:MM:SS (allow single-digit hours)
  const durationRegex = /^([0-9]{1,2}):[0-5][0-9](:[0-5][0-9])?$/;

  const validationSchema = Yup.object().shape({
    service_duration: Yup.string()
      .matches(durationRegex, "Duration must be in HH:MM or HH:MM:SS format")
      .required("Service duration is required"),
    available_time_slots: Yup.array().of(Yup.string()),
    gender_specific: Yup.string().oneOf(GENDER_OPTIONS),
    discount_percentage: Yup.number()
      .min(0, "Discount cannot be negative")
      .max(100, "Discount cannot be more than 100")
      .typeError("Discount must be a number"),
    assign_employees: Yup.array().of(Yup.string()),
  });

  const handleSubmit = async (values: MoreInfoFormValues) => {
    try {
      // Prepare payload - send as JSON object
      const payload: MoreInfoFormValues = {
        service_duration: values.service_duration,
        available_time_slots: values.available_time_slots,
        gender_specific: values.gender_specific,
        discount_percentage: values.discount_percentage,
        assign_employees: values.assign_employees,
      };

      await editService({
        salonUid,
        serviceUid: selectedService?.uid,
        serviceData: payload,
      }).unwrap();

      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Updated successfully",
        html: `Successfully updated <b class="text-primary">${selectedService.name}</b> service info`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
      });

      onEditSuccess?.();
      onClose();
    } catch (error) {
      toast.error("Failed to update service.");
      console.error("Edit Service More Info Error:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="shadow-md sm:max-w-lg md:max-w-xl dark:shadow-gray-600">
        <DialogHeader>
          <DialogTitle className="text-primary">
            Edit Service More Info
          </DialogTitle>
          <DialogDescription>
            Make changes to the service information below.
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={{
            service_duration: selectedService?.service_duration || "00:30:00",
            available_time_slots: selectedService?.available_time_slots || [],
            gender_specific:
              (selectedService?.gender_specific as unknown as string) ||
              "UNISEX",
            discount_percentage: selectedService?.discount_percentage ?? 0,
            assign_employees: initialAssigned,
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, setFieldValue, handleSubmit, isSubmitting }) => (
            <Form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="service-duration" className="mb-2">
                  Service Duration
                </Label>
                {/* duration input (HH:MM or HH:MM:SS) */}
                <Field
                  as="input"
                  id="service-duration"
                  name="service_duration"
                  type="text"
                  placeholder="e.g. 00:30:00 or 0:30"
                  pattern="^([0-9]{1,2}):[0-5][0-9](:[0-5][0-9])?$"
                  title="Duration format HH:MM or HH:MM:SS"
                />
                <ErrorMessage
                  name="service_duration"
                  component="p"
                  className="mt-1 text-sm text-red-500"
                />
              </div>

              <div>
                <Label className="mb-2">Available Time Slots</Label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SLOTS.map((slot) => (
                    <label
                      key={slot}
                      className="inline-flex items-center gap-2"
                    >
                      <Checkbox
                        checked={values.available_time_slots.includes(slot)}
                        onCheckedChange={(v) => {
                          const checked = Boolean(v);
                          if (checked) {
                            setFieldValue("available_time_slots", [
                              ...values.available_time_slots,
                              slot,
                            ]);
                          } else {
                            setFieldValue(
                              "available_time_slots",
                              values.available_time_slots.filter(
                                (s: string) => s !== slot,
                              ),
                            );
                          }
                        }}
                      />
                      <Badge variant="default">
                        {formatUnderscoredLabel(slot)}
                      </Badge>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-2">Gender Specific</Label>
                <div>
                  <RadioGroup
                    value={values.gender_specific}
                    onValueChange={(v) => setFieldValue("gender_specific", v)}
                    className="flex gap-4"
                  >
                    {GENDER_OPTIONS.map((g) => (
                      <label key={g} className="inline-flex items-center gap-2">
                        <RadioGroupItem value={g} />
                        <span className="text-sm">
                          {formatUnderscoredLabel(g)}
                        </span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              </div>

              <div>
                <Label htmlFor="discount" className="mb-2">
                  Discount (%)
                </Label>
                <Field
                  as="input"
                  id="discount"
                  name="discount_percentage"
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                />
                <ErrorMessage
                  name="discount_percentage"
                  component="p"
                  className="mt-1 text-sm text-red-500"
                />
              </div>

              <div>
                <Label className="mb-2">Assign Employees</Label>
                {employeesData.results.length === 0 ? (
                  <div className="grid grid-cols-none">
                    <p className="text-muted-foreground text-center text-xs">
                      No employees found. Please add employees to assign.
                    </p>
                  </div>
                ) : null}
                <div className="grid max-h-40 grid-cols-1 flex-col gap-2 overflow-y-auto md:grid-cols-2">
                  {isLoadingEmployees ? (
                    <div>Loading employees...</div>
                  ) : (
                    (() => {
                      const list = (employeesData?.results || []).filter(
                        (e: Employee) => !!e?.uid,
                      ) as Employee[];
                      return list.map((emp) => {
                        const uid = emp.uid as string;
                        return (
                          <label
                            key={uid}
                            className="inline-flex items-center justify-between gap-4 rounded px-2 py-1"
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={values.assign_employees.includes(uid)}
                                onCheckedChange={(v) => {
                                  const checked = Boolean(v);
                                  if (checked) {
                                    setFieldValue("assign_employees", [
                                      ...values.assign_employees,
                                      uid,
                                    ]);
                                  } else {
                                    setFieldValue(
                                      "assign_employees",
                                      values.assign_employees.filter(
                                        (id: string) => id !== uid,
                                      ),
                                    );
                                  }
                                }}
                              />
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                  {emp.name}
                                </span>
                                <span className="text-muted-foreground text-xs">
                                  {emp.employee_id}
                                </span>
                              </div>
                            </div>
                          </label>
                        );
                      });
                    })()
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isEditingService}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isEditingService || isSubmitting}
                >
                  {isEditingService ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default EditServiceMoreInfoDialog;
