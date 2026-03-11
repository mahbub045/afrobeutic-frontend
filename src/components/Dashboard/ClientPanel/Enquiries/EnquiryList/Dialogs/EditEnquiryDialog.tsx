"use client";
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
import { ENQUIRY_STATUSES } from "@/constants/enquiryStatuses";
import { ENQUIRY_TYPES } from "@/constants/enquiryTypes";
import { useEditEnquiryMutation } from "@/Redux/Reducers/ClientPanel/Enquiries/EnquiriesApi";
import { EnquiryDialogsProps } from "@/Types/EnquiriesTypes/EnquiryType";
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from "formik";
import { useTheme } from "next-themes";
import React from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as Yup from "yup";

const EditEnquiryDialog: React.FC<EnquiryDialogsProps> = ({
  isOpen,
  onClose,
  enquiryData,
}) => {
  const { resolvedTheme } = useTheme();
  const [editEnquiry, { isLoading }] = useEditEnquiryMutation();

  const initialValues = {
    type: enquiryData?.type ?? ENQUIRY_TYPES[0].value,
    summary: enquiryData?.summary ?? "",
    status: enquiryData?.status ?? "",
  };

  const validationSchema = Yup.object().shape({
    type: Yup.string().required("Type is required"),
    summary: Yup.string().required("Summary is required"),
    status: Yup.string().required("Status is required"),
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
      // fallback in case type somehow became empty
      if (!values.type) {
        values.type = ENQUIRY_TYPES[0].value;
      }
      await editEnquiry({ enquiryuid: enquiryData.uid, ...values }).unwrap();
      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Enquiry Updated",
        html: `Enquiry updated successfully`,
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
          <DialogDescription>
            Please update the form below to edit the enquiry.
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
                <Label htmlFor="type" className="mb-2">
                  Type
                </Label>
                <Field as="select" id="type" name="type">
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

              <div>
                <Label htmlFor="status" className="mb-2">
                  Status
                </Label>
                <Field as="select" id="status" name="status">
                  {ENQUIRY_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </Field>
                <div className="text-destructive text-sm">
                  <ErrorMessage name="status" />
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="summary" className="mb-2">
                  Summary<span className="text-danger">*</span>
                </Label>
                <Field
                  as={Textarea}
                  id="summary"
                  name="summary"
                  placeholder="Short summary"
                  required
                />
                <div className="text-destructive text-sm">
                  <ErrorMessage name="summary" />
                </div>
              </div>

              <DialogFooter className="md:col-span-2">
                <div className="w-fulljustify-end flex gap-2">
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
