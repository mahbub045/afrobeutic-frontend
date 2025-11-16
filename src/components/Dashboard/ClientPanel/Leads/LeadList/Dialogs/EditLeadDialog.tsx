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
import { useEditLeadMutation } from "@/Redux/Reducers/ClientPanel/Leads/LeadsApi";
import { useGetSalonListQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/SalonApi";
import { LeadDialogProps } from "@/Types/ClientPanel/LeadsTypes/LeadsType";
import {
  ErrorMessage,
  Field,
  FieldProps,
  Formik,
  Form as FormikForm,
  FormikHelpers,
} from "formik";
import { useTheme } from "next-themes";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as Yup from "yup";

const EditLeadDialog: React.FC<LeadDialogProps> = ({
  isOpen,
  onClose,
  LeadData,
}) => {
  const { resolvedTheme } = useTheme();

  const initialValues = {
    first_name: LeadData?.first_name ?? "",
    last_name: LeadData?.last_name ?? "",
    email: LeadData?.email ?? "",
    phone: LeadData?.phone ?? "",
    salon: LeadData?.salon ?? null,
    source: LeadData?.source ?? "",
  };
  const { data: salonsData, isLoading: isSalonsLoading } =
    useGetSalonListQuery();
  const [editLead, { isLoading: isEditing }] = useEditLeadMutation();

  const salonOptions =
    salonsData?.results?.map((salon) => ({
      uid: salon.uid,
      name: salon.name,
    })) ?? [];

  const validationSchema = Yup.object().shape({
    first_name: Yup.string().nullable(),
    last_name: Yup.string().nullable(),
    email: Yup.string().email("Invalid email address").nullable(),
    phone: Yup.string().nullable(),
    salon: Yup.string().nullable(),
    source: Yup.string().nullable(),
  });

  const handleSubmit = (
    values: typeof initialValues,
    { setFieldError }: FormikHelpers<typeof initialValues>,
  ) => {
    if (!LeadData) return;

    const leadsData = {
      first_name: values.first_name || null,
      last_name: values.last_name || null,
      email: values.email || null,
      phone: values.phone || null,
      salon: values.salon || null,
      source: values.source || null,
    };

    editLead({ leadsData, leadsUid: LeadData.uid })
      .unwrap()
      .then(() => {
        onClose();
        Swal.fire({
          icon: "success",
          iconColor: "#037375",
          title: "Lead Updated",
          text: `Lead information has been updated successfully.`,
          background: resolvedTheme === "dark" ? "#0f1724" : undefined,
          color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
          confirmButtonColor: "#037375",
          timer: 2500,
        });
      })
      .catch((err) => {
        console.error("Failed to add lead:", err);
        const errorObj = err as {
          data?: {
            non_field_errors?: string[];
            message?: string;
            phone?: string[];
            salon?: string[];
          };
          message?: string;
        };
        const serverMsg =
          errorObj?.data?.non_field_errors?.[0] ||
          errorObj?.data?.phone?.[0] ||
          errorObj?.data?.salon?.[0] ||
          errorObj?.message ||
          (typeof err === "string" ? err : "Failed to add lead.");

        if (errorObj?.data?.non_field_errors) {
          setFieldError("phone", serverMsg);
          setFieldError("salon", serverMsg);
        }

        toast.error(serverMsg);
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg shadow-md dark:shadow-gray-600">
        <DialogHeader>
          <DialogTitle className="text-primary">Edit Lead</DialogTitle>
          <DialogDescription className="text-xs">
            Update the lead information.
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          <FormikForm>
            <div className="grid gap-3">
              <div>
                <Label htmlFor="first_name" className="mb-2">
                  First Name
                </Label>
                <Field
                  id="first_name"
                  name="first_name"
                  as="input"
                  type="text"
                />
                <ErrorMessage
                  name="first_name"
                  component="div"
                  className="text-danger mt-1 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="last_name" className="mb-2">
                  Last Name
                </Label>
                <Field id="last_name" name="last_name" as="input" type="text" />
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
                <Label htmlFor="salon" className="mb-2">
                  Salon
                </Label>
                <Field
                  id="salon"
                  name="salon"
                  as="select"
                  className="w-full rounded-md px-3 py-2"
                >
                  <option value="">Select salon</option>
                  {salonOptions.map((s) => (
                    <option key={s.uid} value={s.uid}>
                      {s.name}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="salon"
                  component="div"
                  className="text-danger mt-1 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="source" className="mb-2">
                  Source
                </Label>
                <Field id="source" name="source" as="input" type="text" />
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
                disabled={isEditing}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isEditing} className="w-40">
                {isEditing ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </FormikForm>
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default EditLeadDialog;
