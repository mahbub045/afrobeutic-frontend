import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { countries } from "@/data/countries";
import { useRegisterManagementMutation } from "@/Redux/Reducers/AdminPanel/Managements/ManagementsApi";
import { ManagementsListDialogsProps } from "@/Types/AdminPanel/ManagementsTypes/ManagementsType";
import {
  ErrorMessage,
  Field,
  FieldProps,
  Formik,
  Form as FormikForm,
  FormikHelpers,
} from "formik";
import { Eye, EyeOff } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  country: Yup.string().required("Country is required"),
  role: Yup.string().required(),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirm_password: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});

const RegisterManagementDialog: React.FC<ManagementsListDialogsProps> = ({
  isOpen,
  onClose,
}) => {
  const [registerManagement, { isLoading }] = useRegisterManagementMutation();
  const { resolvedTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  const initialValues = {
    first_name: "",
    last_name: "",
    email: "",
    country: "",
    role: "MANAGEMENT_STAFF",
    password: "",
    confirm_password: "",
  };

  type FormValues = typeof initialValues;

  const handleSubmit = async (
    values: FormValues,
    { resetForm, setErrors, setSubmitting }: FormikHelpers<FormValues>,
  ) => {
    try {
      const payload = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        country: values.country,
        role: values.role,
        password: values.password,
        confirm_password: values.confirm_password,
      };

      await registerManagement(payload).unwrap();

      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Registered",
        html: `Verification email sent to <span class="text-primary">${values.email}</span>. Please check your inbox to verify your account.`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 3000,
      });
      resetForm();
      onClose();
    } catch (error: unknown) {
      console.error("Register management failed:", error);
      setSubmitting(false);
      // Try to extract meaningful messages from API error and map them to form fields
      const err = error as {
        data?: unknown;
        response?: { data?: unknown };
        message?: unknown;
      };
      const data = err?.data || err?.response?.data;

      if (data && typeof data === "object") {
        const obj = data as Record<string, unknown>;
        const fieldErrors: Partial<Record<keyof FormValues, string>> = {};
        const generalMessages: string[] = [];

        Object.keys(obj).forEach((k) => {
          const v = obj[k];
          const message = Array.isArray(v)
            ? (v as unknown[]).join(", ")
            : String(v);
          // If the key matches a form field, set it as a field error
          if (Object.prototype.hasOwnProperty.call(initialValues, k)) {
            // cast to proper key of FormValues
            (fieldErrors as Record<string, string>)[k] = message;
          } else {
            generalMessages.push(`${k}: ${message}`);
          }
        });

        if (Object.keys(fieldErrors).length)
          setErrors(fieldErrors as unknown as Record<keyof FormValues, string>);
        if (generalMessages.length)
          generalMessages.forEach((m) => toast.error(m));
        if (!generalMessages.length && !Object.keys(fieldErrors).length)
          toast.error("Failed to register management user");
      } else {
        // Fallback to generic error message
        toast.error("Failed to register management user");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-md md:!max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-primary text-lg">
            Register Management
          </DialogTitle>
          <DialogDescription>
            <small>
              Fill in the details to register a new management user.
            </small>
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit }) => (
            <FormikForm onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <Label htmlFor="first_name" className="mb-1">
                    First Name
                  </Label>
                  <Field
                    id="first_name"
                    name="first_name"
                    type="text"
                    as="input"
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
                    type="text"
                    as="input"
                    placeholder="Last name"
                  />
                  <ErrorMessage
                    name="last_name"
                    component="div"
                    className="text-danger mt-1 text-xs"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="mb-1">
                  Email
                </Label>
                <Field
                  id="email"
                  name="email"
                  as="input"
                  type="email"
                  placeholder="email@example.com"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-danger mt-1 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <Label htmlFor="country" className="mb-1">
                    Country (ISO)
                  </Label>
                  <Field
                    id="country"
                    name="country"
                    as="select"
                    placeholder="BD"
                  >
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

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <Label htmlFor="password" className="mb-1">
                    Password
                  </Label>
                  <div className="relative">
                    <Field id="password" name="password">
                      {({ field }: FieldProps) => (
                        <>
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="h-12 w-full"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            className="text-muted-foreground absolute top-3 right-2 text-sm"
                          >
                            {showPassword ? <EyeOff /> : <Eye />}
                          </button>
                        </>
                      )}
                    </Field>
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-danger mt-1 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirm_password" className="mb-1">
                    Confirm Password
                  </Label>
                  <Field
                    id="confirm_password"
                    name="confirm_password"
                    as="input"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm password"
                  />
                  <ErrorMessage
                    name="confirm_password"
                    component="div"
                    className="text-danger mt-1 text-xs"
                  />
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
                  {isLoading ? "Registering..." : "Register"}
                </Button>
              </div>
            </FormikForm>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterManagementDialog;
