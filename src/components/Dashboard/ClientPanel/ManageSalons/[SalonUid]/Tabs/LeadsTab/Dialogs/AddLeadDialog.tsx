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
import { useAddLeadMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/Leads/LeadsApi";
import { LeadDialogProps } from "@/Types/ClientPanel/ManageSalonTypes/LeadsTypes/LeadsType";
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
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as Yup from "yup";

const AddLeadDialog: React.FC<LeadDialogProps> = ({ isOpen, onClose }) => {
  const { resolvedTheme } = useTheme();

  const { salonuid } = useParams();
  const salonUid = Array.isArray(salonuid) ? salonuid[0] : (salonuid ?? "");

  const initialValues = {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    whatsapp: "",
    source: "",
  };

  const [addLead, { isLoading: isAddingLead }] = useAddLeadMutation();

  const validationSchema = Yup.object().shape({
    first_name: Yup.string().required("First name is required"),
    last_name: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email address").nullable(),
    phone: Yup.string()
      .nullable()
      .test(
        "phone-or-whatsapp",
        "Either phone or whatsapp must be provided.",
        function (value) {
          const parent = this.parent as { whatsapp?: string };
          const whatsapp = parent?.whatsapp;
          const p = value ? String(value).trim() : "";
          const w = whatsapp ? String(whatsapp).trim() : "";
          return p !== "" || w !== "";
        },
      ),
    whatsapp: Yup.string()
      .nullable()
      .test(
        "whatsapp-or-phone",
        "Either phone or whatsapp must be provided.",
        function (value) {
          const parent = this.parent as { phone?: string };
          const phone = parent?.phone;
          const p = phone ? String(phone).trim() : "";
          const w = value ? String(value).trim() : "";
          return p !== "" || w !== "";
        },
      ),
    source: Yup.string().required("Source is required"),
  });

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting, setFieldError }: FormikHelpers<typeof initialValues>,
  ) => {
    setSubmitting(true);

    if (!salonUid) {
      toast.error("Salon identifier not found.");
      setSubmitting(false);
      return;
    }

    const leadsData = {
      first_name: values.first_name || null,
      last_name: values.last_name || null,
      email: values.email || null,
      phone: values.phone || null,
      whatsapp: values.whatsapp || null,
      source: values.source || null,
    };

    try {
      await addLead({ salonUid, leadsData }).unwrap();
      onClose();
      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Lead Added",
        text: `Lead has been added successfully.`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 2200,
      });
    } catch (err) {
      console.error("Failed to add lead:", err);
      const errorObj = err as {
        data?: {
          non_field_errors?: string[];
          message?: string;
          phone?: string[];
          whatsapp?: string[];
        };
        message?: string;
      };
      const serverMsg =
        errorObj?.data?.non_field_errors?.[0] ||
        errorObj?.data?.phone?.[0] ||
        errorObj?.data?.whatsapp?.[0] ||
        errorObj?.message ||
        (typeof err === "string" ? err : "Failed to add lead.");

      if (errorObj?.data?.non_field_errors) {
        setFieldError("phone", serverMsg);
        setFieldError("whatsapp", serverMsg);
      }

      toast.error(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg shadow-md dark:shadow-gray-600">
        <DialogHeader>
          <DialogTitle className="text-primary">Add Lead</DialogTitle>
          <DialogDescription className="text-xs">
            Provide details for the new lead.
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          <FormikForm>
            <div className="grid gap-3">
              <div>
                <Label htmlFor="first_name" className="mb-2">
                  First Name<span className="text-danger">*</span>
                </Label>
                <Field
                  id="first_name"
                  name="first_name"
                  as="input"
                  type="text"
                  required
                  placeholder="Enter first name"
                />
                <ErrorMessage
                  name="first_name"
                  component="div"
                  className="text-danger mt-1 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="last_name" className="mb-2">
                  Last Name<span className="text-danger">*</span>
                </Label>
                <Field
                  id="last_name"
                  name="last_name"
                  as="input"
                  type="text"
                  required
                  placeholder="Enter last name"
                />
                <ErrorMessage
                  name="last_name"
                  component="div"
                  className="text-danger mt-1 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="email" className="mb-2">
                  Email
                </Label>
                <Field id="email" name="email" as="input" type="email" />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-danger mt-1 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="mb-2">
                  Phone
                </Label>
                <Field name="phone">
                  {({ field, form }: FieldProps) => (
                    <div>
                      <PhoneInput
                        country={"gb"}
                        value={field.value}
                        onChange={(
                          val: string,
                          data?: { dialCode?: string },
                        ) => {
                          const dial = data?.dialCode
                            ? `+${data.dialCode}`
                            : "";
                          const numeric = (val || "").replace(/[^0-9]/g, "");

                          // If there's no numeric input, don't store the country dial alone
                          if (!numeric) {
                            form.setFieldValue(field.name, "");
                            return;
                          }

                          let newVal = numeric;
                          if (dial) {
                            if (!numeric.startsWith(dial.replace(/\D/g, ""))) {
                              newVal = `${dial}${numeric}`;
                            } else {
                              newVal = `+${numeric}`;
                            }
                          } else if (numeric) {
                            newVal = `+${numeric}`;
                          }
                          form.setFieldValue(field.name, newVal);
                        }}
                        inputProps={{ name: field.name }}
                        searchPlaceholder="Search"
                        enableSearch
                        inputClass="!w-full !h-auto px-3 py-2 rounded-md !bg-white !text-black dark:!bg-[#181818] dark:!text-gray-100"
                        buttonClass="!bg-white !text-black dark:!bg-[#181818] dark:!text-gray-100 !border-1 dark:!border-gray-700"
                        dropdownClass="!bg-card !text-card-foreground dark:!bg-gray-800 dark:!text-gray-100 !px-2"
                        searchClass="!bg-card !text-card-foreground dark:!bg-gray-800 dark:!text-gray-100"
                      />
                      <ErrorMessage
                        name="phone"
                        component="div"
                        className="text-danger mt-1 text-xs"
                      />
                    </div>
                  )}
                </Field>
              </div>

              <div>
                <Label htmlFor="whatsapp" className="mb-2">
                  Whatsapp
                </Label>
                <Field name="whatsapp">
                  {({ field, form }: FieldProps) => (
                    <div>
                      <PhoneInput
                        country={"gb"}
                        value={field.value}
                        onChange={(
                          val: string,
                          data?: { dialCode?: string },
                        ) => {
                          const dial = data?.dialCode
                            ? `+${data.dialCode}`
                            : "";
                          const numeric = (val || "").replace(/[^0-9]/g, "");

                          // If there's no numeric input, don't store the country dial alone
                          if (!numeric) {
                            form.setFieldValue(field.name, "");
                            return;
                          }

                          let newVal = numeric;
                          if (dial) {
                            if (!numeric.startsWith(dial.replace(/\D/g, ""))) {
                              newVal = `${dial}${numeric}`;
                            } else {
                              newVal = `+${numeric}`;
                            }
                          } else if (numeric) {
                            newVal = `+${numeric}`;
                          }
                          form.setFieldValue(field.name, newVal);
                        }}
                        inputProps={{ name: field.name }}
                        searchPlaceholder="Search"
                        enableSearch
                        inputClass="!w-full !h-auto px-3 py-2 rounded-md !bg-white !text-black dark:!bg-[#181818] dark:!text-gray-100"
                        buttonClass="!bg-white !text-black dark:!bg-[#181818] dark:!text-gray-100 !border-1 dark:!border-gray-700"
                        dropdownClass="!bg-card !text-card-foreground dark:!bg-gray-800 dark:!text-gray-100 !px-2"
                        searchClass="!bg-card !text-card-foreground dark:!bg-gray-800 dark:!text-gray-100"
                      />
                      <ErrorMessage
                        name="whatsapp"
                        component="div"
                        className="text-danger mt-1 text-xs"
                      />
                    </div>
                  )}
                </Field>
              </div>

              <div>
                <Label htmlFor="source" className="mb-2">
                  Source<span className="text-danger">*</span>
                </Label>
                <Field
                  id="source"
                  name="source"
                  as="input"
                  type="text"
                  required
                  placeholder="Enter source"
                />
                <ErrorMessage
                  name="source"
                  component="div"
                  className="text-danger mt-1 text-xs"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isAddingLead}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isAddingLead} className="w-40">
                {isAddingLead ? "Adding..." : "Add Lead"}
              </Button>
            </div>
          </FormikForm>
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default AddLeadDialog;
