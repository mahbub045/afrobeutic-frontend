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
import { countries } from "@/data/countries";
import { useEditManagementMutation } from "@/Redux/Reducers/AdminPanel/Managements/ManagementsApi";
import { ManagementsListDialogsProps } from "@/Types/AdminPanel/ManagementsTypes/ManagementsType";
import {
  ErrorMessage,
  Field,
  Formik,
  Form as FormikForm,
  FormikHelpers,
} from "formik";
import { useTheme } from "next-themes";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  country: Yup.string().required("Country is required"),
  role: Yup.string().required("Role is required"),
});

const EditManagementUserDialog: React.FC<ManagementsListDialogsProps> = ({
  isOpen,
  onClose,
  managementUser,
}) => {
  const { resolvedTheme } = useTheme();
  const [editManagement, { isLoading }] = useEditManagementMutation();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setPreviewUrl(managementUser?.avatar ?? null);
    setSelectedFile(null);
  }, [managementUser]);

  const initialValues = {
    first_name: managementUser?.first_name ?? "",
    last_name: managementUser?.last_name ?? "",
    country: managementUser?.country ?? "",
    role: managementUser?.role ?? "",
  };

  type FormValues = typeof initialValues;

  const handleSubmit = async (
    values: FormValues,
    {
      setErrors,
      setSubmitting,
      resetForm,
      setStatus,
    }: FormikHelpers<FormValues>,
  ) => {
    if (!managementUser?.uid) {
      toast.error("No management user selected to edit");
      setSubmitting(false);
      return;
    }

    try {
      let body: unknown;

      if (selectedFile) {
        const form = new FormData();
        form.append("avatar", selectedFile);
        form.append("first_name", values.first_name);
        form.append("last_name", values.last_name);
        form.append("country", values.country);
        form.append("role", values.role);
        body = form;
      } else {
        // Do not include `avatar` when no new file is selected so the server
        // does not clear an existing avatar unintentionally.
        body = {
          first_name: values.first_name,
          last_name: values.last_name,
          country: values.country,
          role: values.role,
        };
      }

      await editManagement({
        managementUid: managementUser.uid,
        body,
      }).unwrap();

      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Updated",
        html: `Management user <span class="text-primary">${
          values.first_name || "user"
        }</span> updated successfully.`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 3000,
      });

      resetForm();
      setSelectedFile(null);
      onClose();
    } catch (error: unknown) {
      console.error("Edit management user failed:", error);
      setSubmitting(false);
      const err = error as { data?: unknown; response?: { data?: unknown } };
      const data = err?.data || err?.response?.data;

      if (data && typeof data === "object") {
        const obj = data as Record<string, unknown>;
        const fieldErrors: Partial<Record<keyof FormValues, string>> = {};
        const generalMessages: string[] = [];

        // helper: map API key to form key (try direct, snake_case, camelCase)
        const mapKeyToField = (k: string) => {
          if (Object.prototype.hasOwnProperty.call(initialValues, k)) return k;
          // camelCase -> snake_case
          const snake = k.replace(/([A-Z])/g, "_$1").toLowerCase();
          if (Object.prototype.hasOwnProperty.call(initialValues, snake))
            return snake;
          // snake_case or kebab-case -> camelCase
          const camel = k.replace(/[-_](\w)/g, (_, c) =>
            c ? c.toUpperCase() : "",
          );
          if (Object.prototype.hasOwnProperty.call(initialValues, camel))
            return camel;
          return null;
        };

        Object.keys(obj).forEach((k) => {
          const v = obj[k];
          const message = Array.isArray(v)
            ? (v as unknown[]).join(", ")
            : String(v);
          const formKey = mapKeyToField(k);
          if (formKey) {
            (fieldErrors as Record<string, string>)[formKey] = message;
          } else {
            generalMessages.push(`${k}: ${message}`);
          }
        });

        if (Object.keys(fieldErrors).length)
          setErrors(fieldErrors as unknown as Record<keyof FormValues, string>);
        if (generalMessages.length) {
          generalMessages.forEach((m) => toast.error(m));
          if (setStatus) setStatus({ generalMessages });
        }
        if (!generalMessages.length && !Object.keys(fieldErrors).length) {
          toast.error("Failed to update management user");
          if (setStatus)
            setStatus({
              generalMessages: ["Failed to update management user"],
            });
        }
      } else {
        toast.error("Failed to update management user");
        if (setStatus)
          setStatus({ generalMessages: ["Failed to update management user"] });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-md shadow-md md:!max-w-2xl dark:shadow-gray-600">
        <DialogHeader>
          <DialogTitle className="text-primary">
            Edit Management User
          </DialogTitle>
          <DialogDescription>
            <small>Edit the details of the selected management user.</small>
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit, status }) => (
            <FormikForm onSubmit={handleSubmit} className="space-y-4">
              {status?.generalMessages && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {status.generalMessages.map((m: string, i: number) => (
                    <div key={i}>{m}</div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <Label htmlFor="first_name" className="mb-1">
                    First Name
                  </Label>
                  <Field
                    id="first_name"
                    name="first_name"
                    as="input"
                    type="text"
                    placeholder="First name"
                  />
                  <ErrorMessage
                    name="first_name"
                    component="div"
                    className="text-danger mt-1 text-xs"
                  />
                </div>

                <div>
                  <Label htmlFor="last_name" className="mb-1">
                    Last Name
                  </Label>
                  <Field
                    id="last_name"
                    name="last_name"
                    as="input"
                    type="text"
                    placeholder="Last name"
                  />
                  <ErrorMessage
                    name="last_name"
                    component="div"
                    className="text-danger mt-1 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <Label htmlFor="country" className="mb-1">
                    Country (ISO)
                  </Label>
                  <Field id="country" name="country" as="select">
                    <option value="">Select country</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name} ({country.code})
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="country"
                    component="div"
                    className="text-danger mt-1 text-xs"
                  />
                </div>

                <div>
                  <Label htmlFor="role" className="mb-1">
                    Role
                  </Label>
                  <Field
                    id="role"
                    name="role"
                    as="select"
                    className="w-full rounded-md border bg-transparent px-3 py-2"
                  >
                    <option value="">Select role</option>
                    <option value="MANAGEMENT_STAFF">Management Staff</option>
                    <option value="MANAGEMENT_ADMIN">Management Admin</option>
                  </Field>
                  <ErrorMessage
                    name="role"
                    component="div"
                    className="text-danger mt-1 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-1">
                <div>
                  <Label htmlFor="avatar" className="mb-1">
                    Avatar
                  </Label>
                  <input
                    id="avatar"
                    name="avatar"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.currentTarget.files?.[0] ?? null;
                      setSelectedFile(f);
                      if (f) setPreviewUrl(URL.createObjectURL(f));
                    }}
                    className="w-full"
                  />
                  {previewUrl && (
                    <div className="mt-2">
                      <Image
                        src={previewUrl as string}
                        alt="avatar preview"
                        width={64}
                        height={64}
                        className="rounded-full object-cover w-16 h-16"
                        unoptimized
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </FormikForm>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default EditManagementUserDialog;
