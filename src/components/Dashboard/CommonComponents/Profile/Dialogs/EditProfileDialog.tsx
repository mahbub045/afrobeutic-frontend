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
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Image from "next/image";
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
  const { update: updateSession } = useSession();

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

  // helper to flatten/collect messages from arbitrary error shapes
  const collectErrorMessages = (value: unknown): string[] => {
    if (value == null) return [];
    if (typeof value === "string") return [value];
    if (Array.isArray(value))
      return value.map((v) => (typeof v === "string" ? v : JSON.stringify(v)));
    if (typeof value === "object") {
      try {
        // value is object but could be null which is handled above
        return Object.values(value as Record<string, unknown>).flatMap((v) =>
          collectErrorMessages(v),
        );
      } catch {
        return [String(value)];
      }
    }
    return [String(value)];
  };

  // returns a single string for general toast notifications
  // numeric values (e.g. HTTP status codes) are considered unhelpful and
  // will be treated as empty, allowing callers to skip toasting them.
  const getErrorMessage = (err: unknown): string => {
    if (err == null) return "Unknown error";
    if (typeof err === "number") return ""; // ignore codes like 400
    if (typeof err === "string") return err;

    // use optional chaining only after narrowing to object
    if (typeof err === "object" && err !== null) {
      const obj = err as Record<string, unknown>;

      const msgs = collectErrorMessages(err);
      if (msgs.length) return msgs.join(", ");

      if (obj.data && typeof obj.data === "object") {
        const msgs2 = collectErrorMessages(obj.data);
        if (msgs2.length) return msgs2.join(", ");
      }

      if (typeof obj.error === "string") return obj.error;
      if (typeof obj.message === "string") {
        if (/status code/i.test(obj.message)) return "Server returned an error";
        return obj.message;
      }
    }

    try {
      return JSON.stringify(err);
    } catch {
      return "";
    }
  };

  // convert a nested error object coming from the API into Formik's errors map
  const mapToFormikErrors = (data: unknown): Record<string, string> => {
    const out: Record<string, string> = {};
    if (!data || typeof data !== "object") return out;

    Object.entries(data as Record<string, unknown>).forEach(([k, v]) => {
      if (typeof v === "string") out[k] = v;
      else if (Array.isArray(v)) out[k] = v.join(", ");
      else if (typeof v === "object" && v !== null) {
        // flatten deeper objects as well
        const msgs = collectErrorMessages(v);
        if (msgs.length) out[k] = msgs.join(", ");
      } else {
        out[k] = String(v);
      }
    });

    return out;
  };

  const handleSubmit = async (
    values: { first_name: string; last_name: string; country: string },
    helpers: {
      setSubmitting: (b: boolean) => void;
      setErrors: (errs: Record<string, string>) => void;
    },
  ) => {
    try {
      const form = new FormData();
      form.append("first_name", values.first_name);
      form.append("last_name", values.last_name);
      form.append("country", values.country);
      if (selectedFile) {
        form.append("avatar", selectedFile);
      }

      const result = await editProfile(form).unwrap();

      // Update NextAuth session with new profile data
      await updateSession({
        user: {
          first_name: result.first_name || values.first_name,
          last_name: result.last_name || values.last_name,
          country: result.country || values.country,
          avatar: result.avatar || userData?.avatar,
        },
      });

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
    } catch (e: unknown) {
      console.error(e);

      let fieldErrors: Record<string, string> = {};

      if (typeof e === "object" && e !== null && "data" in e) {
        const maybeObj = e as Record<string, unknown>;
        if (typeof maybeObj.data === "object" && maybeObj.data !== null) {
          const dataObj = maybeObj.data as Record<string, unknown>;
          // top‑level field errors
          fieldErrors = mapToFormikErrors(dataObj);
          // also handle nested `errors` property that some backends use
          if (
            "errors" in dataObj &&
            typeof dataObj.errors === "object" &&
            dataObj.errors !== null
          ) {
            const nested = mapToFormikErrors(
              dataObj.errors as Record<string, unknown>,
            );
            fieldErrors = { ...fieldErrors, ...nested };
          }
          if (Object.keys(fieldErrors).length) {
            helpers.setErrors(fieldErrors);
          }
        }
      }

      // show a toast only for non‑field (generic) messages
      const msg = getErrorMessage(e);
      if (msg) {
        // if the message is identical to one of the field error values, skip toasting
        const matchesField = Object.values(fieldErrors).some((v) =>
          msg.includes(v),
        );
        if (!matchesField) {
          msg.split(/,\s*/).forEach((m) => {
            // ignore bare codes
            if (/^\d+$/.test(m.trim())) return;
            toast.error(m);
          });
        }
      }
    } finally {
      helpers.setSubmitting(false);
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
        <Button size="sm" className="w-full sm:w-auto">
          Edit Profile
        </Button>
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
          {({ handleChange, isSubmitting, errors }) => (
            <Form className="space-y-4">
              <div>
                <Label htmlFor="avatar" className="mb-1">
                  Avatar
                </Label>
                <div className="flex items-center gap-4">
                  <div className="relative overflow-hidden">
                    {preview ? (
                      <Image
                        src={preview}
                        alt="avatar-preview"
                        height={80}
                        width={80}
                        className="h-20 w-28 rounded-full object-cover"
                      />
                    ) : userData?.avatar ? (
                      <Image
                        src={userData?.avatar}
                        alt="avatar"
                        height={80}
                        width={80}
                        className="h-20 w-28 rounded-full object-cover"
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
                {/* display any error returned for avatar / file-related keys */}
                {Object.entries(errors)
                  .filter(([k]) => /avatar|file/i.test(k))
                  .map(([k, v]) => (
                    <div key={k} className="text-destructive text-sm">
                      {v as string}
                    </div>
                  ))}
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedFile(null);
                      setOpen(false);
                    }}
                  >
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
