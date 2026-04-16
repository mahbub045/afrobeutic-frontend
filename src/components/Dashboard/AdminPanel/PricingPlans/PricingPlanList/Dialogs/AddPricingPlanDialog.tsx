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
import { Textarea } from "@/components/ui/textarea";
import { useAddPricingPlanMutation } from "@/Redux/Reducers/AdminPanel/PricingPlans/PricingPlansApi";
import { AddPricingPlanDialogProps } from "@/Types/AdminPanel/PricingPlansTypes/PricingPlansTypes";
import {
  Field,
  FieldProps,
  Form,
  Formik,
  FormikErrors,
  FormikHelpers,
} from "formik";
import { X } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as Yup from "yup";

const AddPricingPlanDialog: React.FC<AddPricingPlanDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { resolvedTheme } = useTheme();
  const [addPricingPlan, { isLoading }] = useAddPricingPlanMutation();
  const [featureInput, setFeatureInput] = useState<string>("");
  const [featureError, setFeatureError] = useState<string | null>(null);

  const initialValues = {
    account_category: "",
    name: "",
    price: "",
    salon_limit: "",
    whatsapp_chatbot_limit: "",
    // whatsapp_messages_per_chatbot: "",
    // has_broadcasting: true,
    // broadcasting_message_limit: "",
    is_active: true,
    description: "",
    features: [] as string[],
  };
  const validationSchema = Yup.object({
    account_category: Yup.string().required("Account category is required"),
    name: Yup.string().required("Name is required"),
    price: Yup.number()
      .typeError("Price must be a number")
      .min(0, "Price must be >= 0")
      .required("Price is required"),
    salon_limit: Yup.number()
      .typeError("Salon limit must be a number")
      .min(0)
      .required("Salon limit is required"),
    whatsapp_chatbot_limit: Yup.number()
      .typeError("Chatbot limit must be a number")
      .min(0)
      .required("Chatbot limit is required"),
    whatsapp_messages_per_chatbot: Yup.number()
      .typeError("Messages per chatbot must be a number")
      .min(0),

    has_broadcasting: Yup.boolean(),
    broadcasting_message_limit: Yup.number()
      .typeError("Broadcasting message limit must be a number")
      .min(0)
      .when("has_broadcasting", {
        is: true,
        then: (schema) => schema.required("Broadcasting limit is required"),
      }),
    is_active: Yup.boolean(),
    description: Yup.string().nullable(),
    features: Yup.array().of(Yup.string().trim()),
  });

  const handleSubmit = async (
    values: typeof initialValues,
    { setErrors, setSubmitting }: FormikHelpers<typeof initialValues>,
  ) => {
    try {
      // ensure numeric values are numbers
      const payload = {
        ...values,
        account_category: values.account_category,
        name: values.name,
        price: Number(values.price),
        salon_limit: Number(values.salon_limit),
        // has_broadcasting: Boolean(values.has_broadcasting),
        is_active: Boolean(values.is_active),
        description: values.description || "",
        whatsapp_chatbot_limit: Number(values.whatsapp_chatbot_limit),
        // whatsapp_messages_per_chatbot: Number(
        //   values.whatsapp_messages_per_chatbot,
        // ),
        // broadcasting_message_limit: values.has_broadcasting
        //   ? Number(values.broadcasting_message_limit)
        //   : 0,
        features: values.features,
      };

      await addPricingPlan({ payload }).unwrap();
      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Pricing Plan Created",
        html: `Pricing plan <b>${values.name}</b> created successfully`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 2500,
      });
      onClose();
    } catch (error: unknown) {
      console.error("Failed to add pricing plan:", error);

      type ApiError = {
        data?: Record<string, unknown> | null;
        originalStatus?: unknown;
        error?: string;
        message?: string;
      };

      const err = error as ApiError;

      // Try to extract field errors from the API response
      const apiData = err.data ?? err.originalStatus ?? null;

      if (apiData && typeof apiData === "object") {
        const fieldErrors: Record<string, string> = {};

        // If API returns { field: [..] } or { field: '...' }
        for (const key of Object.keys(apiData as Record<string, unknown>)) {
          const val = (apiData as Record<string, unknown>)[key];
          if (Array.isArray(val)) {
            fieldErrors[key] = (val as unknown[]).map(String).join(" ");
          } else if (typeof val === "string") {
            fieldErrors[key] = val;
          } else if (typeof val === "object" && val !== null) {
            // nested object, stringify or pick message
            fieldErrors[key] = JSON.stringify(val);
          }
        }

        if (Object.keys(fieldErrors).length > 0) {
          setErrors(
            fieldErrors as unknown as FormikErrors<typeof initialValues>,
          );
        } else {
          toast.error("Failed to add pricing plan. Please try again.");
        }
      } else {
        // fallback error message
        const message =
          err.error ?? err.message ?? "Failed to add pricing plan.";
        toast.error(String(message));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto shadow-md dark:shadow-gray-600">
        <DialogHeader>
          <DialogTitle className="text-primary">
            Add New Pricing Plan
          </DialogTitle>{" "}
          <DialogDescription>
            Please fill out the form below to create a new pricing plan.
          </DialogDescription>
        </DialogHeader>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, setFieldValue }) => (
            <Form>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="account_category" className="mb-2">
                    Account Category<span className="text-danger">*</span>
                  </Label>
                  <Field
                    id="account_category"
                    name="account_category"
                    as="select"
                    placeholder="e.g. salon"
                    required
                  >
                    <option value="" label="Select category" />
                    <option
                      value="INDIVIDUAL_STYLIST"
                      label="Individual Stylist"
                    />
                    <option value="SALON_SHOP" label="Salon Shop" />
                  </Field>
                  {touched.account_category && errors.account_category && (
                    <p className="text-destructive mt-1 text-sm">
                      {String(errors.account_category)}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="name" className="mb-2">
                    Name<span className="text-danger">*</span>
                  </Label>
                  <Field
                    id="name"
                    name="name"
                    as="input"
                    type="text"
                    placeholder="Plan name"
                    required
                  />
                  {touched.name && errors.name && (
                    <p className="text-destructive mt-1 text-sm">
                      {String(errors.name)}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="price" className="mb-2">
                    Price<span className="text-danger">*</span>
                  </Label>
                  <Field
                    id="price"
                    name="price"
                    as="input"
                    type="number"
                    placeholder="0.00"
                    required
                  />
                  {touched.price && errors.price && (
                    <p className="text-destructive mt-1 text-sm">
                      {String(errors.price)}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="salon_limit" className="mb-2">
                      Salon Limit<span className="text-danger">*</span>
                    </Label>
                    <Field
                      id="salon_limit"
                      name="salon_limit"
                      as="input"
                      type="number"
                      placeholder="e.g. 5"
                      required
                    />
                    {touched.salon_limit && errors.salon_limit && (
                      <p className="text-destructive mt-1 text-sm">
                        {String(errors.salon_limit)}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="whatsapp_chatbot_limit" className="mb-2">
                      WhatsApp Chatbot Limit
                      <span className="text-danger">*</span>
                    </Label>
                    <Field
                      id="whatsapp_chatbot_limit"
                      name="whatsapp_chatbot_limit"
                      as="input"
                      type="number"
                      placeholder="e.g. 5"
                      required
                    />
                    {touched.whatsapp_chatbot_limit &&
                      errors.whatsapp_chatbot_limit && (
                        <p className="text-destructive mt-1 text-sm">
                          {String(errors.whatsapp_chatbot_limit)}
                        </p>
                      )}
                  </div>
                </div>

                {/* <div>
                  <Label
                    htmlFor="whatsapp_messages_per_chatbot"
                    className="mb-2"
                  >
                    WhatsApp Messages per Chatbot
                    <span className="text-danger">*</span>
                  </Label>
                  <Field
                    id="whatsapp_messages_per_chatbot"
                    name="whatsapp_messages_per_chatbot"
                    as="input"
                    type="number"
                    placeholder="e.g. 5"
                    required
                  />
                  {touched.whatsapp_messages_per_chatbot &&
                    errors.whatsapp_messages_per_chatbot && (
                      <p className="text-destructive mt-1 text-sm">
                        {String(errors.whatsapp_messages_per_chatbot)}
                      </p>
                    )}
                </div> */}

                <div>
                  <Label className="mb-2">Features</Label>
                  <div className="flex flex-wrap gap-2">
                    {values.features.length > 0 ? (
                      values.features.map((feature) => (
                        <span
                          key={feature}
                          className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
                        >
                          {feature}
                          <button
                            type="button"
                            onClick={() => {
                              setFieldValue(
                                "features",
                                values.features.filter(
                                  (item) => item !== feature,
                                ),
                              );
                            }}
                            className="text-muted-foreground hover:bg-muted inline-flex h-5 w-5 items-center justify-center rounded-full"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No features added yet.
                      </p>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <input
                      id="featureInput"
                      type="text"
                      value={featureInput}
                      onChange={(e) => {
                        setFeatureInput(e.target.value);
                        setFeatureError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const feature = featureInput.trim();
                          if (!feature) {
                            setFeatureError("Feature cannot be blank.");
                            return;
                          }
                          if (values.features.includes(feature)) {
                            setFeatureError("Feature already added.");
                            return;
                          }
                          setFieldValue("features", [
                            ...values.features,
                            feature,
                          ]);
                          setFeatureInput("");
                        }
                      }}
                      placeholder="Enter a feature"
                      className="border-input focus:border-primary focus:ring-primary/10 flex-1 rounded-md border px-3 py-2 shadow-sm focus:ring-2 focus:outline-none"
                    />
                    <Button
                      size="sm"
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const feature = featureInput.trim();
                        if (!feature) {
                          setFeatureError("Feature cannot be blank.");
                          return;
                        }
                        if (values.features.includes(feature)) {
                          setFeatureError("Feature already added.");
                          return;
                        }
                        setFieldValue("features", [
                          ...values.features,
                          feature,
                        ]);
                        setFeatureInput("");
                      }}
                      className="h-10 px-4"
                    >
                      Add
                    </Button>
                  </div>
                  {featureError ? (
                    <p className="text-destructive mt-1 text-sm">
                      {featureError}
                    </p>
                  ) : null}
                </div>

                {/* <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Label htmlFor="has_broadcasting" className="mb-2">
                      Has Broadcasting
                    </Label>
                    <Field name="has_broadcasting">
                      {(props: FieldProps) => (
                        <Switch
                          checked={props.form.values.has_broadcasting}
                          onCheckedChange={(val) =>
                            props.form.setFieldValue(
                              "has_broadcasting",
                              Boolean(val),
                            )
                          }
                        />
                      )}
                    </Field>
                  </div>

                  <div>
                    <Label
                      htmlFor="broadcasting_message_limit"
                      className="mb-2"
                    >
                      Broadcasting Message Limit
                      <span className="text-danger">*</span>
                    </Label>
                    <Field
                      id="broadcasting_message_limit"
                      name="broadcasting_message_limit"
                      as="input"
                      type="number"
                      placeholder="e.g. 1000"
                      required
                      disabled={!values.has_broadcasting}
                    />
                    {touched.broadcasting_message_limit &&
                      errors.broadcasting_message_limit && (
                        <p className="text-destructive mt-1 text-sm">
                          {String(errors.broadcasting_message_limit)}
                        </p>
                      )}
                  </div>
                </div> */}

                <div className="flex items-center gap-3">
                  <Label htmlFor="is_active" className="mb-2">
                    Is Active
                  </Label>
                  <Field name="is_active">
                    {(props: FieldProps) => (
                      <Switch
                        checked={props.form.values.is_active}
                        onCheckedChange={(val) =>
                          props.form.setFieldValue("is_active", Boolean(val))
                        }
                      />
                    )}
                  </Field>
                </div>

                <div>
                  <Label htmlFor="description" className="mb-2">
                    Description
                  </Label>
                  <Field
                    id="description"
                    name="description"
                    as={Textarea}
                    placeholder="Optional description"
                  />
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" onClick={onClose} type="button">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default AddPricingPlanDialog;
