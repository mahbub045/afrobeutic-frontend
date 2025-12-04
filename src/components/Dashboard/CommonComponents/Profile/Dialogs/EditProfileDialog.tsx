"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { countries } from "@/data/countries";
import { useEditProfileMutation } from "@/Redux/Reducers/Common/ProfileApi";
import { ProfileDataProps } from "@/Types/Common/ProfileType";

import { ErrorMessage, Field, FieldProps, Form, Formik } from "formik";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as Yup from "yup";

const schema = Yup.object().shape({
  first_name: Yup.string().max(255).required("First name is required"),
  last_name: Yup.string().max(255).required("Last name is required"),
  country: Yup.string().required("Country is required"),
});

const EditProfileDialog: React.FC<{
  data?: ProfileDataProps;
  isFetching?: boolean;
}> = ({ data: userData, isFetching }) => {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();

  const [editProfile, { isLoading: isMutating }] = useEditProfileMutation();

  // generate preview when selectedFile changes
  useEffect(() => {
    if (!selectedFile) {
      setPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(selectedFile);
    return () => {
      // nothing to cleanup for FileReader
    };
  }, [selectedFile]);

  const handleSubmit = async (
    values: { first_name: string; last_name: string; country: string },
    { setSubmitting }: { setSubmitting: (b: boolean) => void },
  ) => {
    try {
      const form = new FormData();
      form.append("first_name", values.first_name);
      form.append("last_name", values.last_name);
      form.append("country", values.country);
      if (selectedFile) {
        form.append("avatar", selectedFile);
      }

      await editProfile(form).unwrap();

      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Profile updated",
        html: `Your profile has been updated successfully.`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 2000,
      });

      setSelectedFile(null);
      setOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const initialValues = {
    first_name: userData?.first_name ?? "",
    last_name: userData?.last_name ?? "",
    country: userData?.country ?? "",
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Edit Profile</Button>
      </DialogTrigger>

      <DialogContent className="shadow-md dark:shadow-gray-500">
        <DialogHeader>
          <DialogTitle className="text-primary">Edit Profile</DialogTitle>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={schema}
          onSubmit={handleSubmit}
        >
          {({ values, handleChange, isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <Label htmlFor="avatar" className="mb-1">
                  Avatar
                </Label>
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 overflow-hidden rounded border">
                    {preview ? (
                      // using next/image for consistent rendering
                      // `preview` is a data URL
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={preview}
                        alt="avatar-preview"
                        className="h-full w-full object-cover"
                      />
                    ) : userData?.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={userData.avatar}
                        alt="avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="bg-muted text-muted-foreground flex h-full w-full items-center justify-center">
                        No Image
                      </div>
                    )}
                  </div>

                  <input
                    id="avatar"
                    name="avatar"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files && e.target.files[0];
                      setSelectedFile(f ?? null);
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="first_name" className="mb-1">
                    First name
                  </Label>
                  <Field name="first_name">
                    {({ field }: FieldProps) => (
                      <Input
                        {...field}
                        id="first_name"
                        onChange={handleChange}
                      />
                    )}
                  </Field>
                  <div className="text-destructive text-sm">
                    <ErrorMessage name="first_name" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="last_name" className="mb-1">
                    Last name
                  </Label>
                  <Field name="last_name">
                    {({ field }: FieldProps) => (
                      <Input
                        {...field}
                        id="last_name"
                        onChange={handleChange}
                      />
                    )}
                  </Field>
                  <div className="text-destructive text-sm">
                    <ErrorMessage name="last_name" />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="country" className="mb-1">
                  Country
                </Label>
                <Field name="country" as="select">
                  <option value="">Select a country</option>
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </Field>
                <div className="text-destructive text-sm">
                  <ErrorMessage name="country" />
                </div>
              </div>

              <DialogFooter>
                <div className="flex w-full justify-end gap-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || isMutating || !!isFetching}
                  >
                    {isMutating || isSubmitting || isFetching
                      ? "Saving..."
                      : "Save"}
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

export default EditProfileDialog;
