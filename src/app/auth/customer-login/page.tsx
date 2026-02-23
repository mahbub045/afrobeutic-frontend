"use client";

import {
  ErrorMessage,
  Field,
  type FieldProps,
  Form,
  Formik,
  type FormikHelpers,
  type FormikProps,
} from "formik";
import { LoaderPinwheel, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import PhoneInput from "react-phone-input-2";
import { toast } from "react-toastify";

import { sendCustomerOtp, verifyCustomerOtp } from "@/services/customer-auth";

type Step = "phone" | "otp";

type CustomerPhoneFormValues = {
  phone: string;
};

const CUSTOMER_TOKEN_KEY = "customer_token";

export default function CustomerLoginPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const canVerifyOtp = useMemo(() => {
    const trimmed = otp.trim();
    return /^\d{6}$/.test(trimmed);
  }, [otp]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem(CUSTOMER_TOKEN_KEY);
    if (token) {
      router.replace("/customer");
    }
  }, [router]);

  const onSendOtp = async (
    phoneValue: string,
    helpers?: FormikHelpers<CustomerPhoneFormValues>,
  ) => {
    setLoading(true);
    try {
      const normalized = phoneValue.trim();
      const res = await sendCustomerOtp(normalized);
      toast.success(res.message || "OTP sent.");
      setPhone(normalized);
      setStep("otp");
      helpers?.setSubmitting(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send OTP.");
      helpers?.setSubmitting(false);
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canVerifyOtp) return;

    setLoading(true);
    try {
      const res = await verifyCustomerOtp(otp.trim());
      if (typeof window !== "undefined") {
        localStorage.setItem(CUSTOMER_TOKEN_KEY, res.token);
      }
      toast.success(res.message || "OTP verified.");
      router.replace("/customer");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-[#050816] dark:via-[#071020] dark:to-[#000000]">
      <div className="pointer-events-none absolute -top-24 -left-32 h-96 w-96 rounded-full bg-gradient-to-tr from-blue-700/40 to-indigo-600/30 opacity-60 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 -bottom-24 h-96 w-96 rounded-full bg-gradient-to-br from-purple-700/30 to-pink-600/20 opacity-50 blur-3xl" />

      <div className="relative w-full max-w-sm rounded-xl bg-white/60 p-6 shadow-md backdrop-blur-sm dark:bg-white/4 dark:shadow-gray-600">
        <div className="relative mx-auto my-2 flex h-14 w-48 items-center justify-center">
          <Image
            src="/images/logo-light.png"
            alt="Afrobeutic Logo"
            fill
            className="block object-contain dark:hidden"
          />
          <Image
            src="/images/logo-dark.png"
            alt="Afrobeutic Logo"
            fill
            className="hidden object-contain dark:block"
          />
        </div>

        <div className="absolute top-3 right-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="cursor-pointer rounded-md bg-gray-100/60 p-2 text-gray-800 transition hover:bg-gray-100/80 dark:bg-gray-700/60 dark:text-gray-100 dark:hover:bg-gray-700/80"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </button>
        </div>

        <h1 className="mb-1 text-center text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Customer login
        </h1>
        <div className="mb-4 text-center text-sm">Sign in with phone + OTP</div>

        {step === "phone" ? (
          <Formik<CustomerPhoneFormValues>
            initialValues={{ phone: "" }}
            validate={(values) => {
              const errors: Partial<
                Record<keyof CustomerPhoneFormValues, string>
              > = {};

              const v = (values.phone || "").trim();
              if (!v) {
                errors.phone = "Phone is required";
              } else if (!/^\+\d{8,20}$/.test(v)) {
                errors.phone = "Enter a valid phone number (e.g. +234...)";
              }

              return errors;
            }}
            onSubmit={async (values, helpers) => {
              await onSendOtp(values.phone, helpers);
            }}
          >
            {({ isValid, dirty }: FormikProps<CustomerPhoneFormValues>) => (
              <Form className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-sm text-gray-700 dark:text-gray-300">
                    Phone number<span className="text-danger">*</span>
                  </label>

                  <Field name="phone">
                    {({
                      field,
                      form,
                    }: FieldProps<string, CustomerPhoneFormValues>) => (
                      <div>
                        <PhoneInput
                          country={"gb"}
                          value={field.value}
                          onChange={(
                            val: string,
                            data?: { dialCode?: string },
                          ) => {
                            const dial = data?.dialCode
                              ? `+${data.dialCode}`
                              : "";
                            const numeric = (val || "").replace(/[^0-9]/g, "");
                            if (!numeric) {
                              form.setFieldValue(field.name, "");
                              return;
                            }
                            let newVal = numeric;
                            if (dial) {
                              if (
                                !numeric.startsWith(dial.replace(/\D/g, ""))
                              ) {
                                newVal = `${dial}${numeric}`;
                              } else {
                                newVal = `+${numeric}`;
                              }
                            } else if (numeric) {
                              newVal = `+${numeric}`;
                            }
                            form.setFieldValue(field.name, newVal);
                          }}
                          inputProps={{ name: field.name }}
                          searchPlaceholder="Search"
                          enableSearch
                          inputClass="!w-full !h-auto px-3 py-2 rounded-md !bg-white !text-black dark:!bg-[#111828] dark:!text-gray-100"
                          buttonClass="!bg-white !text-black dark:!bg-[#111828] dark:!text-gray-100 !border-1 dark:!border-gray-700"
                          dropdownClass="!bg-card !text-card-foreground dark:!bg-gray-800 dark:!text-gray-100 !px-2"
                          searchClass="!bg-card !text-card-foreground dark:!bg-gray-800 dark:!text-gray-100"
                        />
                        <ErrorMessage
                          name="phone"
                          component="div"
                          className="text-danger mt-1 text-xs"
                        />
                      </div>
                    )}
                  </Field>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Use E.164 format (starts with +)
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !dirty || !isValid}
                  className="btn-full btn-primary"
                >
                  {loading ? (
                    <LoaderPinwheel className="mr-2 inline h-5 w-5 animate-spin" />
                  ) : (
                    "Send OTP"
                  )}
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Salon login?{" "}
                  <a
                    href="/auth/login"
                    className="text-primary hover:underline"
                  >
                    Go to email login
                  </a>
                </p>
              </Form>
            )}
          </Formik>
        ) : (
          <form onSubmit={onVerifyOtp} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm text-gray-700 dark:text-gray-300">
                OTP code<span className="text-danger">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Sent to: <span className="font-medium">{phone.trim()}</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !canVerifyOtp}
              className="btn-full btn-primary"
            >
              {loading ? (
                <LoaderPinwheel className="mr-2 inline h-5 w-5 animate-spin" />
              ) : (
                "Verify & continue"
              )}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setOtp("");
                setStep("phone");
              }}
              className="btn-full"
            >
              Change phone number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
