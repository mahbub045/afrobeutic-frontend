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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChangePasswordMutation } from "@/Redux/Reducers/Common/ProfileApi";
import {
  ChangePasswordDialogProps,
  ChangePasswordErrors,
  ChangePasswordPayload,
} from "@/Types/Common/ProfileType";
import { ErrorMessage, Field, FieldProps, Form, Formik } from "formik";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as Yup from "yup";

function getApiErrorMessages(error: unknown): string[] {
  const err = error as {
    data?: unknown;
    response?: { data?: unknown };
    message?: unknown;
  };
  const data = err?.data || err?.response?.data;

  if (typeof data === "string") return [data];
  if (data && typeof data === "object") {
    const messages: string[] = [];
    const obj = data as Record<string, unknown>;

    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      if (Array.isArray(value)) {
        const parts = (value as unknown[]).filter((v) => typeof v === "string");
        if (parts.length) messages.push(`${key}: ${parts.join(", ")}`);
      } else if (typeof value === "string") {
        messages.push(`${key}: ${value}`);
      }
    });

    if (messages.length) return messages;
  }

  if (typeof err?.message === "string" && err.message.trim()) {
    return [err.message];
  }
  return [];
}

function getApiFieldErrors(error: unknown): {
  fieldErrors: ChangePasswordErrors;
  messages: string[];
} {
  const err = error as {
    data?: unknown;
    response?: { data?: unknown };
  };
  const data = err?.data || err?.response?.data;

  const fieldErrors: ChangePasswordErrors = {};
  const messages: string[] = [];

  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;

    const setField = (field: keyof ChangePasswordPayload, value: unknown) => {
      if (typeof value === "string" && value.trim()) {
        fieldErrors[field] = value;
      } else if (Array.isArray(value)) {
        const parts = (value as unknown[]).filter((v) => typeof v === "string");
        if (parts.length) fieldErrors[field] = parts.join(", ");
      }
    };

    // Typical DRF keys
    setField("old_password", obj.old_password);
    setField("new_password", obj.new_password);
    setField("confirm_password", obj.confirm_password);

    // Alternate backend naming
    if (!fieldErrors.old_password) {
      setField("old_password", obj.current_password);
    }

    // Non-field errors / general message
    const nonField = obj.non_field_errors;
    if (typeof obj.detail === "string" && obj.detail.trim())
      messages.push(obj.detail);
    if (typeof obj.message === "string" && obj.message.trim())
      messages.push(obj.message);
    if (typeof obj.error === "string" && obj.error.trim())
      messages.push(obj.error);
    if (typeof nonField === "string" && nonField.trim())
      messages.push(nonField);
    if (Array.isArray(nonField)) {
      (nonField as unknown[])
        .filter((v) => typeof v === "string")
        .forEach((m) => messages.push(String(m)));
    }
  } else {
    messages.push(...getApiErrorMessages(error));
  }

  return { fieldErrors, messages };
}

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { resolvedTheme } = useTheme();
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formKey, setFormKey] = useState(0);
  useEffect(() => {
    if (!isOpen) return;
    setFormKey((k) => k + 1);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  }, [isOpen]);

  const initialValues: ChangePasswordPayload = useMemo(
    () => ({ old_password: "", new_password: "", confirm_password: "" }),
    [],
  );

  const validationSchema = useMemo(
    () =>
      Yup.object({
        old_password: Yup.string().required("Current password is required"),
        new_password: Yup.string()
          .min(8, "Password must be at least 8 characters")
          .matches(/(?=.*[A-Z])/, "Must contain at least one uppercase letter")
          .matches(/(?=.*[a-z])/, "Must contain at least one lowercase letter")
          .matches(/(?=.*[0-9])/, "Must contain at least one number")
          .matches(
            /(?=.*[!@#$%^&*(),.?\":{}|<>_\-+=\\/\[\];'`~])/,
            "Must contain at least one special character",
          )
          .required("New password is required"),
        confirm_password: Yup.string()
          .oneOf([Yup.ref("new_password"), undefined], "Passwords do not match")
          .required("Please confirm your new password"),
      }),
    [],
  );

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="shadow-md dark:shadow-gray-500">
        <DialogHeader>
          <DialogTitle className="text-primary">Change Password</DialogTitle>
          <DialogDescription className="text-xs">
            Enter your current password and choose a new one.
          </DialogDescription>
        </DialogHeader>

        <Formik
          key={formKey}
          initialValues={initialValues}
          validationSchema={validationSchema}
          validateOnChange={false}
          validateOnBlur={true}
          onSubmit={async (values, { setSubmitting, setErrors, resetForm }) => {
            try {
              await changePassword(values).unwrap();

              Swal.fire({
                icon: "success",
                iconColor: "#037375",
                title: "Password updated",
                html: "Your password has been updated successfully.",
                background: resolvedTheme === "dark" ? "#0f1724" : undefined,
                color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
                confirmButtonColor: "#037375",
                timer: 2000,
              });

              resetForm();
              onClose();
            } catch (error: unknown) {
              // console.error("Change password failed:", error);
              const { fieldErrors, messages } = getApiFieldErrors(error);

              if (Object.keys(fieldErrors).length > 0) {
                // Inline only when backend returns field-specific keys
                setErrors(fieldErrors as unknown as ChangePasswordErrors);
              } else if (messages.length) {
                toast.error(messages[0]);
              } else {
                toast.error("Failed to change password. Please try again.");
              }
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ handleChange, isSubmitting, values }) => (
            <Form className="space-y-4">
              <div>
                <Label htmlFor="old_password" className="mb-1">
                  Current password<span className="text-danger">*</span>
                </Label>
                <Field name="old_password">
                  {({ field }: FieldProps) => (
                    <Input
                      {...field}
                      id="old_password"
                      type="password"
                      autoComplete="current-password"
                      required
                      onChange={handleChange}
                    />
                  )}
                </Field>
                <div className="text-destructive text-sm">
                  <ErrorMessage name="old_password" />
                </div>
              </div>

              <div>
                <Label htmlFor="new_password" className="mb-1">
                  New password<span className="text-danger">*</span>
                </Label>
                <Field name="new_password">
                  {({ field }: FieldProps) => (
                    <div className="relative">
                      <Input
                        {...field}
                        id="new_password"
                        type={showNewPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        onChange={handleChange}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((s) => !s)}
                        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                        aria-label={
                          showNewPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  )}
                </Field>
                <div className="text-destructive text-sm">
                  <ErrorMessage name="new_password" />
                </div>
              </div>

              <div>
                <Label htmlFor="confirm_password" className="mb-1">
                  Confirm new password<span className="text-danger">*</span>
                </Label>
                <Field name="confirm_password">
                  {({ field }: FieldProps) => (
                    <div className="relative">
                      <Input
                        {...field}
                        id="confirm_password"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        onChange={handleChange}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((s) => !s)}
                        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  )}
                </Field>
                <div className="text-destructive text-sm">
                  <ErrorMessage name="confirm_password" />
                </div>
              </div>

              {values.new_password?.length > 0 ? (
                <div className="bg-muted/30 rounded-lg border p-4">
                  <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
                    Password Requirements:
                  </p>
                  {(() => {
                    const password = values.new_password ?? "";
                    const lengthOk = password.length >= 8;
                    const upperOk = /(?=.*[A-Z])/.test(password);
                    const lowerOk = /(?=.*[a-z])/.test(password);
                    const numberOk = /(?=.*[0-9])/.test(password);
                    const specialOk =
                      /(?=.*[!@#$%^&*(),.?\":{}|<>_\-+=\\/\[\];'`~])/.test(
                        password,
                      );

                    const Item = ({
                      ok,
                      label,
                    }: {
                      ok: boolean;
                      label: string;
                    }) => (
                      <li className="flex items-center text-xs">
                        {ok ? (
                          <Check className="mr-2 h-4 w-4 text-green-600" />
                        ) : (
                          <X className="mr-2 h-4 w-4 text-red-500" />
                        )}
                        <span
                          className={
                            ok
                              ? "text-green-700 dark:text-green-400"
                              : "text-muted-foreground"
                          }
                        >
                          {label}
                        </span>
                      </li>
                    );

                    return (
                      <ul className="space-y-2">
                        <Item ok={lengthOk} label="At least 8 characters" />
                        <Item ok={upperOk} label="One uppercase letter" />
                        <Item ok={lowerOk} label="One lowercase letter" />
                        <Item ok={numberOk} label="One number" />
                        <Item
                          ok={specialOk}
                          label="One special character (!@#$%^&*)"
                        />
                      </ul>
                    );
                  })()}
                </div>
              ) : null}

              <DialogFooter>
                <div className="flex w-full justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading || isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading || isSubmitting}>
                    {isLoading || isSubmitting
                      ? "Updating..."
                      : "Update password"}
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

export default ChangePasswordDialog;
