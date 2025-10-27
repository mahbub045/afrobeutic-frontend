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
import { useInviteMemberMutation } from "@/Redux/Reducers/ClientPanel/Members/MembersApi";
import {
  AddNewMemberDialogProps,
  FormValueProps,
} from "@/Types/ClientPanel/ManageSalonTypes/MemberTypes/MemberType";
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from "formik";
import { useTheme } from "next-themes";
import React from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as Yup from "yup";

const roles = [
  { value: "ADMIN", label: "Admin - Full Access" },
  { value: "STAFF", label: "Staff - Limited Access" },
];

const validationSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  role: Yup.string().required("Required"),
});

const AddNewMemberDialog: React.FC<AddNewMemberDialogProps> = ({
  isOpen,
  onClose,
  onInvite,
}) => {
  const { resolvedTheme } = useTheme();
  const initialValues: FormValueProps = { email: "", role: "" };

  const [inviteMember] = useInviteMemberMutation();

  const handleSubmit = async (
    userData: FormValueProps,
    { setSubmitting, resetForm }: FormikHelpers<FormValueProps>,
  ) => {
    setSubmitting(true);
    try {
      await inviteMember(userData).unwrap();
      onInvite?.(userData.email, userData.role);
      resetForm();
      onClose();
      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Invitation Sent",
        text: `An invitation has been sent to ${userData.email}`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
      });
    } catch (error) {
      console.error("Failed to invite user:", error);
      toast.error("Failed to send invitation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="shadow-md dark:shadow-gray-600">
        <DialogHeader>
          <DialogTitle>Add new user</DialogTitle>
          <DialogDescription>
            Invite a new user by email and assign an access role.
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="mt-4 space-y-4">
              <div className="relative">
                <Label htmlFor="email" className="mb-2">
                  Email of the User<span className="text-danger">*</span>
                </Label>
                <Field
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email of the inviting user"
                  required
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-danger mt-1 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="role" className="mb-2">
                  Access Type / Role<span className="text-danger">*</span>
                </Label>
                <Field id="role" name="role" as="select" required>
                  <option value="" disabled>
                    Select a role
                  </option>
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-40 text-white"
                >
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

export default AddNewMemberDialog;
