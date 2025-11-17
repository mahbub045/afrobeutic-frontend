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
import { useGetCommonCategoriesDataQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Common/CategoriesApi";
import { useEditEmployeeMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/Employees/EmployeesApi";
import {
  EditEmployeeBasicInfoDialogProps,
  EmployeeProps,
} from "@/Types/ClientPanel/ManageSalonTypes/EmployeesTypes/EmployeesType";
import {
  ErrorMessage,
  Field,
  FieldProps,
  Form,
  Formik,
  FormikProps,
  type FormikHelpers,
} from "formik";
import { X } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import PhoneInput from "react-phone-input-2";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as Yup from "yup";

const EditEmployeeBasicInfoDialog: React.FC<
  EditEmployeeBasicInfoDialogProps
> = ({ isOpen, onClose, selectedEmployee, onEditSuccess }) => {
  const { salonuid } = useParams();
  const { resolvedTheme } = useTheme();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const categoryInputRef = useRef<HTMLInputElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const CATEGORY_TYPE_FILTER = "EMPLOYEE";
  // RTK Hooks
  const [editEmployee, { isLoading: isEditingEmployee }] =
    useEditEmployeeMutation();
  const {
    data: commonCategoriesData,
    isLoading: isLoadingCategories,
    refetch,
  } = useGetCommonCategoriesDataQuery({ category_type: CATEGORY_TYPE_FILTER });

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

  // build a deduplicated list of suggestion strings (preserve order)
  const categorySuggestions: string[] = (() => {
    const src: unknown[] = Array.isArray(commonCategoriesData)
      ? commonCategoriesData
      : Array.isArray(commonCategoriesData?.data)
        ? commonCategoriesData!.data
        : [];

    const looksLikeEmployee = (c: unknown) => {
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
      if (!looksLikeEmployee(c)) return; // skip non-employee categories when metadata present
      const v = formatCategoryValue(c, i);
      if (v !== "" && !seen.has(v)) {
        seen.add(v);
        out.push(v);
      }
    });
    return out;
  })();

  useEffect(() => {
    // Handle click outside to close dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node) &&
        categoryInputRef.current &&
        !categoryInputRef.current.contains(event.target as Node)
      ) {
        setShowCategories(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const validationSchema = Yup.object().shape({
    // PATCH request: fields are optional — only include when user changes them
    employee_id: Yup.string().trim().nullable(),
    name: Yup.string().trim().nullable(),
    phone: Yup.string().trim().nullable(),
    designation: Yup.string().trim().nullable(),
    image: Yup.string().nullable(),
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) setSelectedImage(file);
  };

  const handleRemoveImage = () => setSelectedImage(null);

  const handleSubmit = async (
    values: EmployeeProps,
    formikHelpers: FormikHelpers<EmployeeProps>,
  ) => {
    try {
      // Build FormData only with changed/non-empty fields (PATCH semantics)
      const formData = new FormData();

      const appendIfChanged = (
        key: string,
        newVal: string | undefined | null,
        oldVal: string | undefined | null,
      ) => {
        if (newVal === undefined || newVal === null) return;
        const n = String(newVal).trim();
        const o =
          oldVal === undefined || oldVal === null ? "" : String(oldVal).trim();
        if (n !== "" && n !== o) {
          formData.append(key, n);
        }
      };

      appendIfChanged(
        "employee_id",
        values.employee_id,
        selectedEmployee?.employee_id,
      );
      appendIfChanged("name", values.name, selectedEmployee?.name);
      appendIfChanged("phone", values.phone, selectedEmployee?.phone);
      appendIfChanged(
        "designation",
        values.designation,
        selectedEmployee?.designation,
      );

      // Image: only append if user selected a new file
      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      // If nothing changed, avoid sending empty PATCH
      const hasChanges = Array.from(formData.keys()).length > 0;
      if (!hasChanges) {
        toast.info("No changes to update.");
        return;
      }

      await editEmployee({
        salonUid: salonuid as string,
        employeeUid: selectedEmployee?.uid,
        employeeData: formData,
      }).unwrap();

      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Updated successfully",
        html: `Successfully updated <b class="text-primary">${values.name}</b> employee`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 3000,
      });
      onEditSuccess?.();
      onClose();
      refetch();
    } catch (error: unknown) {
      // Attempt to extract backend validation errors format: { field: [messages] }
      const errData: unknown =
        error && typeof error === "object" && "data" in error
          ? (error as { data?: unknown }).data
          : undefined;
      const rawErrors: unknown =
        errData && typeof errData === "object" && "errors" in errData
          ? (errData as { errors?: unknown }).errors
          : errData;

      const candidateFields = [
        "employee_id",
        "phone",
        "name",
        "designation",
        "image",
      ] as const;

      let fieldHandled = false;
      candidateFields.forEach((f) => {
        const v =
          rawErrors && typeof rawErrors === "object"
            ? (rawErrors as Record<string, unknown>)[f]
            : undefined;
        if (!v) return;
        const msg = Array.isArray(v) ? String(v[0]) : String(v);
        // Formik generic functions accept string field names
        formikHelpers.setFieldTouched(f, true, false);
        formikHelpers.setFieldError(f, msg);
        fieldHandled = true;
      });

      if (!fieldHandled) {
        const generic = (() => {
          if (errData && typeof errData === "object") {
            const obj = errData as Record<string, unknown>;
            if (typeof obj.detail === "string") return obj.detail;
            if (typeof obj.message === "string") return obj.message;
          }
          if (error instanceof Error) return error.message;
          return "Failed to update employee.";
        })();
        toast.error(generic);
      }
      // console for debugging
      console.error("Edit Employee Error:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="shadow-md sm:max-w-lg dark:shadow-gray-700">
        <DialogHeader>
          <DialogTitle className="text-primary">
            Edit Employee Basic Info
          </DialogTitle>
          <DialogDescription>
            Update employee details and image.
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={
            {
              uid: selectedEmployee?.uid || "",
              employee_id: selectedEmployee?.employee_id || "",
              name: selectedEmployee?.name || "",
              phone: selectedEmployee?.phone || "",
              designation: selectedEmployee?.designation || "",
              image: selectedEmployee?.image || "",
              created_at: selectedEmployee?.created_at || "",
              updated_at: selectedEmployee?.updated_at || "",
            } as EmployeeProps
          }
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit, isSubmitting, values, setFieldValue }) => (
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSubmit();
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="employee-id" className="mb-2">
                  Employee ID
                </Label>
                <Field
                  as="input"
                  id="employee-id"
                  name="employee_id"
                  type="text"
                  placeholder="e.g. EMP-888"
                />
                <ErrorMessage
                  name="employee_id"
                  component="p"
                  className="mt-1 text-sm text-red-500"
                />
                {/* Server-side uniqueness example message (will appear automatically if setFieldError is called) */}
              </div>

              <div>
                <Label htmlFor="employee-name" className="mb-2">
                  Name
                </Label>
                <Field
                  as="input"
                  id="employee-name"
                  name="name"
                  type="text"
                  placeholder="Enter name"
                />
                <ErrorMessage
                  name="name"
                  component="p"
                  className="mt-1 text-sm text-red-500"
                />
              </div>

              <div>
                <Label htmlFor="employee-phone" className="mb-2">
                  Phone
                </Label>
                <Field name="phone">
                  {({
                    field,
                    form,
                  }: FieldProps<string, FormikProps<EmployeeProps>>) => (
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

              <div className="relative">
                <Label htmlFor="employee-designation" className="mb-2">
                  Designation
                </Label>
                <Field
                  innerRef={categoryInputRef}
                  as="input"
                  id="employee-designation"
                  name="designation"
                  type="text"
                  autoComplete="off"
                  placeholder='e.g. "Hair Stylist", "Nail Technician"'
                  onFocus={() => setShowCategories(true)}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFieldValue("designation", e.target.value)
                  }
                />

                {showCategories && (
                  <div
                    ref={categoryDropdownRef}
                    className="absolute right-0 left-0 z-50 mt-1 max-h-40 overflow-auto rounded border bg-white shadow-lg dark:bg-[#0b1116]"
                  >
                    {(() => {
                      const inputValue = categoryInputRef.current?.value || "";
                      const searchTerm = inputValue.toLowerCase().trim();

                      // Filter and sort categories: matching ones first
                      const filteredAndSorted = searchTerm
                        ? categorySuggestions
                            .map((v) => ({
                              value: v,
                              matches: v.toLowerCase().includes(searchTerm),
                              startsWithMatch: v
                                .toLowerCase()
                                .startsWith(searchTerm),
                            }))
                            .sort((a, b) => {
                              // Prioritize: starts with > contains > no match
                              if (a.startsWithMatch && !b.startsWithMatch)
                                return -1;
                              if (!a.startsWithMatch && b.startsWithMatch)
                                return 1;
                              if (a.matches && !b.matches) return -1;
                              if (!a.matches && b.matches) return 1;
                              return 0;
                            })
                            .map((item) => item.value)
                        : categorySuggestions;

                      return filteredAndSorted.length > 0 ? (
                        <ul className="divide-y p-2">
                          {filteredAndSorted.map((v) => (
                            <li key={v}>
                              <button
                                type="button"
                                className="my-1 w-full px-3 py-2 text-left hover:bg-gray-50 dark:shadow-gray-600 dark:hover:bg-gray-800"
                                onClick={() => {
                                  setFieldValue("designation", v);
                                  setShowCategories(false);
                                }}
                              >
                                {v}
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="p-2 text-sm">No Designation</div>
                      );
                    })()}
                  </div>
                )}

                {isLoadingCategories ? (
                  <p className="mt-1 text-sm">Loading Designations...</p>
                ) : !commonCategoriesData ||
                  (Array.isArray(commonCategoriesData) &&
                    commonCategoriesData.length === 0) ||
                  (Array.isArray(commonCategoriesData?.data) &&
                    commonCategoriesData.data.length === 0) ? (
                  <p className="mt-1 text-sm">No categories found</p>
                ) : null}
                <ErrorMessage
                  name="designation"
                  component="p"
                  className="mt-1 text-sm text-red-500"
                />
              </div>

              <div>
                <Label htmlFor="employee-image" className="mb-2">
                  Image
                </Label>
                <input
                  id="employee-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <div className="mt-2 flex items-center gap-3">
                  {selectedImage ? (
                    <div className="relative h-20 w-20 overflow-hidden rounded-md border">
                      <Image
                        src={URL.createObjectURL(selectedImage)}
                        alt="preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : values.image ? (
                    <div className="relative h-20 w-20 overflow-hidden rounded-md border">
                      <Image
                        src={values.image}
                        alt="employee"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isEditingEmployee}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isEditingEmployee || isSubmitting}
                >
                  {isEditingEmployee ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default EditEmployeeBasicInfoDialog;
