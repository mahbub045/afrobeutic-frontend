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
import { useEditProductMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/Products/ProductsApi";
import {
  EditProductBasicInfoDialogProps,
  ProductProps,
} from "@/Types/ClientPanel/ManageSalonTypes/ProductsTypes/ProductsType";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { X } from "lucide-react";
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
  const [editProduct, { isLoading: isEditingProduct }] =
    useEditProductMutation();

  const [uploadedImages, setUploadedImages] = useState<File[]>([]);

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
          {({ handleSubmit, isSubmitting }) => (
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
              <div>
                <Label htmlFor="product-category" className="mb-2">
                  Category
                </Label>
                <Field
                  as="input"
                  type="text"
                  id="product-category"
                  name="category"
                  placeholder="Enter category"
                />
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
