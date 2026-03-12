"use client";

import { useCreateEnquiryMutation } from "@/Redux/Reducers/ClientPanel/Enquiries/EnquiriesApi";
import { useGetLeadsAndCustomersQuery } from "@/Redux/Reducers/ClientPanel/LeadsAndCustomers/LeadsAndCustomersApi";
import { useGetSalonListQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/SalonApi";
import { LeadAndCustomerProps } from "@/Types/ClientPanel/LeadsAndCustomersTypes/LeadsAndCustomersType";
import { EnquiryDialogsProps } from "@/Types/EnquiriesTypes/EnquiryType";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ENQUIRY_TYPES } from "@/constants/enquiryTypes";
import {
  ErrorMessage,
  Field,
  FieldInputProps,
  Form,
  Formik,
  FormikHelpers,
  FormikProps,
} from "formik";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as Yup from "yup";

const CreateEnquiryDialogs: React.FC<EnquiryDialogsProps> = ({
  isOpen,
  onClose,
}) => {
  const { data: session } = useSession();
  const { resolvedTheme } = useTheme();

  // RTK Hooks for API calls
  // Debounced phone search state for suggestions
  const [phoneSearch, setPhoneSearch] = useState("");
  const [debouncedPhone, setDebouncedPhone] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedContact, setSelectedContact] =
    useState<LeadAndCustomerProps | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedPhone(phoneSearch), 400);
    return () => clearTimeout(t);
  }, [phoneSearch]);

  // Build search param (API expects ?search=+447... per spec). Ensure single leading plus and minimum length.
  const normalizedDebounced = debouncedPhone
    ? debouncedPhone.startsWith("+")
      ? debouncedPhone
      : `+${debouncedPhone}`
    : "";
  // Require at least 4 digits (excluding +) before querying
  const digitsOnly = normalizedDebounced.replace(/[^0-9]/g, "");
  const searchParam = digitsOnly.length >= 4 ? normalizedDebounced : undefined;
  const { data: leadAndCustomerData, isLoading: isLeadAndCustomerLoading } =
    useGetLeadsAndCustomersQuery(
      searchParam ? { search: searchParam } : undefined,
    );
  const { data: salonsData, isLoading: isSalonsLoading } =
    useGetSalonListQuery();
  const [createEnquiry, { isLoading }] = useCreateEnquiryMutation();
  const isIndividualStylist =
    session?.user?.account_type === "INDIVIDUAL_STYLIST";

  const leadAndCustomerOptions: Array<{
    uid?: string;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    phone?: string | null;
  }> =
    // Support both paginated shape {results: [...]} and direct array response
    (Array.isArray(leadAndCustomerData)
      ? (leadAndCustomerData as LeadAndCustomerProps[])
      : (leadAndCustomerData?.results as LeadAndCustomerProps[] | undefined)
    )?.map((item: LeadAndCustomerProps) => ({
      uid: item.uid,
      first_name: item.first_name,
      last_name: item.last_name,
      email: item.email,
      phone: item.phone,
    })) || [];

  // Debug log (remove in production)
  // console.log("[LeadsSearch] raw data", leadAndCustomerData);
  // console.log("[LeadsSearch] options", leadAndCustomerOptions);

  const salonOptions =
    salonsData?.results?.map((salon) => ({
      uid: salon.uid,
      name: salon.name,
    })) ?? [];

  const initialValues = {
    phone: "",
    first_name: "",
    last_name: "",
    email: "",
    whatsapp: "",
    type: ENQUIRY_TYPES[0].value,
    summary: "",
    status: "NEW",
    salon: "",
    country_dial_code: "",
  };

  type FormValues = typeof initialValues;

  const fieldClassName =
    "border-input bg-background ring-offset-background placeholder:text-muted-foreground hover:border-primary/50 focus-visible:ring-primary w-full rounded-md border px-3 py-2 text-sm transition-all focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

  const selectClassName = `${fieldClassName} pr-10`;

  const validationSchema = Yup.object().shape({
    phone: Yup.string().required("Phone is required"),
    first_name: Yup.string().required("First name is required"),
    last_name: Yup.string().required("Last name is required"),
    summary: Yup.string().required("Summary is required"),
    salon: isIndividualStylist
      ? Yup.string().nullable()
      : Yup.string().required("Please select a salon"),
    email: Yup.string().email("Invalid email address").nullable(),
  });

  type ApiErrorData = {
    non_field_errors?: string[];
    message?: string;
    error?: string;
    phone?: string[] | string;
    first_name?: string[] | string;
    last_name?: string[] | string;
    email?: string[] | string;
    whatsapp?: string[] | string;
    type?: string[] | string;
    summary?: string[] | string;
    salon?: string[] | string;
    status?: string[] | string;
    country_dial_code?: string[] | string;
  };
  const fieldErrorMap = [
    "phone",
    "first_name",
    "last_name",
    "email",
    "whatsapp",
    "type",
    "summary",
    "salon",
  ] as const;

  const getFirstErrorMessage = (value?: string[] | string) => {
    if (Array.isArray(value)) return value[0];
    if (typeof value === "string") return value;
    return undefined;
  };

  const handleSubmit = async (
    values: typeof initialValues,
    {
      resetForm,
      setSubmitting,
      setFieldError,
    }: FormikHelpers<typeof initialValues>,
  ) => {
    setSubmitting(true);
    try {
      if (!isIndividualStylist && !values.salon) {
        setFieldError("salon", "Please select a salon");
        setSubmitting(false);
        return;
      }

      const payload = isIndividualStylist
        ? (({ salon: _salon, ...rest }) => rest)(values)
        : values;

      // guard against blank type (shouldn't happen, but backend rejects empty)
      if (!payload.type) {
        payload.type = ENQUIRY_TYPES[0].value;
      }
      await createEnquiry(payload).unwrap();
      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Enquiry Created",
        html: `Enquiry for <b>${payload.phone}</b> created successfully`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 2500,
      });
      onClose();
      resetForm();
    } catch (error) {
      console.error("Failed to create enquiry:", error);
      const apiError = error as {
        data?: ApiErrorData;
        message?: string;
      };

      fieldErrorMap.forEach((fieldName) => {
        const fieldError = getFirstErrorMessage(apiError.data?.[fieldName]);
        if (fieldError) {
          setFieldError(fieldName, fieldError);
        }
      });

      const serverMessage =
        getFirstErrorMessage(apiError.data?.non_field_errors) ||
        apiError.data?.message ||
        apiError.data?.error ||
        getFirstErrorMessage(apiError.data?.phone) ||
        getFirstErrorMessage(apiError.data?.first_name) ||
        getFirstErrorMessage(apiError.data?.last_name) ||
        getFirstErrorMessage(apiError.data?.email) ||
        getFirstErrorMessage(apiError.data?.whatsapp) ||
        getFirstErrorMessage(apiError.data?.type) ||
        getFirstErrorMessage(apiError.data?.summary) ||
        getFirstErrorMessage(apiError.data?.salon) ||
        apiError.message ||
        (typeof error === "string"
          ? error
          : "Failed to create enquiry. Please try again.");

      if (getFirstErrorMessage(apiError.data?.non_field_errors)) {
        setFieldError(
          "phone",
          getFirstErrorMessage(apiError.data?.non_field_errors) as string,
        );
      }

      toast.error(serverMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] !max-w-xl overflow-y-auto shadow-md sm:!max-w-3xl md:!max-w-4xl dark:shadow-gray-600">
        <DialogHeader>
          <DialogTitle className="text-primary">Create Enquiry</DialogTitle>
          <DialogDescription>
            Please fill out the form below to create a new enquiry.
          </DialogDescription>
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
                    <div className="relative">
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
                            setPhoneSearch("");
                            setShowSuggestions(false);
                            setSelectedContact(null);
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
                          // Update debounced search term with the full formatted phone (with leading +)
                          setPhoneSearch(newVal);
                          setShowSuggestions(true);
                          // Editing phone clears any prior selection lock
                          if (selectedContact) setSelectedContact(null);
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
                          // Hide suggestions on blur after a short delay to allow click
                          setTimeout(() => setShowSuggestions(false), 150);
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
                      {showSuggestions &&
                        debouncedPhone &&
                        debouncedPhone.length >= 3 && (
                          <div className="bg-popover text-popover-foreground absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md border shadow-lg">
                            {isLeadAndCustomerLoading ? (
                              <div className="px-3 py-2 text-sm">
                                Searching…
                              </div>
                            ) : leadAndCustomerOptions.length > 0 ? (
                              leadAndCustomerOptions.map(
                                (
                                  item: (typeof leadAndCustomerOptions)[number],
                                ) => (
                                  <button
                                    type="button"
                                    key={item.uid}
                                    className="hover:bg-accent hover:text-accent-foreground flex w-full items-start gap-2 px-3 py-2 text-left"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => {
                                      // Fill in values and lock fields
                                      form.setFieldValue(
                                        "phone",
                                        item.phone || form.values.phone,
                                      );
                                      form.setFieldValue(
                                        "first_name",
                                        item.first_name || "",
                                      );
                                      form.setFieldValue(
                                        "last_name",
                                        item.last_name || "",
                                      );
                                      form.setFieldValue(
                                        "email",
                                        item.email || "",
                                      );
                                      setSelectedContact(
                                        item as unknown as LeadAndCustomerProps,
                                      );
                                      setShowSuggestions(false);
                                    }}
                                  >
                                    <div className="flex flex-col">
                                      <span className="text-sm font-medium">
                                        {item.phone || "Unknown phone"}
                                      </span>
                                      <span className="text-muted-foreground text-xs">
                                        {(item.first_name || "").trim()}{" "}
                                        {(item.last_name || "").trim()}{" "}
                                        {item.email ? `• ${item.email}` : ""}
                                      </span>
                                    </div>
                                  </button>
                                ),
                              )
                            ) : (
                              <div className="text-muted-foreground px-3 py-2 text-sm">
                                No match found
                              </div>
                            )}
                          </div>
                        )}
                      <ErrorMessage
                        name="phone"
                        component="div"
                        className="text-destructive mt-1 text-xs"
                      />
                      {selectedContact && (
                        <div className="text-muted-foreground mt-1 flex flex-col items-start gap-1 text-xs sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                          <span>
                            Contact selected. Fields auto-filled and locked.
                          </span>
                          <button
                            type="button"
                            className="text-primary hover:underline"
                            onClick={() => setSelectedContact(null)}
                          >
                            Clear selection
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </Field>
              </div>

              <div>
                <Label htmlFor="first_name" className="mb-2">
                  First Name<span className="text-danger">*</span>
                </Label>
                <Field
                  id="first_name"
                  name="first_name"
                  type="text"
                  as="input"
                  className={fieldClassName}
                  placeholder="First name"
                  required
                  disabled={!!selectedContact && !!selectedContact.first_name}
                />
                <div className="text-destructive text-sm">
                  <ErrorMessage name="first_name" />
                </div>
              </div>

              <div>
                <Label htmlFor="last_name" className="mb-2">
                  Last Name<span className="text-danger">*</span>
                </Label>
                <Field
                  id="last_name"
                  name="last_name"
                  type="text"
                  as="input"
                  className={fieldClassName}
                  placeholder="Last name"
                  required
                  disabled={!!selectedContact && !!selectedContact.last_name}
                />
                <div className="text-destructive text-sm">
                  <ErrorMessage name="last_name" />
                </div>
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
                  className={fieldClassName}
                  placeholder="Email"
                  disabled={!!selectedContact && !!selectedContact.email}
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
                <Label htmlFor="type" className="mb-2">
                  Type
                </Label>
                <Field
                  as="select"
                  id="type"
                  name="type"
                  className={selectClassName}
                >
                  {ENQUIRY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Field>
                <div className="text-destructive text-sm">
                  <ErrorMessage name="type" />
                </div>
              </div>
              {session?.user?.account_type === "INDIVIDUAL_STYLIST" ? null : (
                <div className="md:col-span-2">
                  <Label htmlFor="salon" className="mb-2">
                    Salon<span className="text-danger">*</span>
                  </Label>
                  <Field
                    as="select"
                    id="salon"
                    name="salon"
                    required
                    className={selectClassName}
                  >
                    <option value="">
                      {isSalonsLoading ? "Loading salons..." : "Select a salon"}
                    </option>
                    {salonOptions.map((s) => (
                      <option key={s.uid} value={s.uid}>
                        {s.name}
                      </option>
                    ))}
                  </Field>
                  <div className="text-destructive text-sm">
                    <ErrorMessage name="salon" />
                  </div>
                </div>
              )}
              <div className="md:col-span-2">
                <Label htmlFor="summary" className="mb-2">
                  Summary<span className="text-danger">*</span>
                </Label>
                <Field
                  as={Textarea}
                  id="summary"
                  name="summary"
                  className={fieldClassName}
                  placeholder="Short summary"
                  required
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
                    disabled={isSubmitting || isLoading || isSalonsLoading}
                    className="w-40 text-white"
                  >
                    {isSubmitting || isLoading || isSalonsLoading
                      ? "Creating..."
                      : "Create Enquiry"}
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

export default CreateEnquiryDialogs;
