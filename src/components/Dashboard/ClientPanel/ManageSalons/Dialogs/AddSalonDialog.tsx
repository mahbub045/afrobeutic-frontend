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
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { countries } from "@/data/countries";
import { useAddSalonMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/SalonApi";
import {
  AddSalonDialogProps,
  FormValues,
  OpeningHour,
  SalonProps,
} from "@/Types/ClientPanel/ManageSalonTypes/SalonListType";
import {
  ErrorMessage,
  Field,
  FieldArray,
  FieldInputProps,
  FieldProps,
  Formik,
  Form as FormikForm,
  FormikProps,
} from "formik";
import { useTheme } from "next-themes";
import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as Yup from "yup";

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

// Validation schema for basic info tab
const basicInfoValidationSchema = Yup.object().shape({
  name: Yup.string().required("Salon name is required"),
  salon_type: Yup.string().required("Salon type is required"),
});

// Validation schema for contacts tab
const contactsValidationSchema = Yup.object().shape({
  email: Yup.string().required("Email is required").email("Invalid email"),
  phone: Yup.string().required("Phone number is required"),
  website: Yup.string().url("Invalid URL"),
});

// Validation schema for address tab
const addressValidationSchema = Yup.object().shape({
  street: Yup.string().required("Street is required"),
  city: Yup.string().required("City is required"),
  postal_code: Yup.string().required("Postal code is required"),
  country: Yup.string().required("Country is required"),
  // Combined optional address string (not required)
  // accepts only a valid URL when provided
  address: Yup.string().url("Invalid URL").notRequired(),
});

// Full validation schema for form submission
const validationSchema = Yup.object().shape({
  name: Yup.string().required("Salon name is required"),
  salon_type: Yup.string().required("Salon type is required"),
  email: Yup.string().required("Email is required").email("Invalid email"),
  phone: Yup.string().required("Phone number is required"),
  website: Yup.string().url("Invalid URL"),
  street: Yup.string().required("Street is required"),
  city: Yup.string().required("City is required"),
  postal_code: Yup.string().required("Postal code is required"),
  country: Yup.string().required("Country is required"),
  // latitude/longitude removed from form validation — optional address added
  // address must be a valid URL if provided
  address: Yup.string().url("Invalid URL").notRequired(),
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

const AddSalonDialog: React.FC<AddSalonDialogProps> = ({ isOpen, onClose }) => {
  const { resolvedTheme } = useTheme();
  const [addSalon, { isLoading }] = useAddSalonMutation();
  const [activeTab, setActiveTab] = useState("basic-info");

  // Helper function to convert time HH:MM to HH:MM:SS format
  const convertTimeToAPIFormat = (time: string): string => {
    if (!time || time === "" || time === "00:00") return "00:00:00";
    // If already in HH:MM:SS format, return as is
    if (time.split(":").length === 3) return time;
    // Otherwise, add :00 for seconds
    return `${time}:00`;
  };

  // Return true on success so caller (Formik) can reset the form and close dialog
  const handleSubmit = async (formData: FormValues) => {
    try {
      // Transform the data to match API payload format
      const payload: Partial<SalonProps> & {
        name: string;
        salon_type: string;
        email: string;
        phone: string;
        country_dial_code?: string;
      } = {
        name: formData.name,
        salon_type: formData.salon_type,
        email: formData.email,
        phone: formData.phone,
        country_dial_code: formData.country_dial_code,
        website: formData.website,
        street: formData.street,
        city: formData.city,
        postal_code: formData.postal_code,
        country: formData.country,
        address: formData.address,
        opening_hours: formData.opening_hours.map((oh) => ({
          day: oh.day,
          opening_start_time: convertTimeToAPIFormat(oh.opening_start_time),
          opening_end_time: convertTimeToAPIFormat(oh.opening_end_time),
          break_start_time: oh.break_start_time
            ? convertTimeToAPIFormat(oh.break_start_time)
            : undefined,
          break_end_time: oh.break_end_time
            ? convertTimeToAPIFormat(oh.break_end_time)
            : undefined,
          is_closed: oh.is_closed,
        })),
      };

      console.log("Sending payload to API:", JSON.stringify(payload, null, 2));

      await addSalon(payload).unwrap();
      // toast.success("Salon added successfully");
      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Added successfully",
        html: `Successfully added <b class="text-primary">${formData.name}</b> salon`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 3000,
      });
      return true;
    } catch (error: unknown) {
      console.error("Failed to add salon:", error);

      // Display specific error messages from API
      const apiError = error as { data?: Record<string, unknown> };
      if (apiError?.data) {
        const errorData = apiError.data;
        const errorMessages: string[] = [];

        Object.keys(errorData).forEach((key) => {
          const value = errorData[key];
          if (Array.isArray(value)) {
            errorMessages.push(`${key}: ${value.join(", ")}`);
          } else if (typeof value === "object" && value !== null) {
            errorMessages.push(`${key} has errors`);
          }
        });

        if (errorMessages.length > 0) {
          errorMessages.forEach((msg) => toast.error(msg));
        } else {
          toast.error("Failed to add salon. Please try again.");
        }
      } else {
        toast.error("Failed to add salon. Please try again.");
      }
      return false;
    }
  };
  const salonTypes = [
    { value: "UNISEX", label: "Unisex Salon" },
    { value: "MALE", label: "Male Salon" },
    { value: "FEMALE", label: "Female Salon" },
  ];
  const days = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];
  // status is no longer part of the add-salon form

  const hours = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0"),
  );
  const minutes = ["00", "15", "30", "45"];

  // Tab list and progress calculation for UI-only display
  const tabList = [
    { id: "basic-info", label: "Basic Info" },
    { id: "contacts", label: "Contacts" },
    { id: "address", label: "Address" },
    { id: "opening-hours", label: "Opening Hours" },
  ];
  const currentIndex = Math.max(
    0,
    tabList.findIndex((t) => t.id === activeTab),
  );

  const progressPercent = Math.round(
    tabList.length > 1 ? (currentIndex / (tabList.length - 1)) * 100 : 100,
  );

  const validateBasicInfo = async (values: FormValues): Promise<boolean> => {
    try {
      await basicInfoValidationSchema.validate(
        {
          name: values.name,
          salon_type: values.salon_type,
        },
        { abortEarly: false },
      );
      return true;
    } catch {
      return false;
    }
  };

  const validateContacts = async (values: FormValues): Promise<boolean> => {
    try {
      await contactsValidationSchema.validate(
        {
          email: values.email,
          phone: values.phone,
          website: values.website,
        },
        { abortEarly: false },
      );
      return true;
    } catch {
      return false;
    }
  };

  const validateAddress = async (values: FormValues): Promise<boolean> => {
    try {
      await addressValidationSchema.validate(
        {
          street: values.street,
          city: values.city,
          postal_code: values.postal_code,
          country: values.country,
          address: values.address,
        },
        { abortEarly: false },
      );
      return true;
    } catch {
      return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Make the dialog vertically scrollable when content exceeds the viewport */}
      <DialogContent className="max-h-[80vh] !max-w-4xl overflow-y-auto shadow-md sm:!max-w-4xl md:!max-w-5xl dark:shadow-gray-600">
        <DialogHeader>
          <DialogTitle className="text-primary text-2xl">
            Add New Salon
          </DialogTitle>
          <DialogDescription className="text-xs">
            Fill in the details to add a new salon.
          </DialogDescription>
        </DialogHeader>
        {/* Step labels and progress bar (view-only) */}
        <div className="px-4 pt-2">
          <div className="mb-2 flex items-center justify-center">
            <div className="flex items-center gap-4">
              {tabList.map((tab) => (
                <div
                  key={tab.id}
                  className={`text-xs font-medium ${
                    activeTab === tab.id
                      ? "bg-primary rounded-md px-2 py-1 text-white"
                      : "text-muted-foreground"
                  }`}
                >
                  {tab.label}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-muted h-2 w-full rounded-full">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
        {/* Formik form for adding a new salon goes here */}
        <Formik<FormValues>
          initialValues={{
            name: "",
            salon_type: "",
            email: "",
            phone: "",
            country_dial_code: "",
            website: "",
            street: "",
            city: "",
            postal_code: "",
            country: "",
            address: "",
            opening_hours: days.map((d) => ({
              day: d,
              opening_start_time: "08:00",
              opening_end_time: "22:00",
              break_start_time: "14:00",
              break_end_time: "16:00",
              is_closed: false,
            })),
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, { resetForm, setSubmitting }) => {
            setSubmitting(true);
            const success = await handleSubmit(values);
            setSubmitting(false);
            if (success) {
              // Reset the form to initial values, reset to first tab, and close dialog
              resetForm();
              setActiveTab("basic-info");
              onClose();
            }
          }}
        >
          {({ values, setFieldTouched }) => (
            <FormikForm>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsContent value="basic-info" className="space-y-4">
                  <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="name" className="mb-2">
                        Salon Name<span className="text-danger">*</span>
                      </Label>
                      <Field
                        name="name"
                        id="name"
                        as="input"
                        type="text"
                        placeholder="Salon Name"
                      />
                      <ErrorMessage
                        name="name"
                        component="div"
                        className="text-danger mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label htmlFor="salon_type" className="mb-2">
                        Salon Type<span className="text-danger">*</span>
                      </Label>
                      <Field
                        id="salon_type"
                        name="salon_type"
                        as="select"
                        required
                      >
                        <option value="" disabled>
                          Select a salon type
                        </option>
                        {salonTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage
                        name="salon_type"
                        component="div"
                        className="text-danger mt-1 text-xs"
                      />
                    </div>
                  </div>
                  {/* Navigation buttons for first tab */}
                  <div className="mt-6 flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={async () => {
                        const isValid = await validateBasicInfo(values);
                        if (isValid) {
                          setActiveTab("contacts");
                        } else {
                          const basicFields = ["name", "salon_type"];
                          basicFields.forEach((field) =>
                            setFieldTouched(field, true),
                          );
                          toast.error(
                            "Please fill in all required fields before proceeding",
                          );
                        }
                      }}
                      className="w-32 text-white"
                    >
                      Next
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="contacts" className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="mb-2">
                      Email<span className="text-danger">*</span>
                    </Label>
                    <Field
                      name="email"
                      id="email"
                      as="input"
                      type="email"
                      placeholder="Email"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-danger mt-1 text-xs"
                    />
                  </div>
                  <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="phone" className="mb-2">
                        Phone<span className="text-danger">*</span>
                      </Label>
                      {/* Hidden field to store selected dial code */}
                      <Field type="hidden" name="country_dial_code" />
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
                                // data.dialCode is the numeric dial code without + (e.g. '971')
                                const dial =
                                  data && data.dialCode
                                    ? `+${data.dialCode}`
                                    : form.values.country_dial_code || "";
                                // Keep only digits from value and prepend dial (with +)
                                const numeric = (value || "").replace(
                                  /[^0-9]/g,
                                  "",
                                );
                                if (!numeric) {
                                  form.setFieldValue(field.name, "");
                                  return;
                                }
                                let newVal = numeric;
                                if (dial) {
                                  // ensure numeric does not already contain dial
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
                                form.setFieldValue("country_dial_code", dial);
                              }}
                              onBlur={() => {
                                const dial =
                                  form.values.country_dial_code || "";
                                if (
                                  dial &&
                                  !form.values.phone?.startsWith(dial)
                                ) {
                                  const numeric = (
                                    form.values.phone || ""
                                  ).replace(/[^0-9]/g, "");
                                  form.setFieldValue(
                                    "phone",
                                    `${dial}${numeric}`,
                                  );
                                }
                              }}
                              inputProps={{ name: field.name, required: true }}
                              // Search functionality
                              searchPlaceholder="Search"
                              searchNotFound="No country found"
                              enableSearch={true}
                              inputClass="!w-full !h-auto px-3 py-2 rounded-md !bg-white !text-black dark:!bg-[#181818] dark:!text-gray-100"
                              buttonClass="!bg-white !text-black dark:!bg-[#181818] dark:!text-gray-100 !border-1 dark:!border-gray-700"
                              dropdownClass="!bg-card !text-card-foreground dark:!bg-gray-800 dark:!text-gray-100 !px-2"
                              searchClass="!bg-card !text-card-foreground dark:!bg-gray-800 dark:!text-gray-100"
                              // containerClass="w-full"
                            />
                            <ErrorMessage
                              name="phone"
                              component="div"
                              className="text-danger !dark:bg-gray-800 mt-1 text-xs"
                            />
                          </div>
                        )}
                      </Field>
                    </div>
                    <div>
                      <Label htmlFor="website" className="mb-2">
                        Website
                      </Label>
                      <Field
                        name="website"
                        id="website"
                        as="input"
                        type="text"
                        placeholder="Website"
                      />
                      <ErrorMessage
                        name="website"
                        component="div"
                        className="text-danger mt-1 text-xs"
                      />
                    </div>
                  </div>
                  {/* Navigation buttons for 2nd tab */}
                  <div className="mt-6 flex items-center justify-between gap-3">
                    <div className="">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab("basic-info")}
                      >
                        Previous
                      </Button>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={async () => {
                          const isValid = await validateContacts(values);
                          if (isValid) {
                            setActiveTab("address");
                          } else {
                            const basicFields = ["email", "phone", "website"];
                            basicFields.forEach((field) =>
                              setFieldTouched(field, true),
                            );
                            toast.error(
                              "Please fill in all required fields before proceeding",
                            );
                          }
                        }}
                        className="w-32 text-white"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="address" className="space-y-4">
                  <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="street" className="mb-2">
                        Street<span className="text-danger">*</span>
                      </Label>
                      <Field
                        name="street"
                        id="street"
                        as="input"
                        type="text"
                        placeholder="Street"
                      />
                      <ErrorMessage
                        name="street"
                        component="div"
                        className="text-danger mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city" className="mb-2">
                        City<span className="text-danger">*</span>
                      </Label>
                      <Field
                        name="city"
                        id="city"
                        as="input"
                        type="text"
                        placeholder="City"
                      />
                      <ErrorMessage
                        name="city"
                        component="div"
                        className="text-danger mt-1 text-xs"
                      />
                    </div>
                  </div>
                  <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="postal_code" className="mb-2">
                        Postal Code<span className="text-danger">*</span>
                      </Label>
                      <Field
                        name="postal_code"
                        id="postal_code"
                        as="input"
                        type="text"
                        placeholder="Postal Code"
                      />
                      <ErrorMessage
                        name="postal_code"
                        component="div"
                        className="text-danger mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country" className="mb-2">
                        Country<span className="text-danger">*</span>
                      </Label>
                      <Field name="country" id="country" as="select">
                        <option value="" disabled>
                          Select a country
                        </option>
                        {countries.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.name}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage
                        name="country"
                        component="div"
                        className="text-danger mt-1 text-xs"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="address" className="mb-2">
                      Google Location Link (optional)
                    </Label>
                    <Field
                      name="address"
                      id="address"
                      as="input"
                      type="text"
                      placeholder="https://maps.google.com/..."
                    />
                    <ErrorMessage
                      name="address"
                      component="div"
                      className="text-danger mt-1 text-xs"
                    />
                  </div>
                  {/* Navigation buttons for 3rd tab */}
                  <div className="mt-6 flex items-center justify-between gap-3">
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab("contacts")}
                      >
                        Previous
                      </Button>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={async () => {
                          const isValid = await validateAddress(values);
                          if (isValid) {
                            setActiveTab("opening-hours");
                          } else {
                            const basicFields = [
                              "street",
                              "city",
                              "postal_code",
                              "country",
                            ];
                            basicFields.forEach((field) =>
                              setFieldTouched(field, true),
                            );
                            toast.error(
                              "Please fill in all required fields before proceeding",
                            );
                          }
                        }}
                        className="w-32 text-white"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="opening-hours" className="space-y-4">
                  {/* Opening hours editor */}
                  <div className="mb-6">
                    <h3 className="mb-3 text-sm font-medium">Opening Hours</h3>
                    <div className="bg-card rounded-md border p-4">
                      <FieldArray name="opening_hours">
                        {() => (
                          <div className="space-y-3">
                            {/** header row */}
                            <div className="text-muted-foreground grid grid-cols-12 gap-2 px-2 py-2 text-xs">
                              <div className="col-span-3">Day</div>
                              <div className="col-span-2">Opening</div>
                              <div className="col-span-2">Closing</div>
                              <div className="col-span-2">Break Start</div>
                              <div className="col-span-2">Break End</div>
                              <div className="col-span-1 text-right">
                                Closed
                              </div>
                            </div>

                            <Field name="opening_hours">
                              {({
                                form,
                              }: {
                                form: FormikProps<SalonProps>;
                              }) => (
                                <>
                                  {form.values.opening_hours.map(
                                    (oh: OpeningHour, idx: number) => (
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

                                        <div className="col-span-1 flex justify-end">
                                          <Field
                                            name={`opening_hours.${idx}.is_closed`}
                                          >
                                            {({ field, form }: FieldProps) => (
                                              <Switch
                                                checked={Boolean(field.value)}
                                                onCheckedChange={(
                                                  v: boolean,
                                                ) => {
                                                  // Toggle closed flag
                                                  form.setFieldValue(
                                                    field.name,
                                                    v,
                                                  );

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
                                                    // When reopening, restore sensible defaults
                                                    const current =
                                                      form.values.opening_hours[
                                                        idx
                                                      ];
                                                    // Only restore if times are currently 00:00 or falsy
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
                    </div>
                  </div>

                  {/* Navigation buttons for final tab */}
                  <div className="mt-6 flex justify-between gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("address")}
                    >
                      Previous
                    </Button>
                    <div className="flex gap-3">
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
                        {isLoading ? "Adding..." : "Add New Salon"}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </FormikForm>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default AddSalonDialog;
