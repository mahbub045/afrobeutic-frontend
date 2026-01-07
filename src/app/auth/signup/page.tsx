"use client";

import { Button } from "@/components/ui/button";
import { countries } from "@/data/countries";
import apiClient from "@/services/api-client";
import { FormikHelpers, SignUpFormValues } from "@/Types/SignUp/SignUpTypes";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { Check, Eye, EyeOff, LoaderPinwheel, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";

const validationSchema = Yup.object({
  firstName: Yup.string().required("Required"),
  lastName: Yup.string().required("Required"),
  email: Yup.string().email("Invalid email address").required("Required"),
  country: Yup.string(),
  timezone: Yup.string().required("Required"),
  accountType: Yup.string().required("Required"),
  // gender: Yup.string().required("Required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/(?=.*[A-Z])/, "Must contain at least one uppercase letter")
    .matches(/(?=.*[a-z])/, "Must contain at least one lowercase letter")
    .matches(/(?=.*[0-9])/, "Must contain at least one number")
    .matches(
      /(?=.*[!@#$%^&*(),.?\":{}|<>_\-+=\\/\[\];'`~])/,
      "Must contain at least one special character",
    )
    .required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), undefined], "Passwords must match")
    .required("Required"),
});

const SignUp: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { theme, setTheme } = useTheme();
  // avoid rendering client-only dynamic parts on the server to prevent
  // hydration mismatches (checklist and confirm message can differ between
  // server and client). We'll only show them after mount.
  const [mounted, setMounted] = useState(false);
  const [timezones, setTimezones] = useState<string[]>([]);
  useEffect(() => {
    setMounted(true);
    // Populate timezone list on client only
    try {
      const intlObject = Intl as unknown as {
        supportedValuesOf?: (category: string) => string[];
      };
      if (typeof intlObject !== "undefined" && intlObject.supportedValuesOf) {
        const tzs = intlObject.supportedValuesOf("timeZone");
        setTimezones(Array.isArray(tzs) && tzs.length ? tzs : ["UTC"]);
      } else {
        setTimezones(["UTC"]);
      }
    } catch {
      setTimezones(["UTC"]);
    }
  }, []);
  const router = useRouter();

  // API call function using apiClient
  const registerUser = async (userData: {
    first_name: string;
    last_name: string;
    email: string;
    country: string;
    password: string;
    confirm_password: string;
    account_timezone?: string;
    account_type?: string;
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
        account_timezone: values.account_timezone,
        account_type: values.account_type,
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
        router.push("/auth/signup/success");
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-[#050816] dark:via-[#071020] dark:to-[#000000]">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -left-32 h-96 w-96 rounded-full bg-gradient-to-tr from-blue-700/40 to-indigo-600/30 opacity-60 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 -bottom-24 h-96 w-96 rounded-full bg-gradient-to-br from-purple-700/30 to-pink-600/20 opacity-50 blur-3xl" />

      <div className="flex h-full min-h-screen w-full flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl">
          {/* Card Container */}
          <div className="relative rounded-2xl border border-white/20 bg-white/70 p-8 shadow-2xl backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/40 dark:shadow-2xl dark:shadow-black/50">
            {/* Theme Toggle */}
            <div className="absolute top-6 right-6 z-10">
              <button
                type="button"
                onClick={toggleTheme}
                className={`rounded-lg p-2.5 transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-slate-700/40 text-yellow-300 hover:bg-slate-600/60"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                aria-label="Toggle dark mode"
                title="Toggle dark mode"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Logo Section */}
            <div className="mb-8 flex flex-col items-center">
              <div className="relative mb-6 h-16 w-56">
                <Image
                  src="/images/logo-light.png"
                  alt="Afrobeutic Logo"
                  fill
                  className="block object-contain dark:hidden"
                  priority
                />
                <Image
                  src="/images/logo-dark.png"
                  alt="Afrobeutic Logo"
                  fill
                  className="hidden object-contain dark:block"
                  priority
                />
              </div>
              <h1 className="text-center text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
                Create Account
              </h1>
              <p className="mt-3 text-center text-sm text-gray-600 dark:text-gray-300">
                Join Afrobeutic and manage your salon business with ease
              </p>
            </div>

            {/* Form Section */}
            <div className="w-full">
              <Formik
                initialValues={{
                  firstName: "",
                  lastName: "",
                  email: "",
                  country: "",
                  account_timezone: "",
                  account_type: "",
                  password: "",
                  confirmPassword: "",
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, values, errors, touched }) => {
                  const password = values.password || "";
                  const confirm = values.confirmPassword || "";
                  const lengthOk = password.length >= 8;
                  const upperOk = /[A-Z]/.test(password);
                  const lowerOk = /[a-z]/.test(password);
                  const numberOk = /[0-9]/.test(password);
                  const specialOk =
                    /[!@#$%^&*(),.?\":{}|<>_\-+=\\/\[\];'`~]/.test(password);
                  const allPasswordRules =
                    lengthOk && upperOk && lowerOk && numberOk && specialOk;
                  const submitDisabled = mounted
                    ? isSubmitting ||
                      isLoading ||
                      !allPasswordRules ||
                      password !== confirm
                    : false;

                  return (
                    <Form className="space-y-6">
                      {/* Name Row */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* First Name */}
                        <div className="flex flex-col">
                          <label
                            htmlFor="firstName"
                            className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
                          >
                            First Name <span className="text-red-500">*</span>
                          </label>
                          <Field
                            type="text"
                            name="firstName"
                            id="firstName"
                            placeholder="John"
                            className={`rounded-lg border-2 bg-white px-4 py-3 text-gray-900 transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-blue-900 ${
                              touched.firstName && errors.firstName
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          <ErrorMessage
                            name="firstName"
                            component="div"
                            className="mt-1 text-xs font-medium text-red-500"
                          />
                        </div>

                        {/* Last Name */}
                        <div className="flex flex-col">
                          <label
                            htmlFor="lastName"
                            className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
                          >
                            Last Name <span className="text-red-500">*</span>
                          </label>
                          <Field
                            type="text"
                            name="lastName"
                            id="lastName"
                            placeholder="Doe"
                            className={`rounded-lg border-2 bg-white px-4 py-3 text-gray-900 transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-blue-900 ${
                              touched.lastName && errors.lastName
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          <ErrorMessage
                            name="lastName"
                            component="div"
                            className="mt-1 text-xs font-medium text-red-500"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="flex flex-col">
                        <label
                          htmlFor="email"
                          className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
                        >
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="email"
                          name="email"
                          id="email"
                          placeholder="you@company.com"
                          className={`rounded-lg border-2 bg-white px-4 py-3 text-gray-900 transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-blue-900 ${
                            touched.email && errors.email
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        <ErrorMessage
                          name="email"
                          component="div"
                          className="mt-1 text-xs font-medium text-red-500"
                        />
                      </div>

                      {/* Country & Timezone Row */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* Country */}
                        <div className="flex flex-col">
                          <label
                            htmlFor="country"
                            className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
                          >
                            Country <span className="text-red-500">*</span>
                          </label>
                          <Field
                            as="select"
                            name="country"
                            id="country"
                            className={`rounded-lg border-2 bg-white px-4 py-3 text-gray-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-900 ${
                              touched.country && errors.country
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          >
                            <option value="">Select a country</option>
                            {countries.map((country) => (
                              <option key={country.code} value={country.code}>
                                {country.name}
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage
                            name="country"
                            component="div"
                            className="mt-1 text-xs font-medium text-red-500"
                          />
                        </div>

                        {/* Timezone */}
                        <div className="flex flex-col">
                          <label
                            htmlFor="timezone"
                            className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
                          >
                            Time Zone <span className="text-red-500">*</span>
                          </label>
                          <Field
                            as="select"
                            name="timezone"
                            id="account_timezone"
                            className={`rounded-lg border-2 bg-white px-4 py-3 text-gray-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-900 ${
                              touched.account_timezone &&
                              errors.account_timezone
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          >
                            <option value="">Select a time zone</option>
                            {mounted &&
                              timezones.map((tz) => (
                                <option key={tz} value={tz}>
                                  {tz}
                                </option>
                              ))}
                          </Field>
                          <ErrorMessage
                            name="timezone"
                            component="div"
                            className="mt-1 text-xs font-medium text-red-500"
                          />
                        </div>
                      </div>

                      {/* Password Row */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* Password */}
                        <div className="flex flex-col">
                          <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
                          >
                            Password <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Field
                              type={showPassword ? "text" : "password"}
                              name="password"
                              id="password"
                              placeholder="••••••••"
                              className={`w-full rounded-lg border-2 bg-white px-4 py-3 pr-12 text-gray-900 transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-blue-900 ${
                                touched.password && errors.password
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((s) => !s)}
                              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                              aria-label={
                                showPassword ? "Hide password" : "Show password"
                              }
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                          <ErrorMessage
                            name="password"
                            component="div"
                            className="mt-1 text-xs font-medium text-red-500"
                          />
                        </div>

                        {/* Confirm Password */}
                        <div className="flex flex-col">
                          <label
                            htmlFor="confirmPassword"
                            className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
                          >
                            Confirm Password{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Field
                              type={showPassword ? "text" : "password"}
                              name="confirmPassword"
                              id="confirmPassword"
                              placeholder="••••••••"
                              className={`w-full rounded-lg border-2 bg-white px-4 py-3 pr-12 text-gray-900 transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-blue-900 ${
                                touched.confirmPassword &&
                                errors.confirmPassword
                                  ? "border-red-500"
                                  : password === confirm && confirm.length > 0
                                    ? "border-green-500"
                                    : "border-gray-300"
                              }`}
                            />
                            {mounted && confirm.length > 0 && (
                              <div className="absolute top-1/2 right-3 -translate-y-1/2">
                                {password === confirm ? (
                                  <Check className="h-5 w-5 text-green-500" />
                                ) : (
                                  <X className="h-5 w-5 text-red-500" />
                                )}
                              </div>
                            )}
                          </div>
                          <ErrorMessage
                            name="confirmPassword"
                            component="div"
                            className="mt-1 text-xs font-medium text-red-500"
                          />
                        </div>
                      </div>

                      {/* Password Requirements Checklist */}
                      {mounted && password.length > 0 && (
                        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                          <p className="mb-3 text-xs font-semibold tracking-wide text-gray-700 uppercase dark:text-gray-300">
                            Password Requirements:
                          </p>
                          <ul className="space-y-2">
                            <li className="flex items-center text-xs">
                              {lengthOk ? (
                                <Check className="mr-2 h-4 w-4 text-green-600" />
                              ) : (
                                <X className="mr-2 h-4 w-4 text-red-500" />
                              )}
                              <span
                                className={`${
                                  lengthOk
                                    ? "text-green-700 dark:text-green-400"
                                    : "text-gray-600 dark:text-gray-400"
                                }`}
                              >
                                At least 8 characters
                              </span>
                            </li>
                            <li className="flex items-center text-xs">
                              {upperOk ? (
                                <Check className="mr-2 h-4 w-4 text-green-600" />
                              ) : (
                                <X className="mr-2 h-4 w-4 text-red-500" />
                              )}
                              <span
                                className={`${
                                  upperOk
                                    ? "text-green-700 dark:text-green-400"
                                    : "text-gray-600 dark:text-gray-400"
                                }`}
                              >
                                One uppercase letter
                              </span>
                            </li>
                            <li className="flex items-center text-xs">
                              {lowerOk ? (
                                <Check className="mr-2 h-4 w-4 text-green-600" />
                              ) : (
                                <X className="mr-2 h-4 w-4 text-red-500" />
                              )}
                              <span
                                className={`${
                                  lowerOk
                                    ? "text-green-700 dark:text-green-400"
                                    : "text-gray-600 dark:text-gray-400"
                                }`}
                              >
                                One lowercase letter
                              </span>
                            </li>
                            <li className="flex items-center text-xs">
                              {numberOk ? (
                                <Check className="mr-2 h-4 w-4 text-green-600" />
                              ) : (
                                <X className="mr-2 h-4 w-4 text-red-500" />
                              )}
                              <span
                                className={`${
                                  numberOk
                                    ? "text-green-700 dark:text-green-400"
                                    : "text-gray-600 dark:text-gray-400"
                                }`}
                              >
                                One number
                              </span>
                            </li>
                            <li className="flex items-center text-xs">
                              {specialOk ? (
                                <Check className="mr-2 h-4 w-4 text-green-600" />
                              ) : (
                                <X className="mr-2 h-4 w-4 text-red-500" />
                              )}
                              <span
                                className={`${
                                  specialOk
                                    ? "text-green-700 dark:text-green-400"
                                    : "text-gray-600 dark:text-gray-400"
                                }`}
                              >
                                One special character (!@#$%^&*)
                              </span>
                            </li>
                          </ul>
                        </div>
                      )}

                      {/* Account Type */}
                      <div className="flex flex-col">
                        <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                          Account Type <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-3">
                          {/* Salon Shop Option */}
                          <label
                            className={`flex cursor-pointer items-start rounded-lg border-2 p-4 transition-all ${
                              values.account_type === "salon"
                                ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-slate-800"
                                : "border-gray-300 hover:border-gray-400 dark:border-slate-600 dark:hover:border-slate-500"
                            }`}
                          >
                            <Field
                              type="radio"
                              name="accountType"
                              value="salon"
                              className="mt-1 h-5 w-5 cursor-pointer accent-blue-600"
                            />
                            <div className="ml-3">
                              <div className="font-semibold text-gray-900 dark:text-white">
                                Salon Shop
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                Own a salon with multiple chairs and staff.
                                Manage multiple locations in one account.
                              </div>
                            </div>
                          </label>

                          {/* Individual Stylist Option */}
                          <label
                            className={`flex cursor-pointer items-start rounded-lg border-2 p-4 transition-all ${
                              values.account_type === "individual"
                                ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-slate-800"
                                : "border-gray-300 hover:border-gray-400 dark:border-slate-600 dark:hover:border-slate-500"
                            }`}
                          >
                            <Field
                              type="radio"
                              name="accountType"
                              value="individual"
                              className="mt-1 h-5 w-5 cursor-pointer accent-blue-600"
                            />
                            <div className="ml-3">
                              <div className="font-semibold text-gray-900 dark:text-white">
                                Individual Stylist
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                Provide services as an independent stylist or
                                beautician.
                              </div>
                            </div>
                          </label>
                        </div>
                        <ErrorMessage
                          name="accountType"
                          component="div"
                          className="mt-2 text-xs font-medium text-red-500"
                        />
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={submitDisabled}
                        size="lg"
                        className="from-primary to-primary/90 hover:from-primary/90 hover:to-primary dark:from-primary dark:to-primary/90 w-full rounded-lg bg-gradient-to-r py-3 font-semibold text-white transition-all disabled:opacity-50"
                      >
                        {isSubmitting || isLoading ? (
                          <>
                            <LoaderPinwheel className="mr-2 inline-block h-5 w-5 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          "Sign Up"
                        )}
                      </Button>

                      {/* Login Link */}
                      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{" "}
                        <a
                          href="/auth/login"
                          className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
                        >
                          Sign in
                        </a>
                      </div>
                    </Form>
                  );
                }}
              </Formik>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-6 text-center text-xs text-gray-600 dark:text-gray-400">
            By signing up, you agree to our{" "}
            <a
              href="#"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
