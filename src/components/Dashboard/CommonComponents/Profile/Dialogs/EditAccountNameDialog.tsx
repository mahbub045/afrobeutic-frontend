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
import { useEditProfileMutation } from "@/Redux/Reducers/Common/ProfileApi";
import { ErrorMessage, Field, FieldProps, Form, Formik } from "formik";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import React, { useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as Yup from "yup";

const schema = Yup.object().shape({
  name: Yup.string().max(255).required("Account name is required"),
});

const EditAccountNameDialog: React.FC<{
  accountName?: string | null;
  isFetching?: boolean;
}> = ({ accountName, isFetching }) => {
  const {data:session} = useSession();
  const [open, setOpen] = useState(false);
  const { resolvedTheme } = useTheme();

  const [editProfile, { isLoading: isMutating }] = useEditProfileMutation();

  const initialValues = {
    name: accountName ?? "",
  };

  const handleSubmit = async (
    values: { name: string },
    { setSubmitting }: { setSubmitting: (b: boolean) => void },
  ) => {
    try {
      const formData = new FormData();
      // Backend convention: update account name via the profile endpoint.
      formData.append("account.name", values.name);
      await editProfile(formData).unwrap();

      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Account updated",
        html: `Your account name has been updated successfully.`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 2000,
      });

      setOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to update account name. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {session?.user?.role === "OWNER" && (
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Edit
        </Button>
      </DialogTrigger>
      )}

      <DialogContent className="shadow-md dark:shadow-gray-500">
        <DialogHeader>
          <DialogTitle className="text-primary">Edit Account Name</DialogTitle>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={schema}
          onSubmit={handleSubmit}
        >
          {({ handleChange, isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <Label htmlFor="name" className="mb-1">
                  Account name
                </Label>
                <Field name="name">
                  {({ field }: FieldProps) => (
                    <Input {...field} id="name" onChange={handleChange} />
                  )}
                </Field>
                <div className="text-destructive text-sm">
                  <ErrorMessage name="name" />
                </div>
              </div>

              <DialogFooter>
                <div className="flex w-full justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
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

export default EditAccountNameDialog;
