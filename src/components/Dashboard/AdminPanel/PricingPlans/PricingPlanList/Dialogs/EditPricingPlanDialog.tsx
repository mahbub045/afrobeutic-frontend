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
import { useEditPricingPlanMutation } from "@/Redux/Reducers/AdminPanel/PricingPlans/PricingPlansApi";
import { EditPricingPlanDialogProps } from "@/Types/AdminPanel/PricingPlansTypes/PricingPlansTypes";
import {
  Field,
  FieldProps,
  Form,
  Formik,
  FormikErrors,
  FormikHelpers,
} from "formik";
import { useTheme } from "next-themes";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as Yup from "yup";

type FormValues = {
  account_category: string;
  name: string;
  price: string;
  salon_limit: string;
  whatsapp_chatbot_limit: string;
  whatsapp_messages_per_chatbot: string;
  has_broadcasting: boolean;
  broadcasting_message_limit: string;
  is_active: boolean;
  description: string;
};

const EditPricingPlanDialog: React.FC<EditPricingPlanDialogProps> = ({
  isOpen,
  onClose,
  pricingPlanData,
}) => {
  const { resolvedTheme } = useTheme();
  const [editPricingPlan, { isLoading }] = useEditPricingPlanMutation();

  const initialValues: FormValues = {
    account_category: pricingPlanData.account_category || "",
    name: pricingPlanData.name || "",
    price: pricingPlanData.price || "",
    salon_limit: String(pricingPlanData.salon_limit ?? ""),
    whatsapp_chatbot_limit: String(
      pricingPlanData.whatsapp_chatbot_limit ?? "",
    ),
    whatsapp_messages_per_chatbot: String(
      pricingPlanData.whatsapp_messages_per_chatbot ?? "",
    ),
    has_broadcasting: Boolean(pricingPlanData.has_broadcasting),
    broadcasting_message_limit: String(
      pricingPlanData.broadcasting_message_limit ?? "",
    ),
    is_active: Boolean(pricingPlanData.is_active),
    description: pricingPlanData.description ?? "",
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
      .min(0)
      .required("Messages per chatbot is required"),
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
  });

  const handleSubmit = async (
    values: FormValues,
    { setErrors, setSubmitting }: FormikHelpers<FormValues>,
  ) => {
    try {
      // Helper to safely normalize numbers
      const toNumberOrUndefined = (v: unknown) =>
        v == null ? undefined : Number(v);

      // Normalize original values for accurate comparison
      const originalNormalized = {
        account_category: pricingPlanData.account_category || "",
        name: pricingPlanData.name || "",
        price: toNumberOrUndefined(pricingPlanData.price),
        salon_limit: toNumberOrUndefined(pricingPlanData.salon_limit),
        whatsapp_chatbot_limit: toNumberOrUndefined(
          pricingPlanData.whatsapp_chatbot_limit,
        ),
        whatsapp_messages_per_chatbot: toNumberOrUndefined(
          pricingPlanData.whatsapp_messages_per_chatbot,
        ),
        has_broadcasting: Boolean(pricingPlanData.has_broadcasting),
        broadcasting_message_limit: toNumberOrUndefined(
          pricingPlanData.broadcasting_message_limit,
        ),
        is_active: Boolean(pricingPlanData.is_active),
        description: pricingPlanData.description ?? "",
      } as const;

      // New normalized values (what we intend to send)
      const newNormalized = {
        account_category: values.account_category,
        name: values.name,
        price: Number(values.price),
        salon_limit: Number(values.salon_limit),
        whatsapp_chatbot_limit: Number(values.whatsapp_chatbot_limit),
        whatsapp_messages_per_chatbot: Number(
          values.whatsapp_messages_per_chatbot,
        ),
        has_broadcasting: Boolean(values.has_broadcasting),
        // When broadcasting is disabled, we consider its limit as 0 for clearing
        broadcasting_message_limit: values.has_broadcasting
          ? Number(values.broadcasting_message_limit)
          : 0,
        is_active: Boolean(values.is_active),
        description: values.description || "",
      } as const;

      // Build a partial payload that includes only changed fields
      const partialPayload: Record<string, unknown> = {};

      // Simple string fields
      if (
        originalNormalized.account_category !== newNormalized.account_category
      ) {
        partialPayload.account_category = newNormalized.account_category;
      }
      if (originalNormalized.name !== newNormalized.name) {
        partialPayload.name = newNormalized.name;
      }
      if (originalNormalized.description !== newNormalized.description) {
        partialPayload.description = newNormalized.description;
      }

      // Numeric fields
      if (originalNormalized.price !== newNormalized.price) {
        partialPayload.price = newNormalized.price;
      }
      if (originalNormalized.salon_limit !== newNormalized.salon_limit) {
        partialPayload.salon_limit = newNormalized.salon_limit;
      }
      if (
        originalNormalized.whatsapp_chatbot_limit !==
        newNormalized.whatsapp_chatbot_limit
      ) {
        partialPayload.whatsapp_chatbot_limit =
          newNormalized.whatsapp_chatbot_limit;
      }
      if (
        originalNormalized.whatsapp_messages_per_chatbot !==
        newNormalized.whatsapp_messages_per_chatbot
      ) {
        partialPayload.whatsapp_messages_per_chatbot =
          newNormalized.whatsapp_messages_per_chatbot;
      }

      // Boolean fields
      if (originalNormalized.is_active !== newNormalized.is_active) {
        partialPayload.is_active = newNormalized.is_active;
      }
      if (
        originalNormalized.has_broadcasting !== newNormalized.has_broadcasting
      ) {
        partialPayload.has_broadcasting = newNormalized.has_broadcasting;
      }

      // Broadcasting limit: include only when relevant or when broadcasting toggles off
      if (newNormalized.has_broadcasting) {
        // Broadcasting is ON: include only if the limit changed
        if (
          originalNormalized.broadcasting_message_limit !==
          newNormalized.broadcasting_message_limit
        ) {
          partialPayload.broadcasting_message_limit =
            newNormalized.broadcasting_message_limit;
        }
      } else if (originalNormalized.has_broadcasting) {
        // Broadcasting turned OFF from previously ON: send 0 to clear
        partialPayload.broadcasting_message_limit = 0;
      }

      // If nothing changed, avoid making the request
      if (Object.keys(partialPayload).length === 0) {
        toast.info("No changes detected.");
        return;
      }

      await editPricingPlan({
        uid: pricingPlanData.uid,
        payload: partialPayload,
      }).unwrap();

      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Pricing Plan Updated",
        html: `Pricing plan <b>${values.name}</b> updated successfully`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 2500,
      });

      onClose();
    } catch (error: unknown) {
      console.error("Failed to edit pricing plan:", error);

      type ApiError = {
        data?: Record<string, unknown> | null;
        originalStatus?: unknown;
        error?: string;
        message?: string;
      };

      const err = error as ApiError;
      const apiData = err.data ?? err.originalStatus ?? null;

      if (apiData && typeof apiData === "object") {
        const fieldErrors: Record<string, string> = {};

        for (const key of Object.keys(apiData as Record<string, unknown>)) {
          const val = (apiData as Record<string, unknown>)[key];
          if (Array.isArray(val)) {
            fieldErrors[key] = (val as unknown[]).map(String).join(" ");
          } else if (typeof val === "string") {
            fieldErrors[key] = val;
          } else if (typeof val === "object" && val !== null) {
            fieldErrors[key] = JSON.stringify(val);
          }
        }

        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors as unknown as FormikErrors<FormValues>);
        } else {
          toast.error("Failed to update pricing plan. Please try again.");
        }
      } else {
        const message =
          err.error ?? err.message ?? "Failed to update pricing plan.";
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
          <DialogTitle className="text-primary">Edit Pricing Plan</DialogTitle>
          <DialogDescription>
            Please fill out the form below to edit the pricing plan.
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched }) => (
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

                <div>
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
                </div>

                <div className="flex items-center justify-between gap-4">
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
                </div>

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

export default EditPricingPlanDialog;
