"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAddLeadMutation } from "@/Redux/Reducers/ClientPanel/Leads/LeadsApi";
import { useGetCommonCategoriesDataQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Common/CategoriesApi";
import { useGetSalonListQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/SalonApi";
import { LeadDialogProps } from "@/Types/ClientPanel/LeadsTypes/LeadsType";
import {
  ErrorMessage,
  Field,
  FieldProps,
  Formik,
  Form as FormikForm,
  FormikHelpers,
} from "formik";
import { useTheme } from "next-themes";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as Yup from "yup";

const AddLeadDialog: React.FC<LeadDialogProps> = ({ isOpen, onClose }) => {
  const { resolvedTheme } = useTheme();
  const CATEGORY_TYPE_FILTER = "CUSTOMER_SOURCE";

  const { data: commonCategoriesData, refetch } =
    useGetCommonCategoriesDataQuery({ category_type: CATEGORY_TYPE_FILTER });

  const sourceInputRef = useRef<HTMLInputElement | null>(null);
  const sourceDropdownRef = useRef<HTMLDivElement | null>(null);
  const [showSourceSuggestions, setShowSourceSuggestions] =
    useState<boolean>(false);
  const selectedContact = null; // kept for compatibility with other usages

  // helpers to safely read category value/label from possible shapes
  const formatCategoryValue = (c: unknown, idx: number) => {
    if (typeof c === "string") return c;
    if (c && typeof c === "object") {
      const obj = c as Record<string, unknown>;
      const val =
        obj.name ?? obj.category ?? obj.title ?? obj.label ?? obj.id ?? idx;
      return String(val);
    }
    return String(c ?? idx);
  };

  // Build a deduplicated list of source suggestions (CUSTOMER_SOURCE)
  const sourceSuggestions: string[] = (() => {
    const maybeObj = (commonCategoriesData ?? {}) as { data?: unknown[] };
    const src: unknown[] = Array.isArray(commonCategoriesData)
      ? (commonCategoriesData as unknown[])
      : Array.isArray(maybeObj.data)
        ? (maybeObj.data as unknown[])
        : [];

    const looksLikeSource = (c: unknown) => {
      if (typeof c === "string") return true;
      if (c && typeof c === "object") {
        const obj = c as Record<string, unknown>;
        const ct =
          obj.category_type ?? obj.type ?? obj.categoryType ?? obj.kind;
        if (ct === undefined || ct === null) return true;
        return String(ct).toLowerCase() === CATEGORY_TYPE_FILTER.toLowerCase();
      }
      return false;
    };

    const seen = new Set<string>();
    const out: string[] = [];
    src.forEach((c, i) => {
      if (!looksLikeSource(c)) return;
      const v = formatCategoryValue(c, i).trim();
      if (v !== "" && !seen.has(v)) {
        seen.add(v);
        out.push(v);
      }
    });
    return out;
  })();

  // Close source dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sourceDropdownRef.current &&
        !sourceDropdownRef.current.contains(event.target as Node) &&
        sourceInputRef.current &&
        !sourceInputRef.current.contains(event.target as Node)
      ) {
        setShowSourceSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const { data: salonsData } = useGetSalonListQuery();
  const [addLead, { isLoading: isAddingLead }] = useAddLeadMutation();

  const salonOptions =
    salonsData?.results?.map((salon) => ({
      uid: salon.uid,
      name: salon.name,
    })) ?? [];

  const initialValues = {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    salon: "",
    source: "",
  };

  const validationSchema = Yup.object().shape({
    first_name: Yup.string().required("First name is required"),
    last_name: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email address").nullable(),
    phone: Yup.string().nullable(),
    salon: Yup.string().required("Salon is required"),
    source: Yup.string().required("Source is required"),
  });

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting, setFieldError }: FormikHelpers<typeof initialValues>,
  ) => {
    setSubmitting(true);

    const leadsData = {
      first_name: values.first_name || null,
      last_name: values.last_name || null,
      email: values.email || null,
      phone: values.phone || null,
      salon: values.salon || null,
      source: values.source || null,
    };

    try {
      await addLead({ leadsData }).unwrap();
      onClose();
      refetch();
      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Lead Added",
        text: `Lead has been added successfully.`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 2200,
      });
    } catch (err) {
      console.error("Failed to add lead:", err);
      const errorObj = err as {
        data?: {
          non_field_errors?: string[];
          message?: string;
          phone?: string[];
          salon?: string[];
        };
        message?: string;
      };
      const serverMsg =
        errorObj?.data?.non_field_errors?.[0] ||
        errorObj?.data?.phone?.[0] ||
        errorObj?.data?.salon?.[0] ||
        errorObj?.message ||
        (typeof err === "string" ? err : "Failed to add lead.");

      if (errorObj?.data?.non_field_errors) {
        setFieldError("phone", serverMsg);
        setFieldError("salon", serverMsg);
      }

      toast.error(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg shadow-md dark:shadow-gray-600">
        <DialogHeader>
          <DialogTitle className="text-primary">Add Lead</DialogTitle>
          <DialogDescription className="text-xs">
            Provide details for the new lead.
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          <FormikForm>
            <div className="grid gap-3">
              <div>
                <Label htmlFor="first_name" className="mb-2">
                  First Name<span className="text-danger">*</span>
                </Label>
                <Field
                  id="first_name"
                  name="first_name"
                  as="input"
                  type="text"
                  required
                  placeholder="Enter first name"
                />
                <ErrorMessage
                  name="first_name"
                  component="div"
                  className="text-danger mt-1 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="last_name" className="mb-2">
                  Last Name<span className="text-danger">*</span>
                </Label>
                <Field
                  id="last_name"
                  name="last_name"
                  as="input"
                  type="text"
                  required
                  placeholder="Enter last name"
                />
                <ErrorMessage
                  name="last_name"
                  component="div"
                  className="text-danger mt-1 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="email" className="mb-2">
                  Email
                </Label>
                <Field id="email" name="email" as="input" type="email" />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-danger mt-1 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="mb-2">
                  Phone
                </Label>
                <Field name="phone">
                  {({ field, form }: FieldProps) => (
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

                          // If there's no numeric input, don't store the country dial alone
                          if (!numeric) {
                            form.setFieldValue(field.name, "");
                            return;
                          }

                          let newVal = numeric;
                          if (dial) {
                            if (!numeric.startsWith(dial.replace(/\D/g, ""))) {
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
                        inputClass="!w-full !h-auto px-3 py-2 rounded-md !bg-white !text-black dark:!bg-[#181818] dark:!text-gray-100"
                        buttonClass="!bg-white !text-black dark:!bg-[#181818] dark:!text-gray-100 !border-1 dark:!border-gray-700"
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
              </div>

              <div>
                <Label htmlFor="salon" className="mb-2">
                  Salon<span className="text-danger">*</span>
                </Label>
                <Field
                  id="salon"
                  name="salon"
                  as="select"
                  className="w-full rounded-md px-3 py-2"
                >
                  <option value="">Select salon</option>
                  {salonOptions.map((s) => (
                    <option key={s.uid} value={s.uid}>
                      {s.name}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="salon"
                  component="div"
                  className="text-danger mt-1 text-xs"
                />
              </div>

              <div className="relative">
                <Label htmlFor="source" className="mb-2">
                  Source<span className="text-danger">*</span>
                </Label>
                <Field name="source">
                  {({ field, form }: FieldProps) => (
                    <>
                      <input
                        id="source"
                        ref={sourceInputRef}
                        type="text"
                        autoComplete="off"
                        placeholder='e.g. "Instagram", "Google", "Walk-in"'
                        required
                        disabled={!!selectedContact}
                        className="w-full rounded-md border bg-white px-3 py-2 text-black dark:bg-[#181818] dark:text-gray-100"
                        {...field}
                        onFocus={() =>
                          !selectedContact && setShowSourceSuggestions(true)
                        }
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          field.onChange(e);
                          if (!selectedContact) setShowSourceSuggestions(true);
                        }}
                        onBlur={() => {
                          setTimeout(
                            () => setShowSourceSuggestions(false),
                            150,
                          );
                        }}
                      />

                      {showSourceSuggestions && !selectedContact && (
                        <div
                          ref={sourceDropdownRef}
                          className="bg-popover text-popover-foreground absolute right-0 left-0 z-50 mt-1 max-h-40 overflow-auto rounded-md border shadow-lg"
                        >
                          {(() => {
                            const inputValue =
                              sourceInputRef.current?.value || "";
                            const searchTerm = inputValue.toLowerCase().trim();

                            const filteredAndSorted = searchTerm
                              ? sourceSuggestions
                                  .map((v) => ({
                                    value: v,
                                    matches: v
                                      .toLowerCase()
                                      .includes(searchTerm),
                                    startsWithMatch: v
                                      .toLowerCase()
                                      .startsWith(searchTerm),
                                  }))
                                  .sort((a, b) => {
                                    if (a.startsWithMatch && !b.startsWithMatch)
                                      return -1;
                                    if (!a.startsWithMatch && b.startsWithMatch)
                                      return 1;
                                    if (a.matches && !b.matches) return -1;
                                    if (!a.matches && b.matches) return 1;
                                    return 0;
                                  })
                                  .map((item) => item.value)
                              : sourceSuggestions;

                            return filteredAndSorted.length > 0 ? (
                              <ul className="divide-y p-2">
                                {filteredAndSorted.map((v) => (
                                  <li key={v}>
                                    <button
                                      type="button"
                                      className="hover:bg-accent hover:text-accent-foreground my-1 w-full px-3 py-2 text-left"
                                      onMouseDown={(e) => e.preventDefault()}
                                      onClick={() => {
                                        form.setFieldValue("source", v);
                                        setShowSourceSuggestions(false);
                                        sourceInputRef.current?.blur();
                                      }}
                                    >
                                      {v}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="p-2 text-sm">
                                {searchTerm ? "No match found" : "No sources"}
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </>
                  )}
                </Field>
                <ErrorMessage
                  name="source"
                  component="div"
                  className="text-danger mt-1 text-xs"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isAddingLead}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isAddingLead} className="w-40">
                {isAddingLead ? "Adding..." : "Add Lead"}
              </Button>
            </div>
          </FormikForm>
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default AddLeadDialog;
