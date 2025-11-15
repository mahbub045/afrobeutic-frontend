"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEditLeadMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/Leads/LeadsApi";
import { LeadDialogProps } from "@/Types/ClientPanel/ManageSalonTypes/LeadsTypes/LeadsType";
import { ErrorMessage, Field, Formik, Form as FormikForm } from "formik";
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as Yup from "yup";

const EditLeadDialog: React.FC<LeadDialogProps> = ({
  isOpen,
  onClose,
  LeadData,
}) => {
  const { resolvedTheme } = useTheme();

  const { salonuid } = useParams();
  const salonUid = Array.isArray(salonuid) ? salonuid[0] : (salonuid ?? "");

  const initialValues = {
    first_name: LeadData?.first_name ?? "",
    last_name: LeadData?.last_name ?? "",
    email: LeadData?.email ?? "",
    phone: LeadData?.phone ?? "",
    whatsapp: LeadData?.whatsapp ?? "",
    source: LeadData?.source ?? "",
  };

  const [editLead, { isLoading: isEditing }] = useEditLeadMutation();

  const validationSchema = Yup.object().shape({
    first_name: Yup.string().nullable(),
    last_name: Yup.string().nullable(),
    email: Yup.string().email("Invalid email address").nullable(),
    phone: Yup.string().nullable(),
    whatsapp: Yup.string().nullable(),
    source: Yup.string().nullable(),
  });

  const handleSubmit = (values: typeof initialValues) => {
    if (!LeadData) return;
    if (!salonUid) {
      toast.error("Salon identifier not found.");
      return;
    }

    const leadsData = {
      first_name: values.first_name || null,
      last_name: values.last_name || null,
      email: values.email || null,
      phone: values.phone || null,
      whatsapp: values.whatsapp || null,
      source: values.source || null,
    };

    editLead({ salonUid, leadsData, leadsUid: LeadData.uid })
      .unwrap()
      .then(() => {
        onClose();
        Swal.fire({
          icon: "success",
          iconColor: "#037375",
          title: "Lead Updated",
          text: `Lead information has been updated successfully.`,
          background: resolvedTheme === "dark" ? "#0f1724" : undefined,
          color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
          confirmButtonColor: "#037375",
          timer: 2500,
        });
      })
      .catch((error) => {
        console.error("Failed to edit lead:", error);
        toast.error("Failed to update lead information.");
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg shadow-md dark:shadow-gray-600">
        <DialogHeader>
          <DialogTitle>Edit Lead</DialogTitle>
          <DialogDescription className="text-xs">
            Update the lead information.
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          <FormikForm>
            <div className="grid gap-3">
              <div>
                <Label htmlFor="first_name" className="mb-2">
                  First Name
                </Label>
                <Field id="first_name" name="first_name" as={Input} />
                <ErrorMessage
                  name="first_name"
                  component="div"
                  className="text-danger mt-1 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="last_name" className="mb-2">
                  Last Name
                </Label>
                <Field id="last_name" name="last_name" as={Input} />
                <ErrorMessage
                  name="last_name"
                  component="div"
                  className="text-danger mt-1 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="email" className="mb-2">
                  Email
                </Label>
                <Field id="email" name="email" as={Input} type="email" />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-danger mt-1 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="mb-2">
                  Phone
                </Label>
                <Field id="phone" name="phone" as={Input} />
                <ErrorMessage
                  name="phone"
                  component="div"
                  className="text-danger mt-1 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="whatsapp" className="mb-2">
                  Whatsapp
                </Label>
                <Field id="whatsapp" name="whatsapp" as={Input} />
                <ErrorMessage
                  name="whatsapp"
                  component="div"
                  className="text-danger mt-1 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="source" className="mb-2">
                  Source
                </Label>
                <Field id="source" name="source" as={Input} />
                <ErrorMessage
                  name="source"
                  component="div"
                  className="text-danger mt-1 text-xs"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isEditing}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isEditing} className="w-40">
                {isEditing ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </FormikForm>
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default EditLeadDialog;
