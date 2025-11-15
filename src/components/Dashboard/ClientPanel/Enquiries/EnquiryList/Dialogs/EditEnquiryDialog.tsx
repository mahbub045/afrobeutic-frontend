"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEditEnquiryMutation } from "@/Redux/Reducers/ClientPanel/Enquiries/EnquiriesApi";
import { useGetSalonListQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/SalonApi";
import { SalonProps } from "@/Types/ClientPanel/ManageSalonTypes/SalonListType";
import {
  EnquiryDialogsProps,
  FormValues,
} from "@/Types/EnquiriesTypes/EnquiryType";
import {
  ErrorMessage,
  Field,
  FieldInputProps,
  Form,
  Formik,
  FormikHelpers,
  FormikProps,
} from "formik";
import { useTheme } from "next-themes";
import React from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as Yup from "yup";

const EditEnquiryDialog: React.FC<EnquiryDialogsProps> = ({
  isOpen,
  onClose,
  enquiryData,
}) => {
  const { resolvedTheme } = useTheme();
  const { data: salonsData, isLoading: isSalonsLoading } =
    useGetSalonListQuery();
  const [editEnquiry, { isLoading }] = useEditEnquiryMutation();

  const initialValues = {
    phone: enquiryData?.lead?.phone ?? "",
    first_name:
      enquiryData?.lead?.first_name ?? enquiryData?.customer?.name ?? "",
    last_name: enquiryData?.lead?.last_name ?? "",
    email: enquiryData?.lead?.email ?? "",
    whatsapp: enquiryData?.lead?.whatsapp ?? "",
    type: enquiryData?.type ?? "GENERAL",
    summary: enquiryData?.summary ?? "",
    status: enquiryData?.status ?? "NEW",
    salon: enquiryData?.salon?.uid ?? enquiryData?.salon ?? "",
    country_dial_code: "",
  };

  const validationSchema = Yup.object().shape({
    phone: Yup.string().required("Phone is required"),
    first_name: Yup.string().required("First name is required"),
    summary: Yup.string().required("Summary is required"),
    salon: Yup.string().required("Please select a salon"),
    email: Yup.string().email("Invalid email address").nullable(),
  });

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting }: FormikHelpers<typeof initialValues>,
  ) => {
    setSubmitting(true);
    if (!enquiryData?.uid) {
      toast.error("Missing enquiry id");
      setSubmitting(false);
      return;
    }

    try {
      await editEnquiry({ enquiryuid: enquiryData.uid, ...values }).unwrap();
      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Enquiry Updated",
        html: `Enquiry for <b>${values.phone}</b> updated successfully`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 2000,
      });
      onClose();
    } catch (error) {
      console.error("Failed to edit enquiry:", error);
      toast.error("Failed to update enquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] !max-w-xl overflow-y-auto shadow-md sm:!max-w-3xl md:!max-w-4xl dark:shadow-gray-600">
        <DialogHeader>
          <DialogTitle className="text-primary">Edit Enquiry</DialogTitle>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="phone" className="mb-2">
                  Phone<span className="text-danger">*</span>
                </Label>
                <Field name="phone">
                  {({
                    field,
                    form,
                  }: {
                    field: FieldInputProps<string>;
                    form: FormikProps<FormValues>;
                  }) => (
                    <div>
                      <PhoneInput
                        country={"gb"}
                        value={field.value}
                        onChange={(
                          value: string,
                          data?: { dialCode?: string },
                        ) => {
                          const dial =
                            data && data.dialCode
                              ? `+${data.dialCode}`
                              : form.values.country_dial_code || "";
                          const numeric = (value || "").replace(/[^0-9]/g, "");
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
                          form.setFieldValue("country_dial_code", dial);
                        }}
                        onBlur={() => {
                          const dial = form.values.country_dial_code || "";
                          if (dial && !form.values.phone?.startsWith(dial)) {
                            const numeric = (form.values.phone || "").replace(
                              /[^0-9]/g,
                              "",
                            );
                            form.setFieldValue("phone", `${dial}${numeric}`);
                          }
                        }}
                        inputProps={{ name: field.name, required: true }}
                        searchPlaceholder="Search"
                        searchNotFound="No country found"
                        enableSearch={true}
                        inputClass="!w-full !h-auto px-3 py-2 rounded-md !bg-white !text-black dark:!bg-[#181818] dark:!text-gray-100"
                        buttonClass="!bg-white !text-black dark:!bg-[#181818] dark:!text-gray-100 !border-1 dark:!border-gray-700"
                        dropdownClass="!bg-card !text-card-foreground dark:!bg-gray-800 dark:!text-gray-100 !px-2"
                        searchClass="!bg-card !text-card-foreground dark:!bg-gray-800 dark:!text-gray-100"
                      />
                      <ErrorMessage
                        name="phone"
                        component="div"
                        className="text-destructive mt-1 text-xs"
                      />
                    </div>
                  )}
                </Field>
              </div>

              <div>
                <Label htmlFor="first_name" className="mb-2">
                  First Name
                </Label>
                <Field
                  id="first_name"
                  name="first_name"
                  type="text"
                  as="input"
                  placeholder="First name"
                />
                <div className="text-destructive text-sm">
                  <ErrorMessage name="first_name" />
                </div>
              </div>

              <div>
                <Label htmlFor="last_name" className="mb-2">
                  Last Name
                </Label>
                <Field
                  id="last_name"
                  name="last_name"
                  type="text"
                  as="input"
                  placeholder="Last name"
                />
              </div>

              <div>
                <Label htmlFor="email" className="mb-2">
                  Email
                </Label>
                <Field
                  id="email"
                  name="email"
                  type="email"
                  as="input"
                  placeholder="Email"
                />
                <div className="text-destructive text-sm">
                  <ErrorMessage name="email" />
                </div>
              </div>

              <div>
                <Label htmlFor="whatsapp" className="mb-2">
                  Whatsapp
                </Label>
                <Field name="whatsapp">
                  {({
                    field,
                    form,
                  }: {
                    field: FieldInputProps<string>;
                    form: FormikProps<FormValues>;
                  }) => (
                    <div>
                      <PhoneInput
                        country={"gb"}
                        value={field.value}
                        onChange={(
                          value: string,
                          data?: { dialCode?: string },
                        ) => {
                          const dial =
                            data && data.dialCode
                              ? `+${data.dialCode}`
                              : form.values.country_dial_code || "";
                          const numeric = (value || "").replace(/[^0-9]/g, "");
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
                          form.setFieldValue("country_dial_code", dial);
                        }}
                        onBlur={() => {
                          const dial = form.values.country_dial_code || "";
                          if (dial && !form.values.whatsapp?.startsWith(dial)) {
                            const numeric = (
                              form.values.whatsapp || ""
                            ).replace(/[^0-9]/g, "");
                            form.setFieldValue("whatsapp", `${dial}${numeric}`);
                          }
                        }}
                        inputProps={{ name: field.name }}
                        searchPlaceholder="Search"
                        searchNotFound="No country found"
                        enableSearch={true}
                        inputClass="!w-full !h-auto px-3 py-2 rounded-md !bg-white !text-black dark:!bg-[#181818] dark:!text-gray-100"
                        buttonClass="!bg-white !text-black dark:!bg-[#181818] dark:!text-gray-100 !border-1 dark:!border-gray-700"
                        dropdownClass="!bg-card !text-card-foreground dark:!bg-gray-800 dark:!text-gray-100 !px-2"
                        searchClass="!bg-card !text-card-foreground dark:!bg-gray-800 dark:!text-gray-100"
                      />
                      <ErrorMessage
                        name="whatsapp"
                        component="div"
                        className="text-destructive mt-1 text-xs"
                      />
                    </div>
                  )}
                </Field>
              </div>

              <div>
                <Label htmlFor="source" className="mb-2">
                  Source
                </Label>
                <Field
                  id="source"
                  name="source"
                  type="text"
                  as="input"
                  placeholder="Source"
                />
              </div>

              <div>
                <Label htmlFor="type" className="mb-2">
                  Type
                </Label>
                <Field as="select" id="type" name="type">
                  <option value="GENERAL">General</option>
                  <option value="EMERGENCY">Emergency</option>
                </Field>
              </div>

              <div>
                <Label htmlFor="salon" className="mb-2">
                  Salon
                </Label>
                <Field as="select" id="salon" name="salon">
                  <option value="">
                    {isSalonsLoading ? "Loading salons..." : "Select a salon"}
                  </option>
                  {salonsData?.results.map((s: SalonProps) => (
                    <option key={s.uid} value={s.uid}>
                      {s.name}
                    </option>
                  ))}
                </Field>
                <div className="text-destructive text-sm">
                  <ErrorMessage name="salon" />
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="summary" className="mb-2">
                  Summary
                </Label>
                <Field
                  as={Textarea}
                  id="summary"
                  name="summary"
                  placeholder="Short summary"
                />
                <div className="text-destructive text-sm">
                  <ErrorMessage name="summary" />
                </div>
              </div>

              <DialogFooter className="md:col-span-2">
                <div className="flex w-full justify-end gap-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => onClose && onClose()}
                    disabled={isSubmitting || isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="w-40 text-white"
                  >
                    {isSubmitting || isLoading
                      ? "Updating..."
                      : "Update Enquiry"}
                  </Button>
                </div>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default EditEnquiryDialog;
