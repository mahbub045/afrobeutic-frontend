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
import { useWhatsAppOnboardMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/WhatsApp/WhatsAppApi";
import { ConnectWhatsAppDialogProps } from "@/Types/ClientPanel/ManageSalonTypes/WhatsAppTypes/WhatsAppTypes";
import {
  ErrorMessage,
  Field,
  FieldProps,
  Formik,
  Form as FormikForm,
  FormikHelpers,
  FormikProps,
} from "formik";
import { useParams } from "next/navigation";
import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import { toast } from "react-toastify";
import * as Yup from "yup";

const ConnectWhatsAppDialog: React.FC<ConnectWhatsAppDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { salonuid } = useParams();

  const [whatsAppOnboard, { isLoading: isAdding }] =
    useWhatsAppOnboardMutation();

  // holds a human-readable message (or raw error) from the API
  const [apiError, setApiError] = useState<string | null>(null);

  const initialValues = {
    whatsapp_sender_number: "",
  };

  const validationSchema = Yup.object().shape({
    whatsapp_sender_number: Yup.string()
      .required("WhatsApp sender number is required")
      .matches(
        /^\+?\d+$/,
        "Must be a valid phone number including country code (e.g. +8801...)",
      ),
  });

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting, setFieldError }: FormikHelpers<typeof initialValues>,
  ) => {
    setSubmitting(true);
    setApiError(null);
    try {
      await whatsAppOnboard({
        salonUid: salonuid as string,
        whatsapp_sender_number: values.whatsapp_sender_number,
      }).unwrap();
      toast.success("WhatsApp number saved. Onboarding started.");
      onClose(false);
    } catch (err) {
      console.error("Failed to connect WhatsApp:", err);

      type WhatsAppErrorData = {
        whatsapp_sender_number?: string[];
        non_field_errors?: string[];
        message?: string | null;
        detail?: string;
        [key: string]: unknown;
      };

      const typedError =
        (err as { data?: WhatsAppErrorData; message?: string | null }) ?? {};

      const serverMsg =
        (typedError.data &&
          (typedError.data.non_field_errors?.[0] ||
            typedError.data.message ||
            typedError.data.error ||
            typedError.data.detail)) ||
        (typeof typedError.message === "string" && typedError.message) ||
        (typeof err === "string" ? err : "Failed to connect WhatsApp.");

      if (typedError.data?.whatsapp_sender_number?.length) {
        setFieldError(
          "whatsapp_sender_number",
          String(typedError.data.whatsapp_sender_number[0]),
        );
      }

      // fallback to raw object when message isn’t available (useful for full JSON)
      const displayMsg = serverMsg || JSON.stringify(err, null, 2);
      setApiError(displayMsg as string);
      toast.error(displayMsg as string);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md shadow-md dark:shadow-gray-600">
        <DialogHeader>
          <DialogTitle className="text-primary">Connect WhatsApp</DialogTitle>
          <DialogDescription className="text-xs">
            Provide your WhatsApp sender number to connect WhatsApp for this
            salon. Example: +44 XXXX XXXXXX
          </DialogDescription>
        </DialogHeader>

        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {() => (
            <FormikForm>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="whatsapp_sender_number" className="mb-2">
                    WhatsApp Sender Number
                  </Label>

                  <Field name="whatsapp_sender_number">
                    {({
                      field,
                      form,
                    }: FieldProps<
                      string,
                      FormikProps<typeof initialValues>
                    >) => (
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
                            if (!numeric) {
                              form.setFieldValue(field.name, "");
                              return;
                            }
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
                          name="whatsapp_sender_number"
                          component="div"
                          className="text-danger mt-1 text-xs"
                        />
                      </div>
                    )}
                  </Field>
                </div>

                {apiError && (
                  <div className="text-danger mt-2 text-sm whitespace-pre-wrap">
                    {apiError}
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onClose(false)}
                    disabled={isAdding}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isAdding} className="w-40">
                    {isAdding ? "Connecting..." : "Connect"}
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

export default ConnectWhatsAppDialog;
