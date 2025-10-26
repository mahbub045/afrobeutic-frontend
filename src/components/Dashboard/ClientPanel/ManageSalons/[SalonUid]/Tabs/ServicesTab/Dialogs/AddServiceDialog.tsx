import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAddServiceMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/Services/ServicesApi";
import {
  AddServiceDialogProps,
  ServiceFormValues,
} from "@/Types/ClientPanel/ManageSalonTypes/ServicesTypes/ServicesType";
import { Field, Formik, type FormikHelpers } from "formik";
import { X } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
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
  description: Yup.string().trim().nullable(),
  uploaded_images: Yup.string().nullable(),
});

const AddServiceDialog: React.FC<AddServiceDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { salonuid } = useParams();
  const { resolvedTheme } = useTheme();
  // keep the full mutation result so we can call reset() after success
  const [addService, { isLoading }] = useAddServiceMutation();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    return () => {
      // revoke any object URLs on unmount
      previewUrls.forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch (e) {
          /* ignore */
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAddService(
    values: ServiceFormValues,
    helpers: FormikHelpers<ServiceFormValues>,
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
      form.append("price", String(parseFloat(String(values.price)) || 0));
      form.append("description", values.description?.trim() || "");

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
      });
      helpers.resetForm();
      setSelectedFiles([]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add service. Please try again.");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md shadow-md dark:shadow-gray-600">
        <DialogHeader>
          <DialogTitle>Add New Service</DialogTitle>
          <DialogDescription>Add a new service to the salon</DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={
            {
              name: "",
              category: "",
              price: "",
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
                  as="input"
                  type="text"
                  required
                  placeholder="Category"
                />
                {touched.category && errors.category ? (
                  <p className="text-destructive text-sm">{errors.category}</p>
                ) : null}
              </div>

              <div>
                <Label htmlFor="price" className="mb-2">
                  Price<span className="text-danger">*</span>
                </Label>
                <Field
                  id="price"
                  name="price"
                  as="input"
                  type="text"
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
                        } catch (err) {
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
                      } catch (err) {
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
                              } catch (e) {
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
