import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { formatChoiceFieldValue } from "@/lib/utils";
import {
  useAddProductMutation,
  useAddProductSubCategoryMutation,
  useGetProductCategoriesQuery,
  useGetProductSubCategoriesQuery,
} from "@/Redux/Reducers/ClientPanel/ManageSalons/Products/ProductsApi";
import {
  AddProductDialogProps,
  ProductCategory,
  ProductFormValues,
} from "@/Types/ClientPanel/ManageSalonTypes/ProductsTypes/ProductsType";
import { Field, Formik, type FormikHelpers } from "formik";
import { Plus, X } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ChangeEvent, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as Yup from "yup";

const ProductSchema = Yup.object().shape({
  name: Yup.string().trim().required("Name is required"),
  category: Yup.string().trim().required("Category is required"),
  sub_category: Yup.string().trim().required("Sub-category is required"),
  price: Yup.number()
    .typeError("Price must be a number")
    .required("Price is required")
    .min(0, "Price must be greater than or equal to 0"),
  description: Yup.string().trim().nullable(),
  uploaded_images: Yup.string().nullable(),
});

const AddProductDialog: React.FC<AddProductDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { salonuid } = useParams();
  const { resolvedTheme } = useTheme();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [selectedCategoryUid, setSelectedCategoryUid] = useState<string>("");
  const [showSubCategoryInput, setShowSubCategoryInput] = useState(false);
  const [newSubCategoryName, setNewSubCategoryName] = useState("");

  // RTK hooks
  const [addProduct, { isLoading }] = useAddProductMutation();
  const { data: commonCategoriesData } =
    useGetProductCategoriesQuery(undefined);
  const {
    data: commonSubCategoriesData,
    isLoading: isLoadingSubCategories,
    refetch,
  } = useGetProductSubCategoriesQuery(selectedCategoryUid || "", {
    skip: !selectedCategoryUid,
  });
  const [addProductSubCategory, { isLoading: isAddingSubCategory }] =
    useAddProductSubCategoryMutation();

  const selectedCategory = commonCategoriesData?.results.find(
    (cat: ProductCategory) => cat.uid === selectedCategoryUid,
  );
  const canAddCustomSubCategory = selectedCategory?.name === "OTHER_PRODUCTS";

  async function handleAddSubCategory() {
    if (!selectedCategoryUid) {
      toast.error("Please select a category first.");
      return;
    }

    const name = newSubCategoryName.trim();
    if (!name) {
      toast.error("Please enter a sub-category name.");
      return;
    }

    try {
      await addProductSubCategory({
        categoryUid: selectedCategoryUid,
        subCategoryData: { name },
      }).unwrap();

      toast.success("Sub-category added successfully.");
      setNewSubCategoryName("");
      setShowSubCategoryInput(false);
      refetch();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add sub-category. Please try again.");
    }
  }

  async function handleAddProduct(
    values: ProductFormValues,
    helpers: FormikHelpers<ProductFormValues>,
  ) {
    if (!salonuid) return;

    if (selectedFiles.length > 2) {
      setFileError("You can upload a maximum of 2 images.");
      return;
    }

    setFileError(null);

    try {
      const form = new FormData();
      form.append("name", values.name.trim());
      form.append("category", values.category.trim());
      form.append("sub_category", values.sub_category.trim());
      form.append("price", String(parseFloat(String(values.price)) || 0));
      form.append("description", values.description?.trim() || "");

      selectedFiles
        .slice(0, 2)
        .forEach((f) => form.append("uploaded_images", f));

      // send FormData directly as productData — baseApi will attach headers
      await addProduct({
        salonUid: salonuid as string,
        productData: form as unknown as object,
      }).unwrap();
      onClose();
      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Added successfully",
        html: `Successfully added <b class="text-primary">${values.name}</b> product`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 2000,
      });
      helpers.resetForm();
      refetch();
      setSelectedFiles([]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add product. Please try again.");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-auto shadow-md dark:shadow-gray-600">
        <DialogHeader>
          <DialogTitle className="text-primary">Add New Product</DialogTitle>
          <DialogDescription>Add a new product to the salon</DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={
            {
              name: "",
              category: "",
              sub_category: "",
              price: "",
              description: "",
            } as ProductFormValues
          }
          validationSchema={ProductSchema}
          onSubmit={handleAddProduct}
        >
          {({ handleSubmit, errors, touched, setFieldValue }) => (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Product name"
                />
                {touched.name && errors.name ? (
                  <p className="text-destructive text-sm">{errors.name}</p>
                ) : null}
              </div>

              <div>
                <Label htmlFor="category" className="mb-2">
                  Category<span className="text-danger">*</span>
                </Label>
                <Field
                  id="category"
                  name="category"
                  as="select"
                  required
                  placeholder="Product category"
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                    const categoryValue = e.target.value;
                    setSelectedCategoryUid(categoryValue);
                    setFieldValue("category", categoryValue);
                    setFieldValue("sub_category", "");
                  }}
                >
                  <option value="" disabled>
                    Select category
                  </option>
                  {commonCategoriesData?.results.map((cat: ProductCategory) => (
                    <option key={cat.uid} value={cat.uid}>
                      {formatChoiceFieldValue(cat.name)}
                    </option>
                  ))}
                </Field>
                {touched.category && errors.category ? (
                  <p className="text-destructive text-sm">{errors.category}</p>
                ) : null}
              </div>

              <div>
                <Label htmlFor="sub_category" className="mb-2">
                  Sub-Category<span className="text-danger">*</span>
                </Label>
                <Field
                  id="sub_category"
                  name="sub_category"
                  as="select"
                  required
                  placeholder="Product sub-category"
                  disabled={!selectedCategoryUid || isLoadingSubCategories}
                >
                  <option value="" disabled>
                    Select sub-category
                  </option>
                  {commonSubCategoriesData?.results.map(
                    (subCat: ProductCategory) => (
                      <option key={subCat.uid} value={subCat.uid}>
                        {formatChoiceFieldValue(subCat.name)}
                      </option>
                    ),
                  )}
                </Field>
                {touched.sub_category && errors.sub_category ? (
                  <p className="text-destructive text-sm">
                    {errors.sub_category}
                  </p>
                ) : null}
                {canAddCustomSubCategory && (
                  <div className="mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (!selectedCategoryUid) {
                          toast.error("Please select a category first.");
                          return;
                        }
                        setShowSubCategoryInput(true);
                      }}
                      disabled={isAddingSubCategory}
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Add New Sub-Category
                    </Button>
                    {showSubCategoryInput ? (
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="text"
                          value={newSubCategoryName}
                          onChange={(e) =>
                            setNewSubCategoryName(e.target.value)
                          }
                          placeholder="e.g. Shampoo"
                          className="bg-background focus-visible:ring-primary flex-1 rounded-md border px-3 py-1 text-sm outline-none focus-visible:ring-2"
                        />
                        <Button
                          type="button"
                          size="lg"
                          onClick={handleAddSubCategory}
                          disabled={isAddingSubCategory}
                        >
                          {isAddingSubCategory ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          type="button"
                          size="lg"
                          variant="ghost"
                          onClick={() => {
                            setShowSubCategoryInput(false);
                            setNewSubCategoryName("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="price" className="mb-2">
                  Price($)<span className="text-danger">*</span>
                </Label>
                <Field
                  id="price"
                  name="price"
                  as="input"
                  type="number"
                  required
                  placeholder="e.g. 25.00"
                />
                {touched.price && errors.price ? (
                  <p className="text-destructive text-sm">{errors.price}</p>
                ) : null}
              </div>

              <div>
                <Label htmlFor="description" className="mb-2">
                  Description
                </Label>
                <Field
                  id="description"
                  name="description"
                  as="textarea"
                  placeholder="Short description (optional)"
                />
                {touched.description && errors.description ? (
                  <p className="text-destructive text-sm">
                    {errors.description}
                  </p>
                ) : null}
              </div>

              <div>
                <Label htmlFor="uploaded_images" className="mb-2">
                  Images<span className="text-warning">(max 2)</span>
                </Label>
                <input
                  id="uploaded_images"
                  name="uploaded_images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = e.currentTarget.files
                      ? Array.from(e.currentTarget.files)
                      : [];

                    // revoke previous previews
                    if (previewUrls.length > 0) {
                      previewUrls.forEach((u) => {
                        try {
                          URL.revokeObjectURL(u);
                        } catch {
                          /* ignore */
                        }
                      });
                    }

                    let sel = files;
                    if (files.length > 2) {
                      setFileError("You can select up to 2 images.");
                      sel = files.slice(0, 2);
                    } else {
                      setFileError(null);
                    }

                    const urls = sel.map((f) => {
                      try {
                        return URL.createObjectURL(f);
                      } catch {
                        return "";
                      }
                    });

                    setSelectedFiles(sel);
                    setPreviewUrls(urls);
                    setFieldValue(
                      "uploaded_images",
                      sel.map((f) => f.name).join(", "),
                    );
                  }}
                />
                {fileError ? (
                  <p className="text-destructive text-sm">{fileError}</p>
                ) : null}
                {selectedFiles.length > 0 ? (
                  <div className="mt-2 flex items-center gap-3">
                    {selectedFiles.map((f, i) => (
                      <div
                        key={`${f.name}-${i}`}
                        className="relative h-20 w-20 overflow-hidden rounded-md border"
                      >
                        {previewUrls[i] ? (
                          <Image
                            src={previewUrls[i]}
                            alt={f.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                            unoptimized
                          />
                        ) : null}
                        <button
                          type="button"
                          aria-label={`Remove ${f.name}`}
                          className="text-danger hover:bg-danger absolute -top-1 right-0 z-10 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-800/50 hover:!text-white"
                          onClick={() => {
                            // revoke this preview url
                            const url = previewUrls[i];
                            if (url) {
                              try {
                                URL.revokeObjectURL(url);
                              } catch {
                                /* ignore */
                              }
                            }
                            const newFiles = selectedFiles.filter(
                              (_, idx) => idx !== i,
                            );
                            const newUrls = previewUrls.filter(
                              (_, idx) => idx !== i,
                            );
                            setSelectedFiles(newFiles);
                            setPreviewUrls(newUrls);
                            setFieldValue(
                              "uploaded_images",
                              newFiles.map((nf) => nf.name).join(", "),
                            );
                          }}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
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
                  {isLoading ? "Adding..." : "Add Product"}
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
