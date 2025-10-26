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
import { useEditEmployeeMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/Employees/EmployeesApi";
import {
  EditEmployeeBasicInfoDialogProps,
  EmployeeProps,
} from "@/Types/ClientPanel/ManageSalonTypes/EmployeesTypes/EmployeesType";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { X } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as Yup from "yup";

const EditEmployeeBasicInfoDialog: React.FC<
  EditEmployeeBasicInfoDialogProps
> = ({ isOpen, onClose, selectedEmployee, onEditSuccess }) => {
  const { salonuid } = useParams();
  const { resolvedTheme } = useTheme();
  const [editEmployee, { isLoading: isEditingEmployee }] =
    useEditEmployeeMutation();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const validationSchema = Yup.object().shape({
    // PATCH request: fields are optional — only include when user changes them
    employee_id: Yup.string().trim().nullable(),
    name: Yup.string().trim().nullable(),
    phone: Yup.string().trim().nullable(),
    designation: Yup.string().trim().nullable(),
    image: Yup.string().nullable(),
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) setSelectedImage(file);
  };

  const handleRemoveImage = () => setSelectedImage(null);

  const handleSubmit = async (values: EmployeeProps) => {
    try {
      // Build FormData only with changed/non-empty fields (PATCH semantics)
      const formData = new FormData();

      const appendIfChanged = (
        key: string,
        newVal: string | undefined | null,
        oldVal: string | undefined | null,
      ) => {
        if (newVal === undefined || newVal === null) return;
        const n = String(newVal).trim();
        const o =
          oldVal === undefined || oldVal === null ? "" : String(oldVal).trim();
        if (n !== "" && n !== o) {
          formData.append(key, n);
        }
      };

      appendIfChanged(
        "employee_id",
        values.employee_id,
        selectedEmployee?.employee_id,
      );
      appendIfChanged("name", values.name, selectedEmployee?.name);
      appendIfChanged("phone", values.phone, selectedEmployee?.phone);
      appendIfChanged(
        "designation",
        values.designation,
        selectedEmployee?.designation,
      );

      // Image: only append if user selected a new file
      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      // If nothing changed, avoid sending empty PATCH
      const hasChanges = Array.from(formData.keys()).length > 0;
      if (!hasChanges) {
        toast.info("No changes to update.");
        return;
      }

      await editEmployee({
        salonUid: salonuid as string,
        employeeUid: selectedEmployee?.uid,
        employeeData: formData,
      }).unwrap();

      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Updated successfully",
        html: `Successfully updated <b class="text-primary">${values.name}</b> employee`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
      });
      onEditSuccess?.();
      onClose();
    } catch (error) {
      toast.error("Failed to update employee.");
      console.error("Edit Employee Error:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="shadow-md sm:max-w-lg dark:shadow-gray-700">
        <DialogHeader>
          <DialogTitle className="text-primary">
            Edit Employee Basic Info
          </DialogTitle>
          <DialogDescription>
            Update employee details and image.
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={
            {
              uid: selectedEmployee?.uid || "",
              employee_id: selectedEmployee?.employee_id || "",
              name: selectedEmployee?.name || "",
              phone: selectedEmployee?.phone || "",
              designation: selectedEmployee?.designation || "",
              image: selectedEmployee?.image || "",
              created_at: selectedEmployee?.created_at || "",
              updated_at: selectedEmployee?.updated_at || "",
            } as EmployeeProps
          }
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit, isSubmitting, values }) => (
            <Form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="employee-id" className="mb-2">
                  Employee ID
                </Label>
                <Field
                  as="input"
                  id="employee-id"
                  name="employee_id"
                  type="text"
                  placeholder="Enter employee id"
                />
                <ErrorMessage
                  name="employee_id"
                  component="p"
                  className="mt-1 text-sm text-red-500"
                />
              </div>

              <div>
                <Label htmlFor="employee-name" className="mb-2">
                  Name
                </Label>
                <Field
                  as="input"
                  id="employee-name"
                  name="name"
                  type="text"
                  placeholder="Enter name"
                />
                <ErrorMessage
                  name="name"
                  component="p"
                  className="mt-1 text-sm text-red-500"
                />
              </div>

              <div>
                <Label htmlFor="employee-phone" className="mb-2">
                  Phone
                </Label>
                <Field
                  as="input"
                  id="employee-phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter phone"
                />
                <ErrorMessage
                  name="phone"
                  component="p"
                  className="mt-1 text-sm text-red-500"
                />
              </div>

              <div>
                <Label htmlFor="employee-designation" className="mb-2">
                  Designation
                </Label>
                <Field
                  as="input"
                  id="employee-designation"
                  name="designation"
                  type="text"
                  placeholder="Enter designation"
                />
                <ErrorMessage
                  name="designation"
                  component="p"
                  className="mt-1 text-sm text-red-500"
                />
              </div>

              <div>
                <Label htmlFor="employee-image" className="mb-2">
                  Image
                </Label>
                <input
                  id="employee-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <div className="mt-2 flex items-center gap-3">
                  {selectedImage ? (
                    <div className="relative h-20 w-20 overflow-hidden rounded-md border">
                      <Image
                        src={URL.createObjectURL(selectedImage)}
                        alt="preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : values.image ? (
                    <div className="relative h-20 w-20 overflow-hidden rounded-md border">
                      <Image
                        src={values.image}
                        alt="employee"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isEditingEmployee}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isEditingEmployee || isSubmitting}
                >
                  {isEditingEmployee ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default EditEmployeeBasicInfoDialog;
