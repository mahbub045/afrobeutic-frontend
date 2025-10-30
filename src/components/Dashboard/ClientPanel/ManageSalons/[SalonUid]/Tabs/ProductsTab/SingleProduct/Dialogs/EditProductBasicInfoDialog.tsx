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
import { useEditProductMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/Products/ProductsApi";
import {
  EditProductBasicInfoDialogProps,
  ProductProps,
} from "@/Types/ClientPanel/ManageSalonTypes/ProductsTypes/ProductsType";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { LucideFilter, LucideFilterX, X } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as Yup from "yup";

const EditProductBasicInfoDialog: React.FC<EditProductBasicInfoDialogProps> = ({
  isOpen,
  onClose,
  selectedProduct,
  onEditSuccess,
}) => {
  const { salonuid } = useParams();
  const { resolvedTheme } = useTheme();
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [showValues, setShowValues] = useState(false);
  const CATEGORY_TYPE_FILTER = "PRODUCT";
  // RTK Hooks
  const [editProduct, { isLoading: isEditingProduct }] =
    useEditProductMutation();
  const { data: commonCategoriesData, isLoading: isLoadingCategories } =
    useGetCommonCategoriesDataQuery({ category_type: CATEGORY_TYPE_FILTER });

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

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Product name is required"),
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

  const handleSubmit = async (values: ProductProps) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("category", values.category);
      formData.append("price", String(values.price));
      formData.append("description", values.description || "");
      uploadedImages.forEach((file) =>
        formData.append("uploaded_images", file),
      );

      await editProduct({
        salonUid: salonuid as string,
        productUid: selectedProduct?.uid,
        productData: formData,
      }).unwrap();
      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Updated successfully",
        html: `Successfully updated <b class="text-primary">${values.name}</b> product`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 3000,
      });
      onEditSuccess?.();
      onClose();
    } catch (error) {
      toast.error("Failed to update product.");
      console.error("Edit Product Error:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="shadow-md sm:max-w-lg dark:shadow-gray-700">
        <DialogHeader>
          <DialogTitle className="text-primary">
            Edit Product Basic Info
          </DialogTitle>
          <DialogDescription>
            Update your product details and upload up to 2 images.
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={
            {
              name: selectedProduct?.name || "",
              category: selectedProduct?.category || "",
              price: selectedProduct?.price || "",
              description: selectedProduct?.description || "",
            } as ProductProps
          }
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit, isSubmitting, setFieldValue }) => (
            <Form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="product-name" className="mb-2">
                  Product Name
                </Label>
                <Field
                  as="input"
                  id="product-name"
                  name="name"
                  type="text"
                  placeholder="Enter product name"
                />
                <ErrorMessage
                  name="name"
                  component="p"
                  className="mt-1 text-sm text-red-500"
                />
              </div>
              <div className="relative">
                <Label htmlFor="product-category" className="mb-2">
                  Category
                </Label>
                <Field
                  as="input"
                  type="text"
                  id="product-category"
                  name="category"
                  placeholder="Enter category"
                  list="category-list"
                />
                <div className="absolute top-[15px] right-0 mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center !rounded-l-none border-l bg-[#f6f8fb] p-4 text-sm hover:bg-white dark:bg-[#1f1e1e] hover:dark:bg-[#242222]"
                    onClick={() => setShowValues((s) => !s)}
                  >
                    {showValues ? (
                      <LucideFilterX size={16} />
                    ) : (
                      <LucideFilter size={16} />
                    )}
                  </button>
                </div>

                {showValues ? (
                  <div className="absolute right-0 left-0 z-50 mt-1 max-h-40 overflow-auto rounded border bg-white shadow-lg dark:bg-[#0b1116]">
                    {categorySuggestions.length > 0 ? (
                      <ul className="divide-y p-2">
                        {categorySuggestions.map((v) => (
                          <li key={v}>
                            <button
                              type="button"
                              className="my-1 w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
                              onClick={() => {
                                setFieldValue("category", v);
                                setShowValues(false);
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
                    )}
                  </div>
                ) : null}

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
                <Label htmlFor="product-price" className="mb-2">
                  Price
                </Label>
                <Field
                  as="input"
                  id="product-price"
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
                <Label htmlFor="product-description" className="mb-2">
                  Description
                </Label>
                <Field
                  as={Textarea}
                  id="product-description"
                  name="description"
                  placeholder="Enter product description"
                />
                <ErrorMessage
                  name="description"
                  component="p"
                  className="mt-1 text-sm text-red-500"
                />
              </div>
              <div>
                <Label htmlFor="product-images" className="mb-2">
                  Upload Images<span className="text-warning">(max 2)</span>
                </Label>
                <input
                  id="product-images"
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
                  disabled={isEditingProduct}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isEditingProduct || isSubmitting}
                >
                  {isEditingProduct ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductBasicInfoDialog;
