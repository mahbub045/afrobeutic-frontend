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
const salonDetailsValidationSchema = Yup.object().shape({
  name: Yup.string().required("Salon name is required"),
  salon_type: Yup.string().required("Salon type is required"),
});

// Validation schema for basic info tab
const basicInfoValidationSchema = Yup.object().shape({
  is_provide_hair_styles: Yup.boolean()
    .nullable()
    .required("Please indicate whether the salon provides hair styles"),
});

const servicesValidationSchema = Yup.object().shape({
  is_provide_hair_styles: Yup.boolean()
    .nullable()
    .required("Please indicate whether the salon provides hair styles"),
  is_provide_bridal_makeup_services: Yup.boolean()
    .nullable()
    .when(["is_provide_hair_styles", "salon_service_types"], {
      is: (
        isProvideHairStyles: boolean | null,
        salonServiceTypes?: unknown,
      ) => {
        const selectedCount = Array.isArray(salonServiceTypes)
          ? salonServiceTypes.length
          : 0;
        return (
          isProvideHairStyles === false ||
          (isProvideHairStyles === true && selectedCount > 0)
        );
      },
      then: (schema) =>
        schema.required(
          "Please indicate whether the salon provides Bridal / Makeup services",
        ),
      otherwise: (schema) => schema.notRequired(),
    }),
  salon_service_types: Yup.array()
    .of(Yup.string().required())
    .when("is_provide_hair_styles", {
      is: true,
      then: (schema) =>
        schema
          .min(1, "Please select at least one hair texture")
          .required("Please select at least one hair texture"),
      otherwise: (schema) => schema.notRequired(),
    }),
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

const salonCategoryValidationSchema = Yup.object().shape({
  salon_category: Yup.string().required("Salon category is required"),
});

// Full validation schema for form submission
const validationSchema = Yup.object().shape({
  salon_category: Yup.string().required("Salon category is required"),
  name: Yup.string().required("Salon name is required"),
  salon_type: Yup.string().required("Salon type is required"),
  is_provide_hair_styles: Yup.boolean()
    .nullable()
    .required("Please indicate whether the salon provides hair styles"),
  is_provide_bridal_makeup_services: Yup.boolean()
    .nullable()
    .when(["is_provide_hair_styles", "salon_service_types"], {
      is: (
        isProvideHairStyles: boolean | null,
        salonServiceTypes?: unknown,
      ) => {
        const selectedCount = Array.isArray(salonServiceTypes)
          ? salonServiceTypes.length
          : 0;
        return (
          isProvideHairStyles === false ||
          (isProvideHairStyles === true && selectedCount > 0)
        );
      },
      then: (schema) =>
        schema.required(
          "Please indicate whether the salon provides Bridal / Makeup services",
        ),
      otherwise: (schema) => schema.notRequired(),
    }),
  salon_service_types: Yup.array()
    .of(Yup.string().required())
    .when("is_provide_hair_styles", {
      is: true,
      then: (schema) =>
        schema
          .min(1, "Please select at least one hair texture")
          .required("Please select at least one hair texture"),
      otherwise: (schema) => schema.notRequired(),
    }),
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
      opening_time: Yup.string().when("is_closed", {
        is: false,
        then: (schema) => schema.required("Opening time is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
      closing_time: Yup.string()
        .when("is_closed", {
          is: false,
          then: (schema) => schema.required("Closing time is required"),
          otherwise: (schema) => schema.notRequired(),
        })
        .test(
          "is-after-opening",
          "Closing time must be after opening time",
          function (value) {
            const { opening_time, is_closed } = this.parent;
            if (is_closed || !opening_time || !value) return true;
            return getTimeDifference(opening_time, value) > 0;
          },
        ),

      is_closed: Yup.boolean(),
    }),
  ),
});

const AddSalonDialog: React.FC<AddSalonDialogProps> = ({ isOpen, onClose }) => {
  const { resolvedTheme } = useTheme();
  const [addSalon, { isLoading }] = useAddSalonMutation();
  const [activeTab, setActiveTab] = useState("salon-category");
  const [showBridalInServicesTab, setShowBridalInServicesTab] = useState(false);

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
        phone_number_one: string;
        country_dial_code?: string;
      } = {
        name: formData.name,
        salon_type: formData.salon_type,
        is_provide_hair_styles: formData.is_provide_hair_styles ?? false,
        is_provide_bridal_makeup_services:
          formData.is_provide_bridal_makeup_services ?? false,
        salon_service_types: formData.salon_service_types,
        salon_category: formData.salon_category,
        email: formData.email,
        phone_number_one: formData.phone_number_one,
        country_dial_code: formData.country_dial_code,
        website: formData.website,
        street: formData.street,
        city: formData.city,
        postal_code: formData.postal_code,
        country: formData.country,
        address: formData.address,
        opening_hours: formData.opening_hours.map((oh) => ({
          day: oh.day,
          opening_time: convertTimeToAPIFormat(oh.opening_time),
          closing_time: convertTimeToAPIFormat(oh.closing_time),
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
        timer: 2000,
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
  const salonCategories = [
    { value: "GENERAL_SALON", label: "General Salon" },
    {
      value: "MOBILE_OR_HOME_SERVICE_SALON",
      label: "Mobile or Home Service Salon",
    },
    { value: "OCCASIONALLY_BOTH", label: "Occasionally Both" },
  ];
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
    { id: "salon-category", label: "Salon Category" },
    { id: "is_provide_hair_styles", label: "Provide Hair Styles" },
    { id: "services", label: "Services" },
    { id: "service-options", label: "Service Options" },
    { id: "salon-details", label: "Salon Details" },
    { id: "contacts", label: "Contacts" },
    { id: "address", label: "Address" },
    { id: "opening-hours", label: "Opening Hours" },
  ];
  const currentIndex = Math.max(
    0,
    tabList.findIndex((t) => t.id === activeTab),
  );

  const validateSalonCategory = async (
    values: FormValues,
  ): Promise<boolean> => {
    try {
      await salonCategoryValidationSchema.validate(
        { salon_category: values.salon_category },
        { abortEarly: false },
      );
      return true;
    } catch {
      return false;
    }
  };

  const validateSalonDetails = async (values: FormValues): Promise<boolean> => {
    try {
      await salonDetailsValidationSchema.validate(
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

  const validateBasicInfo = async (values: FormValues): Promise<boolean> => {
    try {
      await basicInfoValidationSchema.validate(
        {
          is_provide_hair_styles: values.is_provide_hair_styles,
        },
        { abortEarly: false },
      );
      return true;
    } catch {
      return false;
    }
  };

  const validateServices = async (values: FormValues): Promise<boolean> => {
    try {
      await servicesValidationSchema.validate(
        {
          is_provide_hair_styles: values.is_provide_hair_styles,
          is_provide_bridal_makeup_services:
            values.is_provide_bridal_makeup_services,
          salon_service_types: values.salon_service_types,
        },
        { abortEarly: false },
      );
      return true;
    } catch {
      return false;
    }
  };

  const validateServiceTypesOnly = async (
    values: FormValues,
  ): Promise<boolean> => {
    try {
      await Yup.object()
        .shape({
          salon_service_types: Yup.array()
            .of(Yup.string().required())
            .min(1, "Please select at least one hair texture")
            .required("Please select at least one hair texture"),
        })
        .validate(
          { salon_service_types: values.salon_service_types },
          { abortEarly: false },
        );
      return true;
    } catch {
      return false;
    }
  };

  const validateBridalOnly = async (values: FormValues): Promise<boolean> => {
    try {
      await Yup.object()
        .shape({
          is_provide_bridal_makeup_services: Yup.boolean()
            .nullable()
            .required(
              "Please indicate whether the salon provides Bridal / Makeup services",
            ),
        })
        .validate(
          {
            is_provide_bridal_makeup_services:
              values.is_provide_bridal_makeup_services,
          },
          { abortEarly: false },
        );
      return true;
    } catch {
      return false;
    }
  };

  const validateServiceOptionsStep = async (
    values: FormValues,
  ): Promise<boolean> => {
    try {
      if (values.is_provide_bridal_makeup_services === true) {
        await Yup.object()
          .shape({
            bridal_makeup_service_types: Yup.array()
              .of(Yup.string().required())
              .min(1, "Please select at least one option")
              .required("Please select at least one option"),
          })
          .validate(
            {
              bridal_makeup_service_types: values.bridal_makeup_service_types,
            },
            { abortEarly: false },
          );
        return true;
      }

      await Yup.object()
        .shape({
          additional_service_types: Yup.array()
            .of(Yup.string().required())
            .min(1, "Please select at least one option")
            .required("Please select at least one option"),
        })
        .validate(
          { additional_service_types: values.additional_service_types },
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
          phone: values.phone_number_one,
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
      <DialogContent className="flex !max-w-xl flex-col p-0 shadow-md sm:!max-w-2xl md:!max-w-3xl dark:shadow-gray-600">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-primary text-2xl">
            Add New Salon
          </DialogTitle>
          <DialogDescription className="text-xs">
            Fill in the details to add a new salon.
          </DialogDescription>
        </DialogHeader>
        <div className="flex h-[80vh] flex-col items-center justify-start overflow-y-auto px-6 py-4">
          {/* Step indicator (top-right) */}
          <div className="mb-4 flex w-full justify-end">
            <div className="text-muted-foreground text-sm font-medium">
              Step {currentIndex + 1} of {tabList.length}
            </div>
          </div>
          {/* Formik form for adding a new salon goes here */}
          <Formik<FormValues>
            initialValues={{
              salon_category: "",
              is_provide_hair_styles: null,
              is_provide_bridal_makeup_services: null,
              salon_service_types: [],
              bridal_makeup_service_types: [],
              additional_service_types: [],
              name: "",
              salon_type: "",
              email: "",
              phone_number_one: "",
              country_dial_code: "",
              website: "",
              street: "",
              city: "",
              postal_code: "",
              country: "",
              address: "",
              opening_hours: days.map((d) => ({
                day: d,
                opening_time: "08:00",
                closing_time: "22:00",
                is_closed: false,
              })),
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, { resetForm, setSubmitting }) => {
              setSubmitting(true);
              const success = await handleSubmit(values);
              setSubmitting(false);
              if (success) {
                resetForm();
                setActiveTab("salon-category");
                onClose();
              }
            }}
          >
            {({ values, setFieldTouched }) => (
              <FormikForm className="flex w-full flex-1 flex-col items-center">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="flex w-full max-w-2xl flex-1 flex-col"
                >
                  <TabsContent
                    value="salon-category"
                    className="flex flex-1 flex-col justify-center space-y-6"
                  >
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        Please choose which best describes your salon
                      </h3>
                      <div className="grid gap-3">
                        {salonCategories.map((category) => (
                          <label
                            key={category.value}
                            className="border-border hover:border-primary flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold transition"
                          >
                            <Field
                              type="radio"
                              name="salon_category"
                              value={category.value}
                              className="accent-primary h-4 w-4"
                            />
                            <span>{category.label}</span>
                          </label>
                        ))}
                      </div>
                      <ErrorMessage
                        name="salon_category"
                        component="div"
                        className="text-danger mt-1 text-xs"
                      />
                    </div>
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
                          const isValid = await validateSalonCategory(values);
                          if (isValid) {
                            setActiveTab("is_provide_hair_styles");
                          } else {
                            setFieldTouched("salon_category", true);
                            toast.error(
                              "Please choose a salon category before proceeding",
                            );
                          }
                        }}
                        className="w-32 text-white"
                      >
                        Next
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="is_provide_hair_styles"
                    className="flex flex-1 flex-col justify-center space-y-4"
                  >
                    <div className="flex justify-center space-y-3">
                      <div className="flex flex-col justify-center">
                        <Label className="mb-2">
                          Does this salon provide hair styles?
                          <span className="text-danger">*</span>
                        </Label>
                        <Field name="is_provide_hair_styles">
                          {({
                            field,
                            form,
                          }: {
                            field: FieldInputProps<boolean | null>;
                            form: FormikProps<FormValues>;
                          }) => (
                            <div className="flex flex-wrap items-center gap-4">
                              {[
                                { label: "Yes", value: true },
                                { label: "No", value: false },
                              ].map(({ label, value }) => (
                                <label
                                  key={label}
                                  className="border-border hover:border-primary flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition"
                                >
                                  <input
                                    type="radio"
                                    name={field.name}
                                    checked={field.value === value}
                                    onChange={() => {
                                      form.setFieldValue(field.name, value);
                                      setShowBridalInServicesTab(false);
                                      // Reset dependent fields when switching path
                                      if (value === false) {
                                        form.setFieldValue(
                                          "salon_service_types",
                                          [],
                                        );
                                        form.setFieldValue(
                                          "is_provide_bridal_makeup_services",
                                          null,
                                        );
                                      }
                                      if (value === true) {
                                        form.setFieldValue(
                                          "is_provide_bridal_makeup_services",
                                          null,
                                        );
                                      }
                                    }}
                                    className="accent-primary h-4 w-4"
                                  />
                                  <span>{label}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </Field>
                        <ErrorMessage
                          name="is_provide_hair_styles"
                          component="div"
                          className="text-danger mt-1 text-xs"
                        />
                      </div>
                    </div>
                    {/* Navigation buttons for first tab */}
                    <div className="mt-6 flex items-center justify-between gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab("salon-category")}
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
                          type="button"
                          onClick={async () => {
                            const isValid = await validateBasicInfo(values);
                            if (isValid) {
                              setShowBridalInServicesTab(false);
                              setActiveTab("services");
                            } else {
                              const basicFields = ["is_provide_hair_styles"];
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

                  <TabsContent
                    value="services"
                    className="flex flex-1 flex-col justify-center space-y-6"
                  >
                    <div className="flex justify-center space-y-6">
                      {values.is_provide_hair_styles === false && (
                        <div className="flex flex-col justify-center space-y-3">
                          <Label className="mb-2">
                            Does this salon provide Bridal / Makeup services?
                            <span className="text-danger">*</span>
                          </Label>
                          <Field name="is_provide_bridal_makeup_services">
                            {({
                              field,
                              form,
                            }: {
                              field: FieldInputProps<boolean | null>;
                              form: FormikProps<FormValues>;
                            }) => (
                              <div className="flex flex-wrap items-center gap-4">
                                {[
                                  { label: "Yes", value: true },
                                  { label: "No", value: false },
                                ].map(({ label, value }) => (
                                  <label
                                    key={label}
                                    className="border-border hover:border-primary flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition"
                                  >
                                    <input
                                      type="radio"
                                      name={field.name}
                                      checked={field.value === value}
                                      onChange={() => {
                                        form.setFieldValue(field.name, value);
                                        form.setFieldValue(
                                          "bridal_makeup_service_types",
                                          [],
                                        );
                                        form.setFieldValue(
                                          "additional_service_types",
                                          [],
                                        );
                                      }}
                                      className="accent-primary h-4 w-4"
                                    />
                                    <span>{label}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </Field>
                          <ErrorMessage
                            name="is_provide_bridal_makeup_services"
                            component="div"
                            className="text-danger mt-1 text-xs"
                          />
                        </div>
                      )}
                      {values.is_provide_hair_styles === true && (
                        <div className="space-y-6">
                          {!showBridalInServicesTab && (
                            <div className="space-y-3">
                              <Label className="mb-2">
                                Which hair textures does your salon provide
                                services for?
                                <span className="text-danger">*</span>
                              </Label>
                              <div className="space-y-2">
                                {[
                                  {
                                    value: "AFRO_TEXTURED",
                                    label:
                                      "Afro-textured (kinky / coily / natural hair)",
                                  },
                                  { value: "CURLY", label: "Curly" },
                                  { value: "WAVY", label: "Wavy" },
                                  { value: "STRAIGHT", label: "Straight" },
                                  { value: "NOT_SURE", label: "Not sure" },
                                ].map((opt) => (
                                  <label
                                    key={opt.value}
                                    className="flex cursor-pointer items-center gap-3 text-sm"
                                  >
                                    <Field
                                      type="checkbox"
                                      name="salon_service_types"
                                      value={opt.value}
                                      className="accent-primary h-4 w-4"
                                    />
                                    <span>{opt.label}</span>
                                  </label>
                                ))}
                              </div>
                              <ErrorMessage
                                name="salon_service_types"
                                component="div"
                                className="text-danger mt-1 text-xs"
                              />
                            </div>
                          )}

                          {showBridalInServicesTab && (
                            <div className="flex flex-col justify-center space-y-3">
                              <Label className="mb-2">
                                Does this salon provide Bridal / Makeup
                                services?
                                <span className="text-danger">*</span>
                              </Label>
                              <Field name="is_provide_bridal_makeup_services">
                                {({
                                  field,
                                  form,
                                }: {
                                  field: FieldInputProps<boolean | null>;
                                  form: FormikProps<FormValues>;
                                }) => (
                                  <div className="flex flex-wrap items-center gap-4">
                                    {[
                                      { label: "Yes", value: true },
                                      { label: "No", value: false },
                                    ].map(({ label, value }) => (
                                      <label
                                        key={label}
                                        className="border-border hover:border-primary flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition"
                                      >
                                        <input
                                          type="radio"
                                          name={field.name}
                                          checked={field.value === value}
                                            onChange={() => {
                                              form.setFieldValue(
                                                field.name,
                                                value,
                                              );
                                              form.setFieldValue(
                                                "bridal_makeup_service_types",
                                                [],
                                              );
                                              form.setFieldValue(
                                                "additional_service_types",
                                                [],
                                              );
                                            }}
                                          className="accent-primary h-4 w-4"
                                        />
                                        <span>{label}</span>
                                      </label>
                                    ))}
                                  </div>
                                )}
                              </Field>
                              <ErrorMessage
                                name="is_provide_bridal_makeup_services"
                                component="div"
                                className="text-danger mt-1 text-xs"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowBridalInServicesTab(false);
                          setActiveTab("is_provide_hair_styles");
                        }}
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
                          type="button"
                          onClick={async () => {
                            if (values.is_provide_hair_styles === true) {
                              if (!showBridalInServicesTab) {
                                const typesValid =
                                  await validateServiceTypesOnly(values);
                                if (typesValid) {
                                  setShowBridalInServicesTab(true);
                                } else {
                                  setFieldTouched("salon_service_types", true);
                                  toast.error(
                                    "Please select at least one hair texture before proceeding",
                                  );
                                }
                                return;
                              }

                              const typesValid =
                                await validateServiceTypesOnly(values);
                              const bridalValid =
                                await validateBridalOnly(values);

                              if (typesValid && bridalValid) {
                                setActiveTab("service-options");
                              } else {
                                if (!typesValid) {
                                  setFieldTouched("salon_service_types", true);
                                }
                                if (!bridalValid) {
                                  setFieldTouched(
                                    "is_provide_bridal_makeup_services",
                                    true,
                                  );
                                }
                                toast.error(
                                  "Please fill in all required fields before proceeding",
                                );
                              }
                              return;
                            }

                            const isValid = await validateServices(values);
                            if (isValid) {
                              setActiveTab("service-options");
                            } else {
                              const serviceFields: string[] = [
                                "is_provide_bridal_makeup_services",
                              ];
                              serviceFields.forEach((field) =>
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

                  <TabsContent
                    value="service-options"
                    className="flex flex-1 flex-col justify-center space-y-6"
                  >
                    <div className="space-y-6">
                      {values.is_provide_bridal_makeup_services === true ? (
                        <div className="space-y-3">
                          <h3 className="text-base font-semibold tracking-tight">
                            Which Bridal / Makeup services does your salon
                            provide?
                          </h3>
                          <div className="space-y-2">
                            {[
                              { value: "BRIDAL_MAKEUP", label: "Bridal makeup" },
                              {
                                value: "ENGAGEMENT_PRE_WEDDING_MAKEUP",
                                label: "Engagement / pre-wedding makeup",
                              },
                              {
                                value: "PARTY_EVENING_MAKEUP",
                                label: "Party / evening makeup",
                              },
                              {
                                value: "PHOTOSHOOT_EDITORIAL_MAKEUP",
                                label: "Photoshoot / editorial makeup",
                              },
                              {
                                value: "TRADITIONAL_CULTURAL_BRIDAL_MAKEUP",
                                label: "Traditional / cultural bridal makeup",
                              },
                              {
                                value: "HD_AIRBRUSH_MAKEUP",
                                label: "HD / airbrush makeup",
                              },
                              {
                                value: "HAIR_STYLING_FOR_BRIDAL_CLIENTS",
                                label: "Hair styling for bridal clients",
                              },
                              {
                                value: "GROOM_MAKEUP_GROOMING",
                                label: "Groom makeup / grooming",
                              },
                              { value: "NOT_SURE", label: "Not sure" },
                            ].map((opt) => (
                              <label
                                key={opt.value}
                                className="flex cursor-pointer items-center gap-3 text-sm"
                              >
                                <Field
                                  type="checkbox"
                                  name="bridal_makeup_service_types"
                                  value={opt.value}
                                  className="accent-primary h-4 w-4"
                                />
                                <span>{opt.label}</span>
                              </label>
                            ))}
                          </div>
                          <ErrorMessage
                            name="bridal_makeup_service_types"
                            component="div"
                            className="text-danger mt-1 text-xs"
                          />
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <h3 className="text-base font-semibold tracking-tight">
                            Please confirm which services your salon also
                            includes
                          </h3>
                          <div className="space-y-2">
                            {[
                              { value: "BEAUTY_SERVICES", label: "Beauty services" },
                              { value: "NAIL_SERVICES", label: "Nail services" },
                              { value: "SPA_SERVICES", label: "Spa services" },
                              {
                                value: "NONE_OF_THE_ABOVE",
                                label: "None of the above",
                              },
                            ].map((opt) => (
                              <label
                                key={opt.value}
                                className="flex cursor-pointer items-center gap-3 text-sm"
                              >
                                <Field
                                  type="checkbox"
                                  name="additional_service_types"
                                  value={opt.value}
                                  className="accent-primary h-4 w-4"
                                />
                                <span>{opt.label}</span>
                              </label>
                            ))}
                          </div>
                          <ErrorMessage
                            name="additional_service_types"
                            component="div"
                            className="text-danger mt-1 text-xs"
                          />
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (values.is_provide_hair_styles === true) {
                            setShowBridalInServicesTab(true);
                          }
                          setActiveTab("services");
                        }}
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
                          type="button"
                          onClick={async () => {
                            const isValid =
                              await validateServiceOptionsStep(values);
                            if (isValid) {
                              setActiveTab("salon-details");
                            } else {
                              if (values.is_provide_bridal_makeup_services === true) {
                                setFieldTouched(
                                  "bridal_makeup_service_types",
                                  true,
                                );
                              } else {
                                setFieldTouched(
                                  "additional_service_types",
                                  true,
                                );
                              }
                              toast.error(
                                "Please select at least one option before proceeding",
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

                  <TabsContent
                    value="salon-details"
                    className="flex flex-1 flex-col justify-center space-y-4"
                  >
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

                    <div className="mt-6 flex items-center justify-between gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab("services")}
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
                          type="button"
                          onClick={async () => {
                            const isValid = await validateSalonDetails(values);
                            if (isValid) {
                              setActiveTab("contacts");
                            } else {
                              const detailFields = ["name", "salon_type"];
                              detailFields.forEach((field) =>
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

                  <TabsContent
                    value="contacts"
                    className="flex flex-1 flex-col justify-center space-y-4"
                  >
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
                                      !numeric.startsWith(
                                        dial.replace(/\D/g, ""),
                                      )
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
                                    !form.values.phone_number_one?.startsWith(
                                      dial,
                                    )
                                  ) {
                                    const numeric = (
                                      form.values.phone_number_one || ""
                                    ).replace(/[^0-9]/g, "");
                                    form.setFieldValue(
                                      "phone_number_one",
                                      `${dial}${numeric}`,
                                    );
                                  }
                                }}
                                inputProps={{
                                  name: field.name,
                                  required: true,
                                }}
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
                          onClick={() => setActiveTab("salon-details")}
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
                  <TabsContent
                    value="address"
                    className="flex flex-1 flex-col justify-center space-y-4"
                  >
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

                  <TabsContent
                    value="opening-hours"
                    className="flex flex-1 flex-col justify-start space-y-4"
                  >
                    {/* Opening hours editor */}
                    <div className="mb-6">
                      <h3 className="mb-4 text-base font-semibold tracking-tight">
                        Opening Hours
                      </h3>
                      <div className="bg-card rounded-lg border p-0 shadow-sm">
                        <FieldArray name="opening_hours">
                          {() => (
                            <div className="space-y-0">
                              {/** header row */}
                              <div className="text-muted-foreground bg-muted/50 grid grid-cols-12 gap-2 border-b px-4 py-3 text-xs font-semibold tracking-wide uppercase">
                                <div className="col-span-2">Day</div>
                                <div className="col-span-4">Opening</div>
                                <div className="col-span-4">Closing</div>
                                <div className="col-span-2 text-center">
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
                                                name={`opening_hours.${idx}.opening_time`}
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
                                              name={`opening_hours.${idx}.opening_time`}
                                              component="div"
                                              className="text-danger mt-1 text-xs"
                                            />
                                          </div>

                                          {/* Closing time */}
                                          <div className="col-span-4">
                                            <div className="flex items-center gap-1">
                                              <Field
                                                as="select"
                                                name={`opening_hours.${idx}.closing_time`}
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
                                              name={`opening_hours.${idx}.closing_time`}
                                              component="div"
                                              className="text-danger mt-1 text-xs"
                                            />
                                          </div>

                                          <div className="col-span-2 flex justify-center">
                                            <Field
                                              name={`opening_hours.${idx}.is_closed`}
                                            >
                                              {({
                                                field,
                                                form,
                                              }: FieldProps) => (
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
                                                        `opening_hours.${idx}.opening_time`,
                                                        "00:00",
                                                      );
                                                      form.setFieldValue(
                                                        `opening_hours.${idx}.closing_time`,
                                                        "00:00",
                                                      );
                                                    } else {
                                                      // When reopening, restore sensible defaults
                                                      const current =
                                                        form.values
                                                          .opening_hours[idx];
                                                      // Only restore if times are currently 00:00 or falsy
                                                      if (
                                                        !current.opening_time ||
                                                        current.opening_time ===
                                                          "00:00"
                                                      ) {
                                                        form.setFieldValue(
                                                          `opening_hours.${idx}.opening_time`,
                                                          "08:00",
                                                        );
                                                      }
                                                      if (
                                                        !current.closing_time ||
                                                        current.closing_time ===
                                                          "00:00"
                                                      ) {
                                                        form.setFieldValue(
                                                          `opening_hours.${idx}.closing_time`,
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddSalonDialog;
