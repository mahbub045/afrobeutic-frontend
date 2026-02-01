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
import { Textarea } from "@/components/ui/textarea";
import { useEditSingleSalonMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/SingleSalon/SingleSalonApi";
import { EditDashboardProps } from "@/Types/ClientPanel/ManageSalonTypes/SalonListType";
import {
  ErrorMessage,
  Field,
  Formik,
  Form as FormikForm,
  FormikHelpers,
} from "formik";
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import React from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as Yup from "yup";

const EditProfessionalCareerDialog: React.FC<EditDashboardProps> = ({
  singleSalonData,
  isOpen,
  onClose,
}) => {
  const { salonuid } = useParams();
  const { resolvedTheme } = useTheme();

  // RTK hooks
  const [editProfile, { isLoading }] = useEditSingleSalonMutation();

  const schema = Yup.object().shape({
    professional_career_details: Yup.string().nullable(),
  });

  const handleSubmit = async (
    values: { professional_career_details: string },
    { setSubmitting }: FormikHelpers<{ professional_career_details: string }>,
  ) => {
    setSubmitting(true);
    try {
      await editProfile({
        salonUid: salonuid as string,
        salonData: {
          professional_career_details:
            values.professional_career_details || null,
        },
      }).unwrap();

      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Updated",
        html: `Successfully updated professional career for <b class="text-primary">${singleSalonData?.name}</b>`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 2000,
      });

      onClose();
    } catch (error) {
      console.error("Failed to update professional career", error);
      toast.error("Failed to update professional career. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md shadow-md dark:shadow-gray-600">
        <DialogHeader>
          <DialogTitle className="text-primary">
            Edit Professional Career
          </DialogTitle>
          <DialogDescription className="text-xs">
            Update salon professional career information.
          </DialogDescription>
        </DialogHeader>

        <Formik
          enableReinitialize
          initialValues={{
            professional_career_details:
              singleSalonData?.professional_career_details || "",
          }}
          validationSchema={schema}
          onSubmit={handleSubmit}
        >
          {(): React.ReactNode => (
            <FormikForm>
              <div className="grid gap-4">
                <div>
                  <Label className="mb-2">Professional Career Details</Label>
                  <Field
                    id="professional_career_details"
                    name="professional_career_details"
                    as={Textarea}
                    rows={12}
                    className="min-h-[220px]"
                  />
                  <ErrorMessage
                    name="professional_career_details"
                    component="div"
                    className="text-danger mt-1 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-3">
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
                    {isLoading ? "Saving..." : "Save Changes"}
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

export default EditProfessionalCareerDialog;
