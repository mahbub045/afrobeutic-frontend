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
import { Textarea } from "@/components/ui/textarea";
import { useGetCommonCategoriesDataQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Common/CategoriesApi";
import { useEditServiceMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/Services/ServicesApi";
import {
  EditServiceBasicInfoDialogProps,
  ServiceProps,
} from "@/Types/ClientPanel/ManageSalonTypes/ServicesTypes/ServicesType";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { X } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as Yup from "yup";

const EditServiceBasicInfoDialog: React.FC<EditServiceBasicInfoDialogProps> = ({
  isOpen,
  onClose,
  selectedService,
  onEditSuccess,
}) => {
  const { salonuid } = useParams();
  const { resolvedTheme } = useTheme();
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [showCategories, setShowCategories] = useState(false);
  const categoryInputRef = useRef<HTMLInputElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const CATEGORY_TYPE_FILTER = "SERVICE";
  // RTK Hooks
  const [editService, { isLoading: isEditingService }] =
    useEditServiceMutation();
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

    const looksLikeService = (c: unknown) => {
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
      if (!looksLikeService(c)) return; // skip non-service categories when metadata present
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
    name: Yup.string().required("Service name is required"),
    category: Yup.string().required("Category is required"),
    price: Yup.number()
      .typeError("Price must be a number")
      .required("Price is required"),
    description: Yup.string().nullable(),
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (uploadedImages.length + files.length > 2) {
      toast.warning(`You can upload a maximum of 2 images.`);
      return;
    }
    setUploadedImages((prev) => [...prev, ...files]);
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (values: ServiceProps) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("category", values.category);
      formData.append("price", String(values.price));
      formData.append("description", values.description || "");
      uploadedImages.forEach((file) =>
        formData.append("uploaded_images", file),
      );

      await editService({
        salonUid: salonuid as string,
        serviceUid: selectedService?.uid,
        serviceData: formData,
      }).unwrap();
      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Updated successfully",
        html: `Successfully updated <b class="text-primary">${values.name}</b> service`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 3000,
      });
      onEditSuccess?.();
      refetch();
      onClose();
    } catch (error) {
      toast.error("Failed to update service.");
      console.error("Edit Service Error:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="shadow-md sm:max-w-lg dark:shadow-gray-700">
        <DialogHeader>
          <DialogTitle className="text-primary">
            Edit Service Basic Info
          </DialogTitle>
          <DialogDescription>
            Update your service details and upload up to 2 images.
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={
            {
              name: selectedService?.name || "",
              category: selectedService?.category || "",
              price: selectedService?.price || "",
              description: selectedService?.description || "",
            } as ServiceProps
          }
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit, isSubmitting, setFieldValue }) => (
            <Form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="service-name" className="mb-2">
                  Service Name
                </Label>
                <Field
                  as="input"
                  id="service-name"
                  name="name"
                  type="text"
                  placeholder="Enter service name"
                />
                <ErrorMessage
                  name="name"
                  component="p"
                  className="mt-1 text-sm text-red-500"
                />
              </div>
              <div className="relative">
                <Label htmlFor="service-category" className="mb-2">
                  Category
                </Label>
                <Field
                  innerRef={categoryInputRef}
                  as="input"
                  type="text"
                  autoComplete="off"
                  id="service-category"
                  name="category"
                  placeholder='e.g. "Haircut", "Manicure"'
                  onFocus={() => setShowCategories(true)}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFieldValue("category", e.target.value)
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
                                  setFieldValue("category", v);
                                  setShowCategories(false);
                                }}
                              >
                                {v}
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-muted p-2 text-sm">
                          No categories
                        </div>
                      );
                    })()}
                  </div>
                )}

                {isLoadingCategories ? (
                  <p className="text-muted mt-1 text-sm">
                    Loading categories...
                  </p>
                ) : !commonCategoriesData ||
                  (Array.isArray(commonCategoriesData) &&
                    commonCategoriesData.length === 0) ||
                  (Array.isArray(commonCategoriesData?.data) &&
                    commonCategoriesData.data.length === 0) ? (
                  <p className="text-muted mt-1 text-sm">No categories found</p>
                ) : null}

                <ErrorMessage
                  name="category"
                  component="p"
                  className="mt-1 text-sm text-red-500"
                />
              </div>
              <div>
                <Label htmlFor="service-price" className="mb-2">
                  Price
                </Label>
                <Field
                  as="input"
                  id="service-price"
                  name="price"
                  placeholder="Enter price"
                  type="number"
                />
                <ErrorMessage
                  name="price"
                  component="p"
                  className="mt-1 text-sm text-red-500"
                />
              </div>
              <div>
                <Label htmlFor="service-description" className="mb-2">
                  Description
                </Label>
                <Field
                  as={Textarea}
                  id="service-description"
                  name="description"
                  placeholder="Enter service description"
                />
                <ErrorMessage
                  name="description"
                  component="p"
                  className="mt-1 text-sm text-red-500"
                />
              </div>
              <div>
                <Label htmlFor="service-images" className="mb-2">
                  Upload Images<span className="text-warning">(max 2)</span>
                </Label>
                <input
                  id="service-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {uploadedImages.map((img, index) => (
                    <div
                      key={index}
                      className="relative h-20 w-20 overflow-hidden rounded-md border"
                    >
                      <Image
                        src={URL.createObjectURL(img)}
                        alt={`Preview ${index}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ✅ Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isEditingService}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isEditingService || isSubmitting}
                >
                  {isEditingService ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default EditServiceBasicInfoDialog;
