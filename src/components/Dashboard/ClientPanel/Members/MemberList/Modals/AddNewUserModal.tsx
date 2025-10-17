"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// using native input via Formik Field, remove custom Input import
import { Label } from "@/components/ui/label";
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from "formik";
import React from "react";
import * as Yup from "yup";

export interface AddNewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  // optional callback when invitation is sent
  onInvite?: (email: string, role: string) => void;
}

const roles = [
  { value: "ADMIN", label: "Admin - Full Access" },
  { value: "STAFF", label: "Staff - Limited Access" },
];

type FormValues = {
  email: string;
  role: string;
};

const validationSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  role: Yup.string().required("Required"),
});

const AddNewUserModal: React.FC<AddNewUserModalProps> = ({
  isOpen,
  onClose,
  onInvite,
}) => {
  const initialValues: FormValues = { email: "", role: "" };

  const submit = async (
    values: FormValues,
    helpers: FormikHelpers<FormValues>,
  ) => {
    helpers.setSubmitting(true);
    try {
      // placeholder for API call
      await new Promise((r) => setTimeout(r, 600));
      onInvite?.(values.email, values.role);
      helpers.resetForm();
      onClose();
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new user</DialogTitle>
          <DialogDescription>
            Invite a new user by email and assign an access role.
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={submit}
        >
          {({
            values,
            handleChange,
            isSubmitting,
            setFieldValue,
            errors,
            touched,
          }) => (
            <Form className="mt-4 space-y-4">
              <div>
                <Label htmlFor="invite-email" className="mb-2">
                  Email of the User<span className="text-danger">*</span>
                </Label>
                <Field
                  id="invite-email"
                  name="email"
                  as="input"
                  placeholder="email of the inviting user"
                  className="w-full rounded-md border bg-transparent px-3 py-1 text-base"
                  aria-invalid={!!(touched.email && errors.email)}
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-danger mt-1 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="invite-role" className="mb-2">
                  Access Type / Role<span className="text-danger">*</span>
                </Label>
                <Field name="role">
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="role"
                  component="div"
                  className="text-danger mt-1 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="w-40">
                  {isSubmitting ? "Sending..." : "Send invitation"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default AddNewUserModal;
