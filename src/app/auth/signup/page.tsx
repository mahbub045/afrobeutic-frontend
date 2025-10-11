"use client";

import { Button } from "@/components/ui/button";
import { countries } from "@/data/countries";
import apiClient from "@/services/api-client";
import { FormikHelpers, SignUpFormValues } from "@/Types/SignUp/SignUpTypes";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { Eye, EyeOff, LoaderPinwheel, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";

const validationSchema = Yup.object({
  firstName: Yup.string().required("Required"),
  lastName: Yup.string().required("Required"),
  email: Yup.string().email("Invalid email address").required("Required"),
  country: Yup.string(),
  // gender: Yup.string().required("Required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), undefined], "Passwords must match")
    .required("Required"),
});

const SignUp: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  // API call function using apiClient
  const registerUser = async (userData: {
    first_name: string;
    last_name: string;
    email: string;
    country: string;
    password: string;
    confirm_password: string;
  }) => {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  };

  const handleSubmit = async (
    values: SignUpFormValues,
    { setSubmitting, resetForm }: FormikHelpers,
  ) => {
    try {
      setIsLoading(true);

      // Transform field names to match API expectations
      const userData = {
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        country: values.country,
        password: values.password,
        confirm_password: values.confirmPassword,
      };

      console.log("Sending user data to API:", userData);

      const response = await registerUser(userData);
      console.log("API Response:", response);

      // Show success message
      toast.success(
        "Account created successfully! Please check your email to verify your account.",
      );

      // Reset form
      resetForm();

      // Redirect to login page or email verification page
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (error: unknown) {
      console.error("Registration error:", error);

      // Type guard for Axios error handling (apiClient uses Axios)
      if (error && typeof error === "object" && "response" in error) {
        const apiError = error as {
          response?: {
            data?: {
              message?: string;
              email?: string[];
              [key: string]: string | string[] | undefined;
            };
            status?: number;
            statusText?: string;
          };
          message?: string;
        };

        // Handle different error types
        if (apiError.response?.data) {
          const errorData = apiError.response.data;

          // Handle field-specific errors (like {"email":["user with this email already exists."]})
          if (errorData.email && Array.isArray(errorData.email)) {
            toast.error(`Email Error: ${errorData.email[0]}`);
          } else if (errorData.message) {
            toast.error(`Registration failed: ${errorData.message}`);
          } else {
            // Handle other field errors
            const fieldErrors = Object.entries(errorData)
              .filter(([, value]) => Array.isArray(value) && value.length > 0)
              .map(([field, errors]) => `${field}: ${(errors as string[])[0]}`)
              .join(", ");

            if (fieldErrors) {
              toast.error(`Validation Error: ${fieldErrors}`);
            } else {
              toast.error(
                "Registration failed - Please check your information and try again.",
              );
            }
          }
        } else if (apiError.response?.status === 400) {
          toast.error(
            "Invalid data - Please check your information and try again.",
          );
        } else if (apiError.response?.status === 409) {
          toast.error(
            "Account already exists - An account with this email already exists.",
          );
        } else if (
          apiError.response?.status &&
          apiError.response.status >= 500
        ) {
          toast.error("Server error - Please try again later.");
        } else {
          toast.error(
            apiError.message ||
              "Registration failed - Something went wrong. Please try again.",
          );
        }
      } else {
        toast.error(
          "Network error - Please check your internet connection and try again.",
        );
      }
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-[#0f1724] dark:via-[#0b1220] dark:to-[#02040a]">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -left-32 h-96 w-96 rounded-full bg-gradient-to-tr from-blue-700/40 to-indigo-600/30 opacity-60 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 -bottom-24 h-96 w-96 rounded-full bg-gradient-to-br from-purple-700/30 to-pink-600/20 opacity-50 blur-3xl" />

      <div className="flex h-full min-h-screen w-full flex-col items-center justify-center border border-gray-200/30 bg-white/40 py-5 shadow-2xl backdrop-blur-md dark:border-white/8 dark:bg-white/5">
        <div className="relative flex flex-col items-center justify-center border border-gray-200/20 bg-white/50 p-8 shadow-lg backdrop-blur-sm md:rounded-lg md:px-12 dark:border-white/5 dark:bg-white/5">
          <div className="absolute top-4 right-4">
            <button
              type="button"
              onClick={toggleTheme}
              className={`cursor-pointer rounded-md p-2 transition ${
                theme === "dark"
                  ? "!bg-white/6 !text-white/90 hover:!bg-white/10"
                  : "!bg-gray-200 !text-gray-700 hover:!bg-gray-300"
              }`}
              aria-label="Toggle dark mode"
              title="Toggle dark mode"
            >
              {theme === "dark" ? <Sun /> : <Moon />}
            </button>
          </div>
          <div className="relative my-2 flex h-14 w-48 items-center justify-center">
            <Image
              src="/images/logo-light.png"
              alt="Afrobeutic Logo"
              fill
              className="block object-contain dark:hidden"
            />

            {/* Dark logo (shown in dark mode) */}
            <Image
              src="/images/logo-dark.png"
              alt="Afrobeutic Logo"
              fill
              className="hidden object-contain dark:block"
            />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 md:text-4xl dark:text-white">
            Create an Account
          </h1>
          <p className="mt-2 mb-4 max-w-md text-center text-sm text-gray-600 dark:text-white/80">
            Join Afrobeutic — manage clients, projects and access your
            dashboard.
          </p>

          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-3xl">
              <Formik
                initialValues={{
                  firstName: "",
                  lastName: "",
                  email: "",
                  country: "",
                  password: "",
                  confirmPassword: "",
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                    {/* First Name */}
                    <div>
                      <label
                        htmlFor="firstName"
                        className="mb-2 block text-sm font-medium text-gray-700 dark:text-white/85"
                      >
                        First Name<span className="text-danger">*</span>
                      </label>
                      <Field
                        type="text"
                        name="firstName"
                        id="firstName"
                        placeholder="First Name"
                        required
                      />
                      <ErrorMessage
                        name="firstName"
                        component="div"
                        className="text-danger mt-1 text-xs"
                      />
                    </div>
                    {/* Last Name */}
                    <div>
                      <label
                        htmlFor="lastName"
                        className="mb-2 block text-sm font-medium text-gray-700 dark:text-white/85"
                      >
                        Last Name<span className="text-danger">*</span>
                      </label>
                      <Field
                        type="text"
                        name="lastName"
                        id="lastName"
                        placeholder="Last Name"
                        required
                      />
                      <ErrorMessage
                        name="lastName"
                        component="div"
                        className="text-danger mt-1 text-xs"
                      />
                    </div>
                    {/* Country */}
                    <div>
                      <label
                        htmlFor="country"
                        className="mb-2 block text-sm font-medium text-gray-700 dark:text-white/85"
                      >
                        Country<span className="text-danger">*</span>
                      </label>
                      <Field as="select" name="country" id="country" required>
                        <option value="">Select country</option>
                        {countries.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.name}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage
                        name="country"
                        component="div"
                        className="text-danger mt-1 text-xs"
                      />
                    </div>
                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-medium text-gray-700 dark:text-white/85"
                      >
                        Email<span className="text-danger">*</span>
                      </label>
                      <div className="relative">
                        <Field
                          type="email"
                          name="email"
                          id="email"
                          placeholder="you@company.com"
                          required
                        />
                      </div>
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="text-danger mt-1 text-xs"
                      />
                    </div>
                    {/* Password */}
                    <div>
                      <label
                        htmlFor="password"
                        className="mb-2 block text-sm font-medium text-gray-700 dark:text-white/85"
                      >
                        Password<span className="text-danger">*</span>
                      </label>
                      <div className="relative">
                        <Field
                          type={showPassword ? "text" : "password"}
                          name="password"
                          id="password"
                          placeholder="Choose a secure password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-sm text-gray-600 hover:text-gray-800 dark:text-white/70 dark:hover:text-white"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? <EyeOff /> : <Eye />}
                        </button>
                      </div>
                      <ErrorMessage
                        name="password"
                        component="div"
                        className="text-danger mt-1 text-xs"
                      />
                    </div>
                    {/* Confirm Password */}
                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="mb-2 block text-sm font-medium text-gray-700 dark:text-white/85"
                      >
                        Confirm Password<span className="text-danger">*</span>
                      </label>
                      <Field
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        id="confirmPassword"
                        placeholder="Re-enter password"
                        required
                      />
                      <ErrorMessage
                        name="confirmPassword"
                        component="div"
                        className="text-danger mt-1 text-xs"
                      />
                    </div>
                    {/* Submit Button */}
                    <div className="md:col-span-2">
                      <Button
                        size="lg"
                        type="submit"
                        disabled={isSubmitting || isLoading}
                        className="btn-full btn-primary"
                      >
                        {isSubmitting || isLoading ? (
                          <>
                            <LoaderPinwheel className="mr-2 inline animate-spin text-white" />
                          </>
                        ) : (
                          "Sign Up"
                        )}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
          <div className="mt-6 mb-4 text-center text-sm text-gray-700 dark:text-white/70">
            Already have an account?{" "}
            <a
              href="/auth/login"
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
