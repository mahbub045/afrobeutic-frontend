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
import { formatChoiceFieldValue } from "@/lib/utils";
import {
  useAddServiceSubCategoryMutation,
  useEditServiceMutation,
  useGetServiceCategoriesQuery,
  useGetServiceSubCategoriesQuery,
} from "@/Redux/Reducers/ClientPanel/ManageSalons/Services/ServicesApi";
import {
  EditServiceBasicInfoDialogProps,
  ServiceCategory,
  ServiceProps,
} from "@/Types/ClientPanel/ManageSalonTypes/ServicesTypes/ServicesType";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { X } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
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
  const [selectedCategoryUid, setSelectedCategoryUid] = useState<string>("");
  const [showSubCategoryInput, setShowSubCategoryInput] = useState(false);
  const [newSubCategoryName, setNewSubCategoryName] = useState("");
  // RTK Hooks
  const [editService, { isLoading: isEditingService }] =
    useEditServiceMutation();
  const { data: commonCategoriesData } =
    useGetServiceCategoriesQuery(undefined);
  const {
    data: commonSubCategoriesData,
    isLoading: isLoadingSubCategories,
    refetch,
  } = useGetServiceSubCategoriesQuery(selectedCategoryUid || "", {
    skip: !selectedCategoryUid,
  });
  const [addServiceSubCategory, { isLoading: isAddingSubCategory }] =
    useAddServiceSubCategoryMutation();

  const selectedCategory = commonCategoriesData?.results.find(
    (cat: ServiceCategory) => cat.uid === selectedCategoryUid,
  );
  const canAddCustomSubCategory = selectedCategory?.name === "OTHER_SERVICES";

  const resolvedCategoryFromService = useMemo(() => {
    const rawCategory = selectedService?.category || "";
    if (!rawCategory) return "";

    const cats =
      (commonCategoriesData?.results as ServiceCategory[] | undefined) || [];
    if (cats.length === 0) return rawCategory;

    // If the stored value already matches a uid, keep it
    if (cats.some((c) => c.uid === rawCategory)) return rawCategory;

    // Otherwise, try to resolve by name / formatted name
    const match = cats.find((c) => {
      if (c.name === rawCategory) return true;
      return (
        formatChoiceFieldValue(c.name) ===
        formatChoiceFieldValue(rawCategory as string)
      );
    });

    return match ? match.uid : rawCategory;
  }, [selectedService, commonCategoriesData]);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedCategoryUid(resolvedCategoryFromService || "");
    setShowSubCategoryInput(false);
    setNewSubCategoryName("");
  }, [isOpen, resolvedCategoryFromService]);

  const resolvedSubCategoryFromService = useMemo(() => {
    const rawSub = selectedService?.sub_category || "";
    if (!rawSub) return "";

    const subs =
      (commonSubCategoriesData?.results as ServiceCategory[] | undefined) || [];
    if (subs.length === 0) return "";

    // If already a uid, keep it
    if (subs.some((s) => s.uid === rawSub)) return rawSub;

    const match = subs.find((s) => {
      if (s.name === rawSub) return true;
      return (
        formatChoiceFieldValue(s.name) ===
        formatChoiceFieldValue(rawSub as string)
      );
    });

    return match ? match.uid : "";
  }, [selectedService, commonSubCategoriesData]);

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Service name is required"),
    category: Yup.string().required("Category is required"),
    sub_category: Yup.string().required("Sub-category is required"),
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

  async function handleAddSubCategory() {
    if (!selectedCategoryUid) {
      toast.error("Please select a category first.");
      return;
    }

    if (!canAddCustomSubCategory) {
      toast.error(
        "Custom sub-categories can only be created under the 'Other Services' service category.",
      );
      return;
    }

    const name = newSubCategoryName.trim();
    if (!name) {
      toast.error("Please enter a sub-category name.");
      return;
    }

    try {
      await addServiceSubCategory({
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

  const handleSubmit = async (values: ServiceProps) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("category", values.category);
      formData.append("sub_category", values.sub_category);
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
        timer: 2000,
      });
      onEditSuccess?.();
      onClose();
    } catch (error) {
      toast.error("Failed to update service.");
      console.error("Edit Service Error:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-auto shadow-md sm:max-w-lg dark:shadow-gray-700">
        <DialogHeader>
          <DialogTitle className="text-primary">
            Edit Service Basic Info
          </DialogTitle>
          <DialogDescription>
            Update your service details and upload up to 2 images.
          </DialogDescription>
        </DialogHeader>

        <Formik
          enableReinitialize
          initialValues={
            {
              name: selectedService?.name || "",
              category: resolvedCategoryFromService || "",
              sub_category: resolvedSubCategoryFromService || "",
              price: selectedService?.price || "",
              description: selectedService?.description || "",
            } as ServiceProps
          }
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit, isSubmitting, setFieldValue, errors, touched }) => (
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
              <div>
                <Label htmlFor="service-category" className="mb-2">
                  Category
                </Label>
                <Field
                  as="select"
                  id="service-category"
                  name="category"
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
                  {commonCategoriesData?.results.map((cat: ServiceCategory) => (
                    <option key={cat.uid} value={cat.uid}>
                      {formatChoiceFieldValue(cat.name)}
                    </option>
                  ))}
                </Field>
                {touched.category && errors.category ? (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.category as string}
                  </p>
                ) : null}
              </div>
              <div>
                <Label htmlFor="service-sub-category" className="mb-2">
                  Sub-Category
                </Label>
                <Field
                  as="select"
                  id="service-sub-category"
                  name="sub_category"
                  disabled={!selectedCategoryUid || isLoadingSubCategories}
                >
                  <option value="" disabled>
                    Select sub-category
                  </option>
                  {(
                    commonSubCategoriesData?.results as
                      | ServiceCategory[]
                      | undefined
                      | null
                  )?.map((subCat: ServiceCategory) => (
                    <option key={subCat.uid} value={subCat.uid}>
                      {formatChoiceFieldValue(subCat.name)}
                    </option>
                  ))}
                </Field>
                {touched.sub_category && errors.sub_category ? (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.sub_category as string}
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
                          placeholder="e.g. Hair Coloring"
                          className="bg-background focus-visible:ring-primary flex-1 rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2"
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
                          variant="danger"
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
                <Label htmlFor="service-price" className="mb-2">
                  Price($)
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
