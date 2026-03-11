import AddressPickerDialog from "@/components/Location/AddressPickerDialog";
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
  FormikErrors,
  Form as FormikForm,
  FormikProps,
} from "formik";
import { useSession } from "next-auth/react";
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

// Validation schema for salon details tab (basic info only)
const salonDetailsValidationSchema = Yup.object().shape({
  name: Yup.string().required("Salon name is required"),
  formatted_address: Yup.string(),
  google_place_id: Yup.string(),
  city: Yup.string().required("City is required"),
  postal_code: Yup.string().required("Postal code is required"),
  country: Yup.string().required("Country is required"),
  latitude: Yup.number().required("Latitude is required"),
  longitude: Yup.number().required("Longitude is required"),
});

// Validation schema for contacts and social links tab
const contactsValidationSchema = Yup.object().shape({
  email: Yup.string().required("Email is required").email("Invalid email"),
  phone_number_one: Yup.string().required("Phone number is required"),
  phone_number_two: Yup.string(),
  facebook: Yup.string().url("Invalid URL"),
  instagram: Yup.string().url("Invalid URL"),
  youtube: Yup.string().url("Invalid URL"),
});

// Validation schema for salon type tab
const salonTypeValidationSchema = Yup.object().shape({
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
    .when(["is_provide_hair_styles", "hair_service_types"], {
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
  hair_service_types: Yup.array()
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
    .when(["is_provide_hair_styles", "hair_service_types"], {
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
  hair_service_types: Yup.array()
    .of(Yup.string().required())
    .when("is_provide_hair_styles", {
      is: true,
      then: (schema) =>
        schema
          .min(1, "Please select at least one hair texture")
          .required("Please select at least one hair texture"),
      otherwise: (schema) => schema.notRequired(),
    }),
  bridal_makeup_service_types: Yup.array()
    .of(Yup.string().required())
    .when("is_provide_bridal_makeup_services", {
      is: true,
      then: (schema) =>
        schema
          .min(1, "Please select at least one bridal or makeup service")
          .required("Please select at least one bridal or makeup service"),
      otherwise: (schema) => schema.notRequired(),
    }),
  additional_service_types: Yup.array()
    .of(Yup.string().required())
    .min(1, "Please select at least one additional service option")
    .required("Please select at least one additional service option"),
  email: Yup.string().required("Email is required").email("Invalid email"),
  phone_number_one: Yup.string().required("Phone number is required"),
  phone_number_two: Yup.string(),
  facebook: Yup.string().url("Invalid URL"),
  instagram: Yup.string().url("Invalid URL"),
  youtube: Yup.string().url("Invalid URL"),
  city: Yup.string().required("City is required"),
  postal_code: Yup.string().required("Postal code is required"),
  country: Yup.string().required("Country is required"),
  latitude: Yup.number().required("Latitude is required"),
  longitude: Yup.number().required("Longitude is required"),
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
  const { update: updateSession } = useSession();
  const [addSalon, { isLoading }] = useAddSalonMutation();
  const [activeTab, setActiveTab] = useState("salon-category");
  const [showBridalInServicesTab, setShowBridalInServicesTab] = useState(false);
  const [isAddressPickerOpen, setIsAddressPickerOpen] = useState(false);

  const flattenErrorPaths = (errors: unknown, prefix = ""): string[] => {
    if (!errors) return [];

    if (typeof errors === "string") {
      return prefix ? [prefix] : [];
    }

    if (Array.isArray(errors)) {
      return errors.flatMap((val, idx) =>
        flattenErrorPaths(val, prefix ? `${prefix}.${idx}` : String(idx)),
      );
    }

    if (typeof errors === "object") {
      const obj = errors as Record<string, unknown>;
      return Object.keys(obj).flatMap((key) =>
        flattenErrorPaths(obj[key], prefix ? `${prefix}.${key}` : key),
      );
    }

    return [];
  };

  const errorsToTouched = (errors: unknown): unknown => {
    if (!errors) return undefined;

    if (typeof errors === "string") return true;

    if (Array.isArray(errors)) {
      return errors.map((val) => errorsToTouched(val));
    }

    if (typeof errors === "object") {
      const obj = errors as Record<string, unknown>;
      return Object.keys(obj).reduce(
        (acc, key) => {
          acc[key] = errorsToTouched(obj[key]);
          return acc;
        },
        {} as Record<string, unknown>,
      );
    }

    return true;
  };

  const getFirstErrorTabId = (
    errors: FormikErrors<FormValues>,
  ): string | null => {
    const paths = flattenErrorPaths(errors);
    if (paths.length === 0) return null;

    const tabMatchers: Array<{ id: string; match: (p: string) => boolean }> = [
      { id: "salon-category", match: (p) => p.startsWith("salon_category") },
      {
        id: "is_provide_hair_styles",
        match: (p) => p.startsWith("is_provide_hair_styles"),
      },
      {
        id: "services",
        match: (p) =>
          p.startsWith("hair_service_types") ||
          p.startsWith("is_provide_bridal_makeup_services"),
      },
      {
        id: "service-options",
        match: (p) => p.startsWith("bridal_makeup_service_types"),
      },
      {
        id: "additional-services",
        match: (p) => p.startsWith("additional_service_types"),
      },
      { id: "salon-type", match: (p) => p.startsWith("salon_type") },
      {
        id: "salon-details",
        match: (p) =>
          p.startsWith("name") ||
          p.startsWith("formatted_address") ||
          p.startsWith("google_place_id") ||
          p.startsWith("latitude") ||
          p.startsWith("longitude") ||
          p.startsWith("city") ||
          p.startsWith("postal_code") ||
          p.startsWith("country"),
      },
      {
        id: "contacts",
        match: (p) =>
          p.startsWith("email") ||
          p.startsWith("phone_number_one") ||
          p.startsWith("phone_number_two") ||
          p.startsWith("facebook") ||
          p.startsWith("instagram") ||
          p.startsWith("youtube"),
      },
      {
        id: "opening-hours",
        match: (p) => p.startsWith("opening_hours"),
      },
    ];

    for (const tab of tabMatchers) {
      if (paths.some(tab.match)) return tab.id;
    }
    return null;
  };

  const syncServicesSubStepForErrors = (
    values: FormValues,
    errors: FormikErrors<FormValues>,
  ) => {
    if (values.is_provide_hair_styles !== true) return;
    const paths = flattenErrorPaths(errors);
    const hasHairTypesError = paths.some((p) =>
      p.startsWith("hair_service_types"),
    );
    const hasBridalFlagError = paths.some((p) =>
      p.startsWith("is_provide_bridal_makeup_services"),
    );

    if (hasHairTypesError) setShowBridalInServicesTab(false);
    else if (hasBridalFlagError) setShowBridalInServicesTab(true);
  };

  // Helper function to convert time HH:MM to HH:MM:SS format
  const convertTimeToAPIFormat = (time: string): string => {
    if (!time || time === "" || time === "00:00") return "00:00:00";
    // If already in HH:MM:SS format, return as is
    if (time.split(":").length === 3) return time;
    // Otherwise, add :00 for seconds
    return `${time}:00`;
  };

  const getExclusiveCheckboxValues = (
    currentValues: string[],
    selectedValue: string,
    checked: boolean,
    exclusiveValue: string,
  ): string[] => {
    if (selectedValue === exclusiveValue) {
      return checked ? [exclusiveValue] : [];
    }

    const filteredValues = currentValues.filter(
      (value) => value !== selectedValue && value !== exclusiveValue,
    );

    return checked ? [...filteredValues, selectedValue] : filteredValues;
  };

  // Return true on success so caller (Formik) can reset the form and close dialog
  const handleSubmit = async (
    formData: FormValues,
    setErrors?: (errors: FormikErrors<FormValues>) => void,
    setTouched?: (touched: FormikProps<FormValues>["touched"]) => void,
  ) => {
    try {
      // Transform the data to match API payload format
      const payload: Partial<SalonProps> & {
        name: string;
        salon_type: string;
        email: string;
        phone_number_one: string;
        country_dial_code?: string;
        country_dial_code_two?: string;
        bridal_makeup_service_types?: string[];
        additional_service_types?: string[];
      } = {
        name: formData.name,
        salon_type: formData.salon_type,
        is_provide_hair_styles: formData.is_provide_hair_styles ?? false,
        is_provide_bridal_makeup_services:
          formData.is_provide_bridal_makeup_services ?? false,
        hair_service_types: formData.hair_service_types,
        bridal_makeup_service_types: formData.bridal_makeup_service_types || [],
        additional_service_types: formData.additional_service_types || [],
        salon_category: formData.salon_category,
        email: formData.email,
        phone_number_one: formData.phone_number_one.startsWith("+")
          ? formData.phone_number_one
          : `+${formData.phone_number_one}`,
        phone_number_two: formData.phone_number_two
          ? formData.phone_number_two.startsWith("+")
            ? formData.phone_number_two
            : `+${formData.phone_number_two}`
          : null,
        country_dial_code: formData.country_dial_code,
        country_dial_code_two: formData.country_dial_code_two || undefined,

        facebook: formData.facebook,
        instagram: formData.instagram,
        youtube: formData.youtube,
        formatted_address: formData.formatted_address || undefined,
        google_place_id: formData.google_place_id || undefined,
        city: formData.city,
        postal_code: formData.postal_code,
        country: formData.country,
        latitude:
          typeof formData.latitude === "number" ? formData.latitude : undefined,
        longitude:
          typeof formData.longitude === "number"
            ? formData.longitude
            : undefined,
        opening_hours: formData.opening_hours.map((oh) => ({
          day: oh.day,
          opening_time: convertTimeToAPIFormat(oh.opening_time),
          closing_time: convertTimeToAPIFormat(oh.closing_time),
          is_closed: oh.is_closed,
        })),
      };

      console.log("Sending payload to API:", JSON.stringify(payload, null, 2));

      await addSalon(payload).unwrap();
      await updateSession({ refreshUserData: true });
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

      interface ApiErrorResponse {
        data?: Record<string, unknown> | string[];
        message?: string;
        status?: number;
      }

      const isApiErrorResponse = (obj: unknown): obj is ApiErrorResponse =>
        typeof obj === "object" &&
        obj !== null &&
        ("data" in obj || "message" in obj);

      const apiError: ApiErrorResponse = isApiErrorResponse(error)
        ? (error as ApiErrorResponse)
        : { message: String(error) };

      console.error("Error details:", apiError?.data || apiError);

      const apiErrors =
        (apiError.data && typeof apiError.data !== "string"
          ? apiError.data
          : undefined) || undefined;

      const messages: string[] = [];

      if (apiErrors && typeof apiErrors === "object") {
        type NestedErrors = { [key: string]: string | NestedErrors };
        const formikErrors: NestedErrors = {};

        const setNested = (obj: NestedErrors, path: string, value: string) => {
          const parts = path.split(".");
          let cur: NestedErrors = obj;
          for (let i = 0; i < parts.length; i++) {
            const p = parts[i];
            if (i === parts.length - 1) {
              cur[p] = value;
            } else {
              if (typeof cur[p] !== "object" || cur[p] === undefined) {
                cur[p] = {} as NestedErrors;
              }
              cur = cur[p] as NestedErrors;
            }
          }
        };

        const traverse = (errObj: Record<string, unknown>, prefix = "") => {
          for (const key in errObj) {
            if (!Object.prototype.hasOwnProperty.call(errObj, key)) continue;
            const val = errObj[key];
            const path = prefix ? `${prefix}.${key}` : key;

            if (Array.isArray(val)) {
              const arr = val as unknown[];
              const joined = arr.map((v) => String(v)).join(" ");
              setNested(formikErrors, path, joined);
              messages.push(...arr.map((v) => String(v)));
            } else if (typeof val === "string") {
              setNested(formikErrors, path, val);
              messages.push(val);
            } else if (typeof val === "object" && val !== null) {
              traverse(val as Record<string, unknown>, path);
            }
          }
        };

        traverse(apiErrors as Record<string, unknown>);

        if (setErrors) {
          setErrors(formikErrors as unknown as FormikErrors<FormValues>);
        }

        if (setTouched) {
          setTouched(
            errorsToTouched(
              formikErrors as unknown as FormikErrors<FormValues>,
            ) as FormikProps<FormValues>["touched"],
          );
        }

        // Jump to the first tab that contains an error.
        const tabId = getFirstErrorTabId(
          formikErrors as unknown as FormikErrors<FormValues>,
        );
        if (tabId) {
          if (tabId === "services") {
            syncServicesSubStepForErrors(
              formData,
              formikErrors as unknown as FormikErrors<FormValues>,
            );
          }
          setActiveTab(tabId);
        }

        if (messages.length > 0) {
          // Show each message as a toast for visibility
          messages.forEach((m) => toast.error(m));
        } else {
          toast.error("There were validation errors. Please check the form.");
        }
      } else {
        const topMessage =
          (Array.isArray(apiError.data)
            ? (apiError.data as string[]).join(" ")
            : undefined) ||
          apiError.message ||
          "Failed to add salon. Please try again.";
        toast.error(topMessage);
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
    { value: "BARBERSHOP", label: "Barbershop / Men’s Salon" },
    { value: "UNISEX_SALON", label: "Unisex Salon" },
    { value: "LADIES_SALON", label: "Ladies Salon" },
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
    { id: "service-options", label: "Bridal / Makeup Options" },
    { id: "additional-services", label: "Additional Services" },
    { id: "salon-type", label: "Salon Type" },
    { id: "salon-details", label: "Basic Info" },
    { id: "contacts", label: "Contacts & Social Links" },
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
          formatted_address: values.formatted_address,
          google_place_id: values.google_place_id,
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

  const validateContacts = async (values: FormValues): Promise<boolean> => {
    try {
      await contactsValidationSchema.validate(
        {
          email: values.email,
          phone_number_one: values.phone_number_one,
          phone_number_two: values.phone_number_two,
          facebook: values.facebook,
          instagram: values.instagram,
          youtube: values.youtube,
        },
        { abortEarly: false },
      );
      return true;
    } catch {
      return false;
    }
  };

  const validateSalonType = async (values: FormValues): Promise<boolean> => {
    try {
      await salonTypeValidationSchema.validate(
        {
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
          hair_service_types: values.hair_service_types,
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
          hair_service_types: Yup.array()
            .of(Yup.string().required())
            .min(1, "Please select at least one hair texture")
            .required("Please select at least one hair texture"),
        })
        .validate(
          { hair_service_types: values.hair_service_types },
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
      if (values.is_provide_bridal_makeup_services !== true) {
        return true;
      }

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
    } catch {
      return false;
    }
  };

  const validateAdditionalServicesStep = async (
    values: FormValues,
  ): Promise<boolean> => {
    try {
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
        <div className="flex !max-h-[60vh] !min-h-[60vh] flex-col items-center justify-start overflow-y-auto px-6 py-4">
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
              hair_service_types: [],
              bridal_makeup_service_types: [],
              additional_service_types: [],
              name: "",
              salon_type: "",
              email: "",
              phone_number_one: "",
              phone_number_two: "",
              country_dial_code: "",
              country_dial_code_two: "",
              website: "",
              facebook: "",
              instagram: "",
              youtube: "",

              formatted_address: "",
              google_place_id: "",
              latitude: undefined,
              longitude: undefined,

              city: "",
              postal_code: "",
              country: "",
              opening_hours: days.map((d) => ({
                day: d,
                opening_time: "08:00",
                closing_time: "22:00",
                is_closed: false,
              })),
            }}
            validationSchema={validationSchema}
            onSubmit={async (
              values,
              { resetForm, setSubmitting, setErrors, setTouched },
            ) => {
              setSubmitting(true);
              const success = await handleSubmit(values, setErrors, setTouched);
              setSubmitting(false);
              if (success) {
                resetForm();
                setActiveTab("salon-category");
                // Add a small delay to ensure cache invalidation completes
                setTimeout(() => {
                  onClose();
                }, 100);
              }
            }}
          >
            {({
              values,
              setFieldTouched,
              setFieldValue,
              validateForm,
              submitForm,
              setTouched,
            }) => (
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
                        <span className="text-danger">*</span>
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
                                          "hair_service_types",
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
                                    <Field name="hair_service_types">
                                      {({
                                        field,
                                        form,
                                      }: {
                                        field: FieldInputProps<string[]>;
                                        form: FormikProps<FormValues>;
                                      }) => {
                                        const selectedValues =
                                          field.value || [];
                                        return (
                                          <input
                                            type="checkbox"
                                            checked={selectedValues.includes(
                                              opt.value,
                                            )}
                                            onChange={(event) => {
                                              form.setFieldValue(
                                                "hair_service_types",
                                                getExclusiveCheckboxValues(
                                                  selectedValues,
                                                  opt.value,
                                                  event.target.checked,
                                                  "NOT_SURE",
                                                ),
                                              );
                                            }}
                                            className="accent-primary h-4 w-4"
                                          />
                                        );
                                      }}
                                    </Field>
                                    <span>{opt.label}</span>
                                  </label>
                                ))}
                              </div>
                              <ErrorMessage
                                name="hair_service_types"
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
                                  setFieldTouched("hair_service_types", true);
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
                                if (
                                  values.is_provide_bridal_makeup_services ===
                                  true
                                ) {
                                  setActiveTab("service-options");
                                } else {
                                  setActiveTab("additional-services");
                                }
                              } else {
                                if (!typesValid) {
                                  setFieldTouched("hair_service_types", true);
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
                              if (
                                values.is_provide_bridal_makeup_services ===
                                true
                              ) {
                                setActiveTab("service-options");
                              } else {
                                setActiveTab("additional-services");
                              }
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
                      <div className="flex justify-center space-y-3">
                        <div className="flex flex-col justify-center">
                          <h3 className="text-base font-semibold tracking-tight">
                            Which Bridal / Makeup services does your salon
                            provide? <span className="text-danger">*</span>
                          </h3>
                          <div className="mt-2 space-y-2">
                            {[
                              {
                                value: "BRIDAL_MAKEUP",
                                label: "Bridal makeup",
                              },
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
                                <Field name="bridal_makeup_service_types">
                                  {({
                                    field,
                                    form,
                                  }: {
                                    field: FieldInputProps<string[]>;
                                    form: FormikProps<FormValues>;
                                  }) => {
                                    const selectedValues = field.value || [];
                                    return (
                                      <input
                                        type="checkbox"
                                        checked={selectedValues.includes(
                                          opt.value,
                                        )}
                                        onChange={(event) => {
                                          form.setFieldValue(
                                            "bridal_makeup_service_types",
                                            getExclusiveCheckboxValues(
                                              selectedValues,
                                              opt.value,
                                              event.target.checked,
                                              "NOT_SURE",
                                            ),
                                          );
                                        }}
                                        className="accent-primary h-4 w-4"
                                      />
                                    );
                                  }}
                                </Field>
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
                      </div>
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
                              setActiveTab("additional-services");
                            } else {
                              setFieldTouched(
                                "bridal_makeup_service_types",
                                true,
                              );
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
                    value="additional-services"
                    className="flex flex-1 flex-col justify-center space-y-6"
                  >
                    <div className="space-y-6">
                      <div className="flex justify-center space-y-3">
                        <div className="flex flex-col justify-center">
                          <h3 className="text-base font-semibold tracking-tight">
                            Please confirm which additional services your salon
                            also includes <span className="text-danger">*</span>
                          </h3>
                          <div className="mt-2 space-y-2">
                            {[
                              {
                                value: "BEAUTY_SERVICES",
                                label: "Beauty services",
                              },
                              {
                                value: "NAIL_SERVICES",
                                label: "Nail services",
                              },
                              {
                                value: "SPA_SERVICES",
                                label: "Spa services",
                              },
                              {
                                value: "NONE_OF_THE_ABOVE",
                                label: "None of the above",
                              },
                            ].map((opt) => (
                              <label
                                key={opt.value}
                                className="flex cursor-pointer items-center gap-3 text-sm"
                              >
                                <Field name="additional_service_types">
                                  {({
                                    field,
                                    form,
                                  }: {
                                    field: FieldInputProps<string[]>;
                                    form: FormikProps<FormValues>;
                                  }) => {
                                    const selectedValues = field.value || [];
                                    return (
                                      <input
                                        type="checkbox"
                                        checked={selectedValues.includes(
                                          opt.value,
                                        )}
                                        onChange={(event) => {
                                          form.setFieldValue(
                                            "additional_service_types",
                                            getExclusiveCheckboxValues(
                                              selectedValues,
                                              opt.value,
                                              event.target.checked,
                                              "NONE_OF_THE_ABOVE",
                                            ),
                                          );
                                        }}
                                        className="accent-primary h-4 w-4"
                                      />
                                    );
                                  }}
                                </Field>
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
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (
                            values.is_provide_bridal_makeup_services === true
                          ) {
                            setActiveTab("service-options");
                          } else {
                            setActiveTab("services");
                          }
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
                              await validateAdditionalServicesStep(values);
                            if (isValid) {
                              setActiveTab("salon-type");
                            } else {
                              setFieldTouched("additional_service_types", true);
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
                    value="salon-type"
                    className="flex flex-1 flex-col justify-center space-y-6"
                  >
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        Is this salon a Barbershop / Men’s Salon or a Unisex
                        Salon? <span className="text-danger">*</span>
                      </h3>
                      <div className="grid gap-3">
                        {salonTypes.map((type) => (
                          <label
                            key={type.value}
                            className="border-border hover:border-primary flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold transition"
                          >
                            <Field
                              type="radio"
                              name="salon_type"
                              value={type.value}
                              className="accent-primary h-4 w-4"
                            />
                            <span>{type.label}</span>
                          </label>
                        ))}
                      </div>
                      <ErrorMessage
                        name="salon_type"
                        component="div"
                        className="text-danger mt-1 text-xs"
                      />
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab("additional-services")}
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
                            const isValid = await validateSalonType(values);
                            if (isValid) {
                              setActiveTab("salon-details");
                            } else {
                              setFieldTouched("salon_type", true);
                              toast.error(
                                "Please select a salon type before proceeding",
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
                    className="flex flex-1 flex-col justify-start space-y-4"
                  >
                    <h3 className="mb-4 text-lg font-semibold">
                      Basic Information
                    </h3>

                    {/* Salon Name */}
                    <div>
                      <Label htmlFor="name" className="mb-2">
                        Salon Name<span className="text-danger">*</span>
                      </Label>
                      <Field
                        name="name"
                        id="name"
                        as="input"
                        type="text"
                        placeholder="Enter salon name"
                        className="w-full"
                      />
                      <ErrorMessage
                        name="name"
                        component="div"
                        className="text-danger mt-1 text-xs"
                      />
                    </div>

                    {/* Address Picker */}
                    <div>
                      <Label htmlFor="formatted_address" className="mb-2">
                        Address
                      </Label>

                      <div className="flex items-center gap-3">
                        <Field
                          name="formatted_address"
                          id="formatted_address"
                          as="input"
                          type="text"
                          readOnly
                          placeholder="Click ‘Get Address’ to select on map"
                          className="w-full flex-1"
                        />
                        <Button
                          type="button"
                          variant="default"
                          onClick={() => setIsAddressPickerOpen(true)}
                          className="shrink-0"
                        >
                          Get Address
                        </Button>
                      </div>

                      <ErrorMessage
                        name="formatted_address"
                        component="div"
                        className="text-danger mt-1 text-xs"
                      />
                      <Field type="hidden" name="google_place_id" />
                    </div>

                    {/* Latitude / Longitude */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="latitude" className="mb-2">
                          Latitude<span className="text-danger">*</span>
                        </Label>
                        <Field
                          name="latitude"
                          id="latitude"
                          as="input"
                          type="number"
                          readOnly
                          placeholder="Select address"
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
                          readOnly
                          placeholder="Select address"
                        />
                        <ErrorMessage
                          name="longitude"
                          component="div"
                          className="text-danger mt-1 text-xs"
                        />
                      </div>
                    </div>

                    {/* City and Postal Code */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="city" className="mb-2">
                          City / Town<span className="text-danger">*</span>
                        </Label>
                        <Field
                          name="city"
                          id="city"
                          as="input"
                          type="text"
                          readOnly
                          placeholder="Enter city"
                        />
                        <ErrorMessage
                          name="city"
                          component="div"
                          className="text-danger mt-1 text-xs"
                        />
                      </div>
                      <div>
                        <Label htmlFor="postal_code" className="mb-2">
                          Postal Code<span className="text-danger">*</span>
                        </Label>
                        <Field
                          name="postal_code"
                          id="postal_code"
                          as="input"
                          type="text"
                          readOnly
                          placeholder="Enter postal code"
                        />
                        <ErrorMessage
                          name="postal_code"
                          component="div"
                          className="text-danger mt-1 text-xs"
                        />
                      </div>
                    </div>

                    {/* Country */}
                    <div>
                      <Label htmlFor="country" className="mb-2">
                        Country<span className="text-danger">*</span>
                      </Label>
                      <Field
                        name="country"
                        id="country"
                        as="select"
                        className="w-full"
                        disabled
                      >
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

                    <div className="mt-6 flex items-center justify-between gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab("salon-type")}
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
                              const basicFields = [
                                "name",
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
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="contacts"
                    className="flex flex-1 flex-col justify-start space-y-4"
                  >
                    <h3 className="mb-4 text-lg font-semibold">
                      Contacts and social links
                    </h3>
                    <p className="text-muted-foreground mb-4 text-sm">
                      Perfect! Now share contacts and social links of your salon
                      for the upcoming customers!
                    </p>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {" "}
                      {/* Phone Number 1 */}
                      <div>
                        <Label htmlFor="phone_number_one" className="mb-2">
                          Phone Number 1<span className="text-danger">*</span>
                        </Label>
                        <Field type="hidden" name="country_dial_code" />
                        <Field name="phone_number_one">
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
                                  form.setFieldValue("phone_number_one", value);
                                  if (data?.dialCode) {
                                    form.setFieldValue(
                                      "country_dial_code",
                                      `+${data.dialCode}`,
                                    );
                                  }
                                }}
                                onBlur={() =>
                                  form.setFieldTouched("phone_number_one", true)
                                }
                                inputProps={{
                                  name: "phone_number_one",
                                  required: true,
                                }}
                                placeholder="Primary phone number"
                                searchPlaceholder="Search"
                                searchNotFound="No country found"
                                enableSearch={true}
                                inputClass="!w-full !h-auto px-3 py-2 rounded-md !bg-white !text-black dark:!bg-[#181818] dark:!text-gray-100"
                                buttonClass="!bg-white !text-black dark:!bg-[#181818] dark:!text-gray-100 !border-1 dark:!border-gray-700"
                                dropdownClass="!bg-card !text-card-foreground dark:!bg-gray-800 dark:!text-gray-100 !px-2"
                                searchClass="!bg-card !text-card-foreground dark:!bg-gray-800 dark:!text-gray-100"
                              />
                              <ErrorMessage
                                name="phone_number_one"
                                component="div"
                                className="text-danger mt-1 text-xs"
                              />
                            </div>
                          )}
                        </Field>
                      </div>
                      {/* Phone Number 2 (Optional) */}
                      <div>
                        <Label htmlFor="phone_number_two" className="mb-2">
                          Phone Number 2{" "}
                          <span className="text-muted-foreground text-xs">
                            (optional)
                          </span>
                        </Label>
                        <Field type="hidden" name="country_dial_code_two" />
                        <Field name="phone_number_two">
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
                                  form.setFieldValue("phone_number_two", value);
                                  if (data?.dialCode) {
                                    form.setFieldValue(
                                      "country_dial_code_two",
                                      `+${data.dialCode}`,
                                    );
                                  }
                                }}
                                onBlur={() =>
                                  form.setFieldTouched("phone_number_two", true)
                                }
                                inputProps={{
                                  name: "phone_number_two",
                                  required: false,
                                }}
                                placeholder="Secondary phone number"
                                searchPlaceholder="Search"
                                searchNotFound="No country found"
                                enableSearch={true}
                                inputClass="!w-full !h-auto px-3 py-2 rounded-md !bg-white !text-black dark:!bg-[#181818] dark:!text-gray-100"
                                buttonClass="!bg-white !text-black dark:!bg-[#181818] dark:!text-gray-100 !border-1 dark:!border-gray-700"
                                dropdownClass="!bg-card !text-card-foreground dark:!bg-gray-800 dark:!text-gray-100 !px-2"
                                searchClass="!bg-card !text-card-foreground dark:!bg-gray-800 dark:!text-gray-100"
                              />
                              <ErrorMessage
                                name="phone_number_two"
                                component="div"
                                className="text-danger mt-1 text-xs"
                              />
                            </div>
                          )}
                        </Field>
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <Label htmlFor="email" className="mb-2">
                        Email<span className="text-danger">*</span>
                      </Label>
                      <Field
                        name="email"
                        id="email"
                        as="input"
                        type="email"
                        placeholder="example@example.com"
                        className="w-full"
                      />
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="text-danger mt-1 text-xs"
                      />
                    </div>

                    {/* Social links heading */}
                    <div className="mt-4">
                      <h4 className="text-base font-semibold">
                        Social links{" "}
                        <span className="text-muted-foreground text-xs font-normal">
                          (optional)
                        </span>
                      </h4>
                    </div>

                    {/* Facebook Page Link */}
                    <div>
                      <Label htmlFor="facebook" className="mb-2">
                        Facebook Page Link
                      </Label>
                      <Field
                        name="facebook"
                        id="facebook"
                        as="input"
                        type="text"
                        placeholder="https://"
                        className="w-full"
                      />
                      <ErrorMessage
                        name="facebook"
                        component="div"
                        className="text-danger mt-1 text-xs"
                      />
                    </div>

                    {/* Instagram Page Link */}
                    <div>
                      <Label htmlFor="instagram" className="mb-2">
                        Instagram Page Link
                      </Label>
                      <Field
                        name="instagram"
                        id="instagram"
                        as="input"
                        type="text"
                        placeholder="https://"
                        className="w-full"
                      />
                      <ErrorMessage
                        name="instagram"
                        component="div"
                        className="text-danger mt-1 text-xs"
                      />
                    </div>

                    {/* YouTube Channel Link */}
                    <div>
                      <Label htmlFor="youtube" className="mb-2">
                        YouTube Channel Link
                      </Label>
                      <Field
                        name="youtube"
                        id="youtube"
                        as="input"
                        type="text"
                        placeholder="https://"
                        className="w-full"
                      />
                      <ErrorMessage
                        name="youtube"
                        component="div"
                        className="text-danger mt-1 text-xs"
                      />
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab("salon-details")}
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
                            const isValid = await validateContacts(values);
                            if (isValid) {
                              setActiveTab("opening-hours");
                            } else {
                              const contactFields = [
                                "email",
                                "phone_number_one",
                              ];
                              contactFields.forEach((field) =>
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
                        onClick={() => setActiveTab("contacts")}
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
                          disabled={isLoading}
                          className="w-40 text-white"
                          onClick={async () => {
                            const errors = await validateForm();
                            const paths = flattenErrorPaths(errors);
                            if (paths.length > 0) {
                              const tabId = getFirstErrorTabId(errors);
                              if (tabId) {
                                if (tabId === "services") {
                                  syncServicesSubStepForErrors(values, errors);
                                }
                                setActiveTab(tabId);
                              }

                              // Mark the whole form as touched so error messages show.
                              setTouched(
                                errorsToTouched(
                                  errors,
                                ) as FormikProps<FormValues>["touched"],
                                true,
                              );

                              toast.error(
                                "Please fix the highlighted errors before submitting.",
                              );
                              return;
                            }

                            submitForm();
                          }}
                        >
                          {isLoading ? "Adding..." : "Add New Salon"}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <AddressPickerDialog
                  open={isAddressPickerOpen}
                  onOpenChange={setIsAddressPickerOpen}
                  initialCenter={
                    typeof values.latitude === "number" &&
                    typeof values.longitude === "number"
                      ? { lat: values.latitude, lng: values.longitude }
                      : undefined
                  }
                  onSelect={(selection) => {
                    setFieldValue(
                      "formatted_address",
                      selection.formatted_address,
                    );
                    setFieldValue(
                      "google_place_id",
                      selection.google_place_id || "",
                    );
                    setFieldValue("city", selection.city);
                    setFieldValue("postal_code", selection.postal_code);
                    setFieldValue("country", selection.country);
                    setFieldValue("latitude", selection.latitude);
                    setFieldValue("longitude", selection.longitude);
                  }}
                />
              </FormikForm>
            )}
          </Formik>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddSalonDialog;
