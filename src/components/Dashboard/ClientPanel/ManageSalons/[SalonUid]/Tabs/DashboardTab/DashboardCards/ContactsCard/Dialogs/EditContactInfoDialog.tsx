import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useEditSingleSalonMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/SingleSalon/SingleSalonApi";
import { EditDashboardProps } from "@/Types/ClientPanel/ManageSalonTypes/SalonListType";
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
import PhoneInput from "react-phone-input-2";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as Yup from "yup";

export interface ContactValues {
  phone: string;
  email: string;
  website: string;
}

const EditContactInfoDialog: React.FC<EditDashboardProps> = ({
  singleSalonData,
  isOpen,
  onClose,
}) => {
  const { salonuid } = useParams();
  const { resolvedTheme } = useTheme();

  // RTK hooks
  const [editBasicInfo, { isLoading }] = useEditSingleSalonMutation();

  const handleSubmit = async (
    values: ContactValues,
    { setSubmitting }: FormikHelpers<ContactValues>,
  ) => {
    setSubmitting(true);
    try {
      const payload: Partial<Record<string, unknown>> = {
        website: values.website || null,
        phone: values.phone || null,
        email: values.email || null,
      };

      await editBasicInfo({
        salonUid: salonuid as string,
        salonData: payload,
      }).unwrap();

      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Updated",
        html: `Contact information updated successfully`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 3000,
      });
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update contacts. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const schema = Yup.object().shape({
    website: Yup.string().url("Invalid URL").nullable(),
    phone: Yup.string().nullable(),
    email: Yup.string().email("Invalid email address").nullable(),
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md shadow-md dark:shadow-gray-600">
        <DialogHeader>
          <DialogTitle className="text-primary">Edit Contacts</DialogTitle>
          <DialogDescription className="text-xs">
            Update phone, email and website for this salon.
          </DialogDescription>
        </DialogHeader>

        <Formik<ContactValues>
          enableReinitialize
          initialValues={{
            website: singleSalonData?.website || "",
            phone: singleSalonData?.phone || "",
            email: singleSalonData?.email || "",
          }}
          validationSchema={schema}
          onSubmit={handleSubmit}
        >
          {(): React.ReactNode => (
            <FormikForm>
              <div className="grid gap-4">
                <div>
                  <Label className="mb-2">Website</Label>
                  <Field id="website" name="website" as="input" type="text" />
                  <ErrorMessage
                    name="website"
                    component="div"
                    className="text-danger mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="mb-2">Phone</Label>
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
                            let newVal = numeric;
                            if (dial) {
                              if (
                                !numeric.startsWith(dial.replace(/\D/g, ""))
                              ) {
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
                  <Label className="mb-2">Email</Label>
                  <Field id="email" name="email" as="input" type="email" />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-danger mt-1 text-xs"
                  />
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
                    disabled={isLoading}
                    className="w-40 text-white"
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

export default EditContactInfoDialog;
