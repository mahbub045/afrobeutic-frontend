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
import { useAddSalonMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/SalonApis";
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
import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import { toast } from "react-toastify";
import * as Yup from "yup";

interface AddSalonDialogProps {
  isOpen: boolean;
  onClose: () => void;
}
interface AddSalonProps {
  name: string;
  salon_type: string;
  email: string;
  phone: string;
  website: string;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  latitude: number;
  longitude: number;
  status: string;
  opening_hours: OpeningHour[];
}

type OpeningHour = {
  day: string;
  opening_start_time: string;
  opening_end_time: string;
  break_start_time?: string;
  break_end_time?: string;
  is_closed: boolean;
};

type FormValues = {
  name: string;
  salon_type: string;
  email: string;
  phone: string;
  country_dial_code?: string;
  website: string;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  latitude: number;
  longitude: number;
  status: string;
  opening_hours: OpeningHour[];
};

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

// Validation schema for basic information (first tab)
const basicInfoValidationSchema = Yup.object().shape({
  name: Yup.string().required("Salon name is required"),
  salon_type: Yup.string().required("Salon type is required"),
  email: Yup.string().required("Email is required").email("Invalid email"),
  phone: Yup.string().required("Phone number is required"),
  website: Yup.string().url("Invalid URL"),
  status: Yup.string().required("Status is required"),
  street: Yup.string().required("Street is required"),
  city: Yup.string().required("City is required"),
  postal_code: Yup.string().required("Postal code is required"),
  country: Yup.string().required("Country is required"),
  latitude: Yup.number().required("Latitude is required"),
  longitude: Yup.number().required("Longitude is required"),
});

// Full validation schema for form submission
const validationSchema = Yup.object().shape({
  name: Yup.string().required("Salon name is required"),
  salon_type: Yup.string().required("Salon type is required"),
  email: Yup.string().required("Email is required").email("Invalid email"),
  phone: Yup.string().required("Phone number is required"),
  website: Yup.string().url("Invalid URL"),
  status: Yup.string().required("Status is required"),
  street: Yup.string().required("Street is required"),
  city: Yup.string().required("City is required"),
  postal_code: Yup.string().required("Postal code is required"),
  country: Yup.string().required("Country is required"),
  latitude: Yup.number().required("Latitude is required"),
  longitude: Yup.number().required("Longitude is required"),
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

  const handleSubmit = async (formData: FormValues) => {
    try {
      // Transform the data to match API payload format
      const payload: Partial<AddSalonProps> & {
        name: string;
        salon_type: string;
        email: string;
        phone: string;
        status: string;
        country_dial_code?: string;
      } = {
        name: formData.name,
        salon_type: formData.salon_type,
        email: formData.email,
        // PhoneInput returns full phone string (includes +countrycode) in the phone field
        phone: formData.phone, // already includes country dial code when entered via PhoneInput
        country_dial_code: formData.country_dial_code,
        website: formData.website,
        street: formData.street,
        city: formData.city,
        postal_code: formData.postal_code,
        country: formData.country,
        latitude: formData.latitude,
        longitude: formData.longitude,
        status: formData.status,
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
      onClose();
      toast.success("Salon added successfully");
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

  const hours = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0"),
  );
  const minutes = ["00", "15", "30", "45"];

  // Function to validate basic info fields
  const validateBasicInfo = async (values: FormValues): Promise<boolean> => {
    try {
      await basicInfoValidationSchema.validate(
        {
          name: values.name,
          salon_type: values.salon_type,
          email: values.email,
          phone: values.phone,
          website: values.website,
          status: values.status,
          street: values.street,
          city: values.city,
          postal_code: values.postal_code,
          country: values.country,
          latitude: values.latitude,
          longitude: values.longitude,
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
            latitude: 0,
            longitude: 0,
            status: "OPEN",
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
          onSubmit={handleSubmit}
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
                      <Label htmlFor="status" className="mb-2">
                        Status
                      </Label>
                      <Field id="status" name="status" as="select" required>
                        <option value="" disabled>
                          Select a status
                        </option>
                        <option value="OPEN">Open</option>
                        <option value="CLOSED">Closed</option>
                      </Field>
                      <ErrorMessage
                        name="status"
                        component="div"
                        className="text-danger mt-1 text-xs"
                      />
                    </div>
                  </div>
                  <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
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
                              // Add classes to customize dropdown and search icon via global CSS
                              dropdownClass="afb-phone-dropdown"
                              searchClass="afb-phone-search"
                              // Inline styles ensure the phone input uses CSS variables
                              // even when Tailwind utilities are not applied by the component
                              inputClass="!w-full !h-auto px-3 py-2 rounded-md"
                              inputStyle={{
                                background: "var(--input)",
                                color: "var(--foreground)",
                                borderColor: "var(--border)",
                                outline: "none",
                              }}
                              // Flag button inline styling
                              buttonClass=""
                              buttonStyle={{
                                background: "var(--input)",
                                color: "var(--foreground)",
                                borderRight: "1px solid var(--border)",
                              }}
                              // Country dropdown list inline style
                              dropdownStyle={{
                                background: "var(--card)",
                                color: "var(--card-foreground)",
                                border: "1px solid var(--border)",
                                // maxHeight: "200px",
                              }}
                              // Search input styling
                              searchStyle={{
                                background: "var(--card)",
                                color: "var(--card-foreground)",
                                borderColor: "var(--border)",
                                outline: "none",
                                padding: "8px 12px",
                                fontSize: "14px",
                              }}
                              containerClass="w-full"
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
                  <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="latitude" className="mb-2">
                        Latitude<span className="text-danger">*</span>
                      </Label>
                      <Field
                        name="latitude"
                        id="latitude"
                        as="input"
                        type="number"
                        placeholder="Latitude"
                      />
                      <ErrorMessage
                        name="latitude"
                        component="div"
                        className="text-danger mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label htmlFor="longitude" className="mb-2">
                        Longitude<span className="text-danger">*</span>
                      </Label>
                      <Field
                        name="longitude"
                        id="longitude"
                        as="input"
                        type="number"
                        placeholder="Longitude"
                      />
                      <ErrorMessage
                        name="longitude"
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
                          setActiveTab("opening-hours");
                        } else {
                          // Mark all basic info fields as touched to show validation errors
                          const basicFields = [
                            "name",
                            "salon_type",
                            "email",
                            "phone",
                            "website",
                            "status",
                            "street",
                            "city",
                            "postal_code",
                            "country",
                            "latitude",
                            "longitude",
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
                                form: FormikProps<AddSalonProps>;
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
                                              className="w-full"
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
                                              className="w-full"
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
                                              className="w-full"
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
                                              className="w-full"
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
                                            {({ field }: FieldProps) => (
                                              <Switch
                                                checked={Boolean(field.value)}
                                                onCheckedChange={(
                                                  v: boolean,
                                                ) => {
                                                  form.setFieldValue(
                                                    field.name,
                                                    v,
                                                  );
                                                  // When closed is toggled, set times to 00:00
                                                  if (v) {
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

                  {/* Navigation buttons for second tab */}
                  <div className="mt-6 flex justify-between gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("basic-info")}
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
