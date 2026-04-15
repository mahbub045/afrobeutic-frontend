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
  useAddServiceMutation,
  useGetServiceCategoriesQuery,
} from "@/Redux/Reducers/ClientPanel/ManageSalons/Services/ServicesApi";
import {
  AddServiceDialogProps,
  ServiceCategory,
  ServiceFormValues,
} from "@/Types/ClientPanel/ManageSalonTypes/ServicesTypes/ServicesType";
import { Field, Formik, type FormikHelpers } from "formik";
import { X } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useParams } from "next/navigation";
import type { ChangeEvent } from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as Yup from "yup";

const ServiceSchema = Yup.object().shape({
  name: Yup.string().trim().required("Name is required"),
  category: Yup.string().trim().required("Category is required"),
  price: Yup.number()
    .typeError("Price must be a number")
    .required("Price is required")
    .min(0, "Price must be greater than or equal to 0"),
  service_duration: Yup.string()
    .trim()
    .matches(
      /^\s*$|^\d{1,2}:\d{2}(?::\d{2})?$/,
      "Duration must be in HH:MM or HH:MM:SS format",
    )
    .nullable(),
  tags: Yup.string().trim().nullable(),
  description: Yup.string().trim().nullable(),
  uploaded_images: Yup.string().nullable(),
});

const AddServiceDialog: React.FC<AddServiceDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { salonuid } = useParams();
  const { resolvedTheme } = useTheme();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagsError, setTagsError] = useState<string | null>(null);

  const handleAddTag = () => {
    const rawTags = tagInput.trim();
    if (!rawTags) return;

    const newTags = rawTags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .filter((tag) => !tags.includes(tag));

    if (newTags.length === 0) {
      setTagInput("");
      return;
    }

    setTags((prev) => [...prev, ...newTags]);
    setTagInput("");
    setTagsError(null);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  // rtk hooks
  const [addService, { isLoading }] = useAddServiceMutation();
  const { data: commonCategoriesData } =
    useGetServiceCategoriesQuery(undefined);

  async function handleAddService(
    values: ServiceFormValues,
    helpers: FormikHelpers<ServiceFormValues>,
  ) {
    if (!salonuid) return;

    if (selectedFiles.length > 2) {
      setFileError("You can upload a maximum of 2 images.");
      return;
    }

    if (tags.length === 0) {
      setTagsError("Tags are required");
      return;
    }

    setFileError(null);
    setTagsError(null);

    try {
      const form = new FormData();
      form.append("name", values.name.trim());
      form.append("category", values.category.trim());
      form.append("price", String(parseFloat(String(values.price)) || 0));
      form.append("service_duration", values.service_duration?.trim() || "");
      form.append("description", values.description?.trim() || "");

      if (tags.length > 0) {
        tags.forEach((tag) => form.append("tags", tag));
      }

      selectedFiles
        .slice(0, 2)
        .forEach((f) => form.append("uploaded_images", f));

      // send FormData directly as serviceData — baseApi will attach headers
      await addService({
        salonUid: salonuid as string,
        serviceData: form as unknown as object,
      }).unwrap();
      onClose();
      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Added successfully",
        html: `Successfully added <b class="text-primary">${values.name}</b> service`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 2000,
      });
      helpers.resetForm();
      setSelectedFiles([]);
      setTagInput("");
      setTags([]);
      setTagsError(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add service. Please try again.");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-auto shadow-md dark:shadow-gray-600">
        <DialogHeader>
          <DialogTitle className="text-primary">Add New Service</DialogTitle>
          <DialogDescription>Add a new service to the salon</DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={
            {
              name: "",
              category: "",
              price: "",
              service_duration: "",
              tags: "",
              description: "",
            } as ServiceFormValues
          }
          validationSchema={ServiceSchema}
          onSubmit={handleAddService}
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
                  placeholder="Service name"
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
                  placeholder="Service category"
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                    const categoryValue = e.target.value;
                    setFieldValue("category", categoryValue);
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
                  <p className="text-destructive text-sm">{errors.category}</p>
                ) : null}
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
                <Label htmlFor="service_duration" className="mb-2">
                  Duration
                </Label>
                <Field
                  id="service_duration"
                  name="service_duration"
                  as="input"
                  type="text"
                  placeholder="HH:MM or HH:MM:SS"
                />
                {touched.service_duration && errors.service_duration ? (
                  <p className="text-destructive text-sm">
                    {errors.service_duration}
                  </p>
                ) : null}
              </div>

              <div>
                <Label className="mb-2">
                  Tags<span className="text-danger">*</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {tags.length > 0 ? (
                    tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-muted-foreground hover:bg-muted inline-flex h-5 w-5 items-center justify-center rounded-full"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No tags added yet.
                    </p>
                  )}
                </div>
                {tagsError ? (
                  <p className="text-destructive text-sm">{tagsError}</p>
                ) : null}
              </div>

              <div>
                <Label htmlFor="tagInput" className="mb-2">
                  Add Tag
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    id="tagInput"
                    name="tagInput"
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Enter a tag"
                    className="border-input focus:border-primary focus:ring-primary/10 flex-1 rounded-md border px-3 py-2 shadow-sm focus:ring-2 focus:outline-none"
                  />
                  <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={handleAddTag}
                    className="h-10 px-4"
                  >
                    Add
                  </Button>
                </div>
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
                  {isLoading ? "Adding..." : "Add Service"}
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default AddServiceDialog;
