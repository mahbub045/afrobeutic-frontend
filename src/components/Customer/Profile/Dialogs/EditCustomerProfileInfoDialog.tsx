"use client";

import { Field, Form, Formik, type FieldProps, type FormikProps } from "formik";
import * as Yup from "yup";

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
import {
  useGetCustomerProfileQuery,
  useUpdateCustomerProfileMutation,
} from "@/Redux/Api/CustomerBaseApi";
import {
  CustomerProfileFormValues,
  EditCustomerProfileInfoDialogProps,
} from "@/Types/Customer/ProfileTypes";
import { toast } from "react-toastify";

const ProfileSchema = Yup.object().shape({
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email"),
});

const EditCustomerProfileInfoDialog: React.FC<
  EditCustomerProfileInfoDialogProps
> = ({ open, onOpenChange }) => {
  const { data: profile, isLoading } = useGetCustomerProfileQuery(undefined);
  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateCustomerProfileMutation();

  const initialValues: CustomerProfileFormValues = {
    first_name: profile?.first_name ?? "",
    last_name: profile?.last_name ?? "",
    email: profile?.email ?? "",
  };

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      await updateProfile({ payload: values }).unwrap();
      const success = "Profile updated successfully";
      toast.success(success);

      // Close after short delay
      setTimeout(() => {
        onOpenChange(false);
      }, 800);
    } catch (err) {
      let message = "Update failed";
      if (err && typeof err === "object") {
        const errObj = err as Record<string, unknown>;
        const data = errObj.data as Record<string, unknown> | undefined;
        const msgFromData =
          data && typeof data.message === "string" ? data.message : undefined;
        const msgFromErr =
          typeof errObj.message === "string" ? errObj.message : undefined;
        message = msgFromData ?? msgFromErr ?? message;
      }
      toast.error(message);
    }
  };

  const getFieldError = (e: unknown): string | null =>
    typeof e === "string" ? e : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile Information</DialogTitle>
          <DialogDescription>
            Here you can edit your profile information.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="grid place-items-center py-6">
            <div className="flex flex-col items-center gap-2">
              <span className="animate-spin">⏳</span>
              <div className="text-muted-foreground text-sm">Loading…</div>
            </div>
          </div>
        ) : (
          <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={ProfileSchema}
            onSubmit={handleSubmit}
          >
            {({
              errors,
              touched,
            }: Pick<
              FormikProps<CustomerProfileFormValues>,
              "errors" | "touched"
            >) => (
              <Form className="space-y-4 py-2">
                <div className="grid gap-2">
                  <div>
                    <Label className="pb-2">First name</Label>
                    <Field name="first_name">
                      {({ field }: FieldProps) => (
                        <Input {...field} placeholder="First name" />
                      )}
                    </Field>
                    {typeof errors.first_name === "string" &&
                    touched.first_name ? (
                      <div className="text-destructive text-sm">
                        {errors.first_name}
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <Label className="pb-2">Last name</Label>
                    <Field name="last_name">
                      {({ field }: FieldProps) => (
                        <Input {...field} placeholder="Last name" />
                      )}
                    </Field>
                    {typeof errors.last_name === "string" &&
                    touched.last_name ? (
                      <div className="text-destructive text-sm">
                        {errors.last_name}
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <Label className="pb-2">Email</Label>
                    <Field name="email">
                      {({ field }: FieldProps) => (
                        <Input {...field} placeholder="Email" />
                      )}
                    </Field>
                    {getFieldError(errors.email) && touched.email ? (
                      <div className="text-destructive text-sm">
                        {getFieldError(errors.email)}
                      </div>
                    ) : null}
                  </div>
                </div>

                <DialogFooter>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => onOpenChange(false)}
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? "Saving…" : "Save changes"}
                    </Button>
                  </div>
                </DialogFooter>
              </Form>
            )}
          </Formik>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditCustomerProfileInfoDialog;
