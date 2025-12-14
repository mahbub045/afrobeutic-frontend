import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAddChairMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/Chairs/ChairsApi";
import { useGetCommonCategoriesDataQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Common/CategoriesApi";
import {
  ChairDialogsProps,
  ChairFormValues,
} from "@/Types/ClientPanel/ManageSalonTypes/ChairsTypes/ChairsType";
import { DialogTitle } from "@radix-ui/react-dialog";
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from "formik";
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as Yup from "yup";

const ChairSchema = Yup.object().shape({
  name: Yup.string().required("Chair name is required"),
  type: Yup.string().required("Chair type is required"),
  status: Yup.string().required("Chair status is required"),
});

const AddChairDialog: React.FC<ChairDialogsProps> = ({ isOpen, onClose }) => {
  const { salonuid } = useParams();
  const { resolvedTheme } = useTheme();
  const [showCategories, setShowCategories] = useState(false);
  const categoryInputRef = useRef<HTMLInputElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const CATEGORY_TYPE_FILTER = "CHAIR";
  // RTK Hook
  const [addChair, { isLoading }] = useAddChairMutation();
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

    const looksLikeChair = (c: unknown) => {
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
      if (!looksLikeChair(c)) return;
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

  const handleAddChair = async (
    values: ChairFormValues,
    helpers: FormikHelpers<ChairFormValues>,
  ) => {
    try {
      if (!salonuid) return;
      const formValues = new FormData();
      formValues.append("name", values.name);
      formValues.append("type", values.type);
      formValues.append("status", values.status);

      await addChair({ salonUid: salonuid, chairData: formValues }).unwrap();
      onClose();
      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Added successfully",
        html: `Successfully added <b class="text-primary">${values.name}</b> chair.`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 2000,
      });
      helpers.resetForm();
      refetch();
    } catch (error) {
      console.error("Failed to add chair:", error);
      toast.error("Failed to add chair. Please try again.");
    }
    onClose();
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-auto shadow-md sm:max-w-lg dark:shadow-gray-700">
        <DialogHeader>
          <DialogTitle className="text-primary">Add New Chair</DialogTitle>
          <DialogDescription>
            Please fill in the details for the new chair.
          </DialogDescription>
        </DialogHeader>
        <Formik
          initialValues={{ name: "", type: "", status: "" } as ChairFormValues}
          validationSchema={ChairSchema}
          onSubmit={handleAddChair}
        >
          {({ handleSubmit, setFieldValue }) => (
            <Form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="mb-2">
                  Chair Name<span className="text-danger">*</span>
                </Label>
                <Field
                  id="name"
                  name="name"
                  as="input"
                  type="text"
                  required
                  placeholder="Enter chair name"
                />
                <ErrorMessage
                  name="name"
                  component="p"
                  className="mt-1 text-sm text-red-500"
                />
              </div>
              <div className="relative">
                <Label htmlFor="type" className="mb-2">
                  Chair Type<span className="text-danger">*</span>
                </Label>
                <Field
                  innerRef={categoryInputRef}
                  id="type"
                  name="type"
                  as="input"
                  type="text"
                  required
                  autoComplete="off"
                  placeholder='e.g. "Premium Chair", "Basic Chair"'
                  onFocus={() => setShowCategories(true)}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFieldValue("type", e.target.value)
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
                                className="my-1 w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
                                onClick={() => {
                                  setFieldValue("type", v);
                                  setShowCategories(false);
                                }}
                              >
                                {v}
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="p-2 text-sm">No Types</div>
                      );
                    })()}
                  </div>
                )}

                {isLoadingCategories ? (
                  <p className="mt-1 text-sm">Loading Types...</p>
                ) : !commonCategoriesData ||
                  (Array.isArray(commonCategoriesData) &&
                    commonCategoriesData.length === 0) ||
                  (Array.isArray(commonCategoriesData?.data) &&
                    commonCategoriesData.data.length === 0) ? (
                  <p className="mt-1 text-sm">No categories found</p>
                ) : null}
                <ErrorMessage
                  name="type"
                  component="p"
                  className="mt-1 text-sm text-red-500"
                />
              </div>

              <div>
                <Label htmlFor="status" className="mb-2">
                  Chair Status<span className="text-danger">*</span>
                </Label>
                <Field id="status" name="status" as="select" required>
                  <option value="" label="Select status" />
                  <option value="AVAILABLE" label="Available" />
                  <option value="MAINTENANCE" label="Maintenance" />
                  <option value="OUT_OF_ORDER" label="Out of Order" />
                </Field>
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
                  {isLoading ? "Adding..." : "Add Chair"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default AddChairDialog;
