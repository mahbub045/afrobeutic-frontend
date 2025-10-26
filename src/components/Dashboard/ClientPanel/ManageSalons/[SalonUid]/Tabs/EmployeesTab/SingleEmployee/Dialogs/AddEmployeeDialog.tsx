import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAddEmployeeMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/Employees/EmployeesApi";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  AddEmployeeDialogProps,
  EmployeeFormValues,
} from "@/Types/ClientPanel/ManageSalonTypes/EmployeesTypes/EmployeesType";
import { Field, Formik, type FormikHelpers } from "formik";
import { useTheme } from "next-themes";
import { useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as Yup from "yup";

const EmployeeSchema = Yup.object().shape({
  employee_id: Yup.string().trim().required("Employee ID is required"),
  name: Yup.string().trim().required("Name is required"),
  phone: Yup.string().trim().required("Phone is required"),
  designation: Yup.string().trim().required("Designation is required"),
  image: Yup.string().nullable(),
});

const AddEmployeeDialog: React.FC<AddEmployeeDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { salonuid } = useParams();
  const { resolvedTheme } = useTheme();
  // keep the full mutation result so we can call reset() after success
  const [addEmployee, { isLoading }] = useAddEmployeeMutation();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  async function handleAddEmployee(
    values: EmployeeFormValues,
    helpers: FormikHelpers<EmployeeFormValues>,
  ) {
    if (!salonuid) return;

    setFileError(null);

    try {
      const form = new FormData();
      form.append("employee_id", values.employee_id.trim());
      form.append("name", values.name.trim());
      form.append("phone", values.phone?.trim() || "");
      form.append("designation", values.designation?.trim() || "");

      if (selectedFile) {
        form.append("image", selectedFile);
      }

      // send FormData directly as employeeData — baseApi will attach headers
      await addEmployee({
        salonUid: salonuid as string,
        employeeData: form as unknown as object,
      }).unwrap();
      onClose();
      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Added successfully",
        html: `Successfully added <b class="text-primary">${values.name}</b> employee`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
      });
      helpers.resetForm();
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add employee. Please try again.");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md shadow-md dark:shadow-gray-600">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>Add a new employee to the salon</DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={
            {
              employee_id: "",
              name: "",
              phone: "",
              designation: "",
              image: "",
            } as EmployeeFormValues
          }
          validationSchema={EmployeeSchema}
          onSubmit={handleAddEmployee}
        >
          {({ handleSubmit, errors, touched, setFieldValue }) => (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="employee_id" className="mb-2">
                  Employee ID<span className="text-danger">*</span>
                </Label>
                <Field
                  id="employee_id"
                  name="employee_id"
                  as="input"
                  type="text"
                  required
                  placeholder="e.g. Emp-888"
                />
                {touched.employee_id && errors.employee_id ? (
                  <p className="text-destructive text-sm">
                    {errors.employee_id}
                  </p>
                ) : null}
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
                  required
                  placeholder="Employee name"
                />
                {touched.name && errors.name ? (
                  <p className="text-destructive text-sm">{errors.name}</p>
                ) : null}
              </div>

              <div>
                <Label htmlFor="phone" className="mb-2">
                  Phone<span className="text-danger">*</span>
                </Label>
                <Field
                  id="phone"
                  name="phone"
                  as="input"
                  type="tel"
                  required
                  placeholder="e.g. +8801517013045"
                />
                {touched.phone && errors.phone ? (
                  <p className="text-destructive text-sm">{errors.phone}</p>
                ) : null}
              </div>

              <div>
                <Label htmlFor="designation" className="mb-2">
                  Designation<span className="text-danger">*</span>
                </Label>
                <Field
                  id="designation"
                  name="designation"
                  as="input"
                  type="text"
                  required
                  placeholder="e.g. Hair Stylist"
                />
                {touched.designation && errors.designation ? (
                  <p className="text-destructive text-sm">
                    {errors.designation}
                  </p>
                ) : null}
              </div>

              <div>
                <Label htmlFor="image" className="mb-2">
                  Image
                </Label>
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.currentTarget.files?.[0];
                    if (file) {
                      setFileError(null);
                      setSelectedFile(file);
                      setFieldValue("image", file.name);
                    }
                  }}
                />
                {fileError ? (
                  <p className="text-destructive text-sm">{fileError}</p>
                ) : null}
                {selectedFile ? (
                  <p className="text-muted-foreground mt-2 text-sm">
                    Selected: {selectedFile.name} (
                    {Math.round(selectedFile.size / 1024)} KB)
                  </p>
                ) : null}
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || !salonuid}>
                  {isLoading ? "Adding..." : "Add Employee"}
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeDialog;
