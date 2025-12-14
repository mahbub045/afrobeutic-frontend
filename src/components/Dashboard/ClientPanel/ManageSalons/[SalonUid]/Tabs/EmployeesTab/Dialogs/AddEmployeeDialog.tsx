import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAddEmployeeMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/Employees/EmployeesApi";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useGetCommonCategoriesDataQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Common/CategoriesApi";
import {
  AddEmployeeDialogProps,
  EmployeeFormValues,
} from "@/Types/ClientPanel/ManageSalonTypes/EmployeesTypes/EmployeesType";
import {
  ErrorMessage,
  Field,
  FieldProps,
  Formik,
  FormikProps,
  type FormikHelpers,
} from "formik";
import { X } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import PhoneInput from "react-phone-input-2";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as Yup from "yup";

const EmployeeSchema = Yup.object().shape({
  employee_id: Yup.string().trim().required("Employee ID is required"),
  name: Yup.string().trim().required("Name is required"),
  phone: Yup.string().trim().required("Phone is required"),
  designation: Yup.string().trim().required("Designation is required"),
  image: Yup.string().nullable(),
});

const AddEmployeeDialog: React.FC<AddEmployeeDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { salonuid } = useParams();
  const { resolvedTheme } = useTheme();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const categoryInputRef = useRef<HTMLInputElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const CATEGORY_TYPE_FILTER = "EMPLOYEE";
  // RTK Hooks
  const [addEmployee, { isLoading }] = useAddEmployeeMutation();
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
      if (previewUrl) {
        try {
          URL.revokeObjectURL(previewUrl);
        } catch {
          /* ignore */
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAddEmployee(
    values: EmployeeFormValues,
    helpers: FormikHelpers<EmployeeFormValues>,
  ) {
    if (!salonuid) return;

    setFileError(null);

    try {
      const form = new FormData();
      form.append("employee_id", values.employee_id.trim());
      form.append("name", values.name.trim());
      form.append("phone", values.phone?.trim() || "");
      form.append("designation", values.designation?.trim() || "");

      if (selectedFile) {
        form.append("image", selectedFile);
      }

      // send FormData directly as employeeData — baseApi will attach headers
      const res = await addEmployee({
        salonUid: salonuid as string,
        employeeData: form as unknown as object,
      });
      if (res.data) {
        Swal.fire({
          icon: "success",
          iconColor: "#037375",
          title: "Added successfully",
          html: `Successfully added <b class="text-primary">${values.name}</b> employee`,
          background: resolvedTheme === "dark" ? "#0f1724" : undefined,
          color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
          confirmButtonColor: "#037375",
          timer: 2000,
        });
        onClose();
        helpers.resetForm();
        refetch();
        setSelectedFile(null);
        setPreviewUrl(null);
      } else if ("error" in res) {
        // Try to surface server-side validation errors under the correct fields
        const errObj: unknown = (res as { error?: unknown }).error;
        const errData: unknown =
          errObj && typeof errObj === "object" && "data" in errObj
            ? (errObj as { data?: unknown }).data
            : undefined;

        // Support both { field: [msgs] } and { errors: { field: [msgs] } }
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
          // mark touched so the inline error shows immediately
          helpers.setFieldTouched(f, true, false);
          helpers.setFieldError(f, msg);
          fieldHandled = true;
        });

        if (!fieldHandled) {
          const generic = (() => {
            if (errData && typeof errData === "object") {
              const obj = errData as Record<string, unknown>;
              if (typeof obj.detail === "string") return obj.detail;
              if (typeof obj.message === "string") return obj.message;
            }
            if (errObj && typeof errObj === "object") {
              const obj = errObj as Record<string, unknown>;
              if (typeof obj.error === "string") return obj.error;
            }
            return "Failed to add employee. Please try again.";
          })();
          toast.error(generic);
        }
      } else {
        toast.error("Failed to add employee. Please try again.");
      }
    } catch (err: unknown) {
      // Network or unexpected error
      const fallback = err instanceof Error ? err.message : String(err);
      toast.error(fallback || "Failed to add employee. Please try again.");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-auto shadow-md dark:shadow-gray-600">
        <DialogHeader>
          <DialogTitle className="text-primary">Add New Employee</DialogTitle>
          <DialogDescription>Add a new employee to the salon</DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={
            {
              employee_id: "",
              name: "",
              phone: "",
              designation: "",
              image: "",
            } as EmployeeFormValues
          }
          validationSchema={EmployeeSchema}
          onSubmit={handleAddEmployee}
        >
          {({ handleSubmit, errors, touched, setFieldValue }) => (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="employee_id" className="mb-2">
                  Employee ID<span className="text-danger">*</span>
                </Label>
                <Field
                  id="employee_id"
                  name="employee_id"
                  as="input"
                  type="text"
                  required
                  placeholder="e.g. EMP-888"
                />
                {touched.employee_id && errors.employee_id ? (
                  <p className="text-destructive text-sm">
                    {errors.employee_id}
                  </p>
                ) : null}
              </div>

              <div>
                <Label htmlFor="name" className="mb-2">
                  Name<span className="text-danger">*</span>
                </Label>
                <Field
                  id="name"
                  name="name"
                  as="input"
                  type="text"
                  required
                  placeholder="Employee name"
                />
                {touched.name && errors.name ? (
                  <p className="text-destructive text-sm">{errors.name}</p>
                ) : null}
              </div>

              <div>
                <Label htmlFor="phone" className="mb-2">
                  Phone<span className="text-danger">*</span>
                </Label>
                <Field name="phone">
                  {({
                    field,
                    form,
                  }: FieldProps<string, FormikProps<EmployeeFormValues>>) => (
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
                <Label htmlFor="designation" className="mb-2">
                  Designation<span className="text-danger">*</span>
                </Label>
                <Field
                  innerRef={categoryInputRef}
                  id="designation"
                  name="designation"
                  as="input"
                  type="text"
                  required
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
                {touched.designation && errors.designation ? (
                  <p className="text-destructive text-sm">
                    {errors.designation}
                  </p>
                ) : null}
              </div>

              <div>
                <Label htmlFor="image" className="mb-2">
                  Image
                </Label>
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.currentTarget.files?.[0];
                    if (file) {
                      setFileError(null);
                      // revoke previous preview if any
                      if (previewUrl) {
                        try {
                          URL.revokeObjectURL(previewUrl);
                        } catch {
                          /* ignore */
                        }
                      }
                      setSelectedFile(file);
                      setFieldValue("image", file.name);
                      try {
                        const url = URL.createObjectURL(file);
                        setPreviewUrl(url);
                      } catch {
                        setPreviewUrl(null);
                      }
                    }
                  }}
                />
                {fileError ? (
                  <p className="text-destructive text-sm">{fileError}</p>
                ) : null}
                {selectedFile ? (
                  <div className="mt-2 flex items-center gap-3">
                    {previewUrl ? (
                      <div className="relative h-20 w-20 overflow-hidden rounded-md border">
                        <Image
                          src={previewUrl}
                          alt="Selected preview"
                          fill
                          sizes="64px"
                          className="object-cover"
                          unoptimized
                        />
                        <button
                          type="button"
                          aria-label="Remove image"
                          className="text-danger hover:bg-danger absolute -top-1 right-0 z-10 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-800/50 hover:!text-white"
                          onClick={() => {
                            if (previewUrl) {
                              try {
                                URL.revokeObjectURL(previewUrl);
                              } catch {
                                /* ignore */
                              }
                            }
                            setSelectedFile(null);
                            setPreviewUrl(null);
                            setFieldValue("image", "");
                          }}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || !salonuid}>
                  {isLoading ? "Adding..." : "Add Employee"}
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeDialog;
