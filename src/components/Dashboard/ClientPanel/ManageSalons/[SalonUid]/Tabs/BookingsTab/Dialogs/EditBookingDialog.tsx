import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useEditBookingMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/Bookings/BookingsApi";
import { useGetEmployeesDataQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Employees/EmployeesApi";
import { useGetProductsDataQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Products/ProductsApi";
import { useGetServicesDataQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Services/ServicesApi";
import {
  ErrorMessage,
  Field,
  FieldProps,
  Form,
  Formik,
  FormikHelpers,
  FormikProps,
} from "formik";
import { Loader2, Upload, X } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import { toast } from "sonner";
import Swal from "sweetalert2";

import * as Yup from "yup";

interface Employee {
  uid: string;
  name: string;
}

interface Service {
  uid: string;
  name: string;
  price: string;
}

interface Product {
  uid: string;
  name: string;
  price: string;
}

export interface EditBookingDialogProps {
  // Define any props needed for the dialog here
  isOpen: boolean;
  onClose: () => void;
  bookingData?: {
    uid: string;
    booking_date: string;
    booking_time: string;
    booking_duration: string;
    status: string;
    notes: string;
    customer: { name: string; phone: string };
    employee: { uid: string };
    services: Array<{ uid: string }>;
    products: Array<{ uid: string }>;
    images?: string[];
  };
}

const EditBookingDialog: React.FC<EditBookingDialogProps> = ({
  isOpen,
  onClose,
  bookingData,
}) => {
  const { salonuid } = useParams();
  const { resolvedTheme } = useTheme();
  const salonUid = Array.isArray(salonuid) ? salonuid[0] : (salonuid ?? "");
  const [imagePreviews, setImagePreviews] = useState<string[]>(
    bookingData?.images || [],
  );

  // RTK hooks
  const { data: servicesData, isLoading: isLoadingServices } =
    useGetServicesDataQuery({ salonUid: salonUid });
  const { data: productsData, isLoading: isLoadingProducts } =
    useGetProductsDataQuery({ salonUid: salonUid });
  const { data: employeesData, isLoading: isLoadingEmployees } =
    useGetEmployeesDataQuery({ salonUid: salonUid });
  const [editBooking, { isLoading }] = useEditBookingMutation();

  // Validation schema
  const validationSchema = Yup.object({
    booking_date: Yup.string().required("Booking date is required"),
    booking_time: Yup.string().required("Booking time is required"),
    booking_duration: Yup.string().required("Duration is required"),
    status: Yup.string()
      .oneOf(["PLACED", "INPROGRESS", "RESCHEDULED", "COMPLETED"])
      .required("Status is required"),
    notes: Yup.string(),
    customer: Yup.object()
      .shape({
        name: Yup.string().required("Customer name is required"),
        phone: Yup.string()
          .required("Customer phone is required")
          .matches(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"),
      })
      .required("Customer information is required"),
    employee: Yup.string().required("Employee is required"),
    services: Yup.array()
      .min(1, "At least one service is required")
      .required("Services are required"),
    products: Yup.array(),
    images: Yup.array().max(3, "Maximum 3 images allowed"),
  });

  const initialValues = {
    booking_date: bookingData?.booking_date || "",
    booking_time: bookingData?.booking_time || "",
    booking_duration: bookingData?.booking_duration || "",
    status: bookingData?.status || "PLACED",
    notes: bookingData?.notes || "",
    customer: {
      name: bookingData?.customer?.name || "",
      phone: bookingData?.customer?.phone || "",
    },
    employee: bookingData?.employee?.uid || "",
    services: bookingData?.services?.map((s) => s.uid) || [],
    products: bookingData?.products?.map((p) => p.uid) || [],
    images: [] as File[],
  };

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting }: FormikHelpers<typeof initialValues>,
  ) => {
    try {
      const formData = new FormData();
      formData.append("booking_date", values.booking_date);
      formData.append("booking_time", values.booking_time);
      formData.append("booking_duration", values.booking_duration);
      formData.append("status", values.status);
      formData.append("notes", values.notes);
      formData.append(
        "customer",
        JSON.stringify({
          name: values.customer.name,
          phone: values.customer.phone,
        }),
      );
      formData.append("employee", values.employee);
      values.services.forEach((serviceId) => {
        formData.append("services", serviceId);
      });
      values.products.forEach((productId) => {
        formData.append("products", productId);
      });
      values.images.forEach((image) => {
        formData.append("images", image);
      });

      await editBooking({
        salonUid: salonUid,
        bookingUid: bookingData?.uid || "",
        data: formData,
      }).unwrap();

      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Booking Updated Successfully",
        html: `Booking for <b class="text-primary">${values.customer.name}</b> has been updated.`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 3000,
      });

      onClose();
    } catch (error) {
      console.error("Failed to update booking:", error);
      const errorMessage =
        (error as { data?: { message: string } })?.data?.message ||
        "Failed to update booking. Please try again.";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle image upload
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (
      field: string,
      value: File[],
      shouldValidate?: boolean,
    ) => void,
    currentImages: File[],
  ) => {
    const files = e.target.files;
    if (!files) return;

    const availableSlots = 3 - currentImages.length;

    if (files.length > availableSlots) {
      return;
    }

    const newImages = Array.from(files);
    setFieldValue("images", [...currentImages, ...newImages]);

    // Create preview URLs
    const newPreviews = newImages.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  // Remove image
  const removeImage = (
    index: number,
    setFieldValue: (
      field: string,
      value: File[],
      shouldValidate?: boolean,
    ) => void,
    images: File[],
  ) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setFieldValue("images", newImages);
    setImagePreviews(newPreviews);
  };

  // Toggle service selection
  const toggleService = (
    serviceId: string,
    setFieldValue: (
      field: string,
      value: string[],
      shouldValidate?: boolean,
    ) => void,
    currentServices: string[],
  ) => {
    if (currentServices.includes(serviceId)) {
      setFieldValue(
        "services",
        currentServices.filter((id) => id !== serviceId),
      );
    } else {
      setFieldValue("services", [...currentServices, serviceId]);
    }
  };

  // Toggle product selection
  const toggleProduct = (
    productId: string,
    setFieldValue: (
      field: string,
      value: string[],
      shouldValidate?: boolean,
    ) => void,
    currentProducts: string[],
  ) => {
    if (currentProducts.includes(productId)) {
      setFieldValue(
        "products",
        currentProducts.filter((id) => id !== productId),
      );
    } else {
      setFieldValue("products", [...currentProducts, productId]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] !max-w-4xl overflow-y-auto shadow-md sm:!max-w-4xl md:!max-w-5xl dark:shadow-gray-600">
        <div className="flex max-h-[95vh] flex-col">
          <div className="flex-shrink px-6 py-4">
            <DialogHeader>
              <DialogTitle className="text-primary">Edit Booking</DialogTitle>
              <DialogDescription>
                Please edit the booking details below.
              </DialogDescription>
            </DialogHeader>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, setFieldValue, isSubmitting }) => (
              <Form className="flex flex-1 flex-col">
                <div className="space-y-4">
                  {/* Booking Date and Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="booking_date">
                        Booking Date <span className="text-red-500">*</span>
                      </Label>
                      <Field
                        id="booking_date"
                        name="booking_date"
                        as="input"
                        type="date"
                        required
                      />
                      <ErrorMessage
                        name="booking_date"
                        component="p"
                        className="text-xs text-red-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="booking_time">
                        Booking Time <span className="text-red-500">*</span>
                      </Label>
                      <Field
                        id="booking_time"
                        name="booking_time"
                        as="input"
                        type="time"
                        required
                      />
                      <ErrorMessage
                        name="booking_time"
                        component="p"
                        className="text-xs text-red-500"
                      />
                    </div>
                  </div>

                  {/* Duration and Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="booking_duration">
                        Duration (HH:MM:SS){" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Field
                        id="booking_duration"
                        name="booking_duration"
                        as="input"
                        type="text"
                        placeholder="01:30:00"
                        required
                      />
                      <ErrorMessage
                        name="booking_duration"
                        component="p"
                        className="text-xs text-red-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">
                        Status <span className="text-red-500">*</span>
                      </Label>
                      <Field id="status" name="status" as="select" required>
                        <option value="" disabled>
                          Select status
                        </option>
                        <option value="PLACED">Placed</option>
                        <option value="INPROGRESS">In-progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="RESCHEDULED">Rescheduled</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="ABSENT">Absent</option>
                      </Field>
                      <ErrorMessage
                        name="status"
                        component="p"
                        className="text-xs text-red-500"
                      />
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">
                      Customer Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="customer.name">
                          Customer Name <span className="text-red-500">*</span>
                        </Label>
                        <Field
                          id="customer.name"
                          name="customer.name"
                          as="input"
                          type="text"
                          placeholder="John Doe"
                          required
                        />
                        <ErrorMessage
                          name="customer.name"
                          component="p"
                          className="text-xs text-red-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="customer.phone">
                          Phone <span className="text-red-500">*</span>
                        </Label>
                        <Field name="customer.phone" required>
                          {({
                            field,
                            form,
                          }: FieldProps<
                            string,
                            FormikProps<typeof initialValues>
                          >) => (
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
                                  const numeric = (val || "").replace(
                                    /[^0-9]/g,
                                    "",
                                  );
                                  let newVal = numeric;
                                  if (dial) {
                                    if (
                                      !numeric.startsWith(
                                        dial.replace(/\D/g, ""),
                                      )
                                    ) {
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
                                name="customer.phone"
                                component="div"
                                className="text-danger mt-1 text-xs text-red-500"
                              />
                            </div>
                          )}
                        </Field>
                      </div>
                    </div>
                  </div>

                  {/* Employee Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="employee">
                      Employee <span className="text-red-500">*</span>
                    </Label>
                    <Field id="employee" name="employee" as="select" required>
                      <option value="" disabled>
                        Select employee
                      </option>
                      {isLoadingEmployees ? (
                        <option value="" disabled>
                          Loading employees...
                        </option>
                      ) : (
                        employeesData?.results?.map((employee: Employee) => (
                          <option key={employee.uid} value={employee.uid}>
                            {employee.name}
                          </option>
                        ))
                      )}
                    </Field>
                    <ErrorMessage
                      name="employee"
                      component="p"
                      className="text-xs text-red-500"
                    />
                  </div>

                  {/* Services and Products Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Services Selection */}
                    <div className="space-y-2">
                      <Label>
                        Services <span className="text-red-500">*</span>
                      </Label>
                      <div className="max-h-60 overflow-y-auto rounded-md border p-3">
                        {isLoadingServices ? (
                          <p className="text-muted-foreground text-sm">
                            Loading services...
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {servicesData?.results?.map((service: Service) => (
                              <div
                                key={service.uid}
                                className="flex items-center gap-2"
                              >
                                <Checkbox
                                  id={`service-${service.uid}`}
                                  checked={values.services.includes(
                                    service.uid,
                                  )}
                                  onCheckedChange={() =>
                                    toggleService(
                                      service.uid,
                                      setFieldValue,
                                      values.services,
                                    )
                                  }
                                />
                                <Label
                                  htmlFor={`service-${service.uid}`}
                                  className="cursor-pointer text-sm font-normal"
                                >
                                  {service.name} - ${service.price}
                                </Label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <ErrorMessage
                        name="services"
                        component="p"
                        className="text-xs text-red-500"
                      />
                    </div>

                    {/* Products Selection */}
                    <div className="space-y-2">
                      <Label>Products (Optional)</Label>
                      <div className="max-h-60 overflow-y-auto rounded-md border p-3">
                        {isLoadingProducts ? (
                          <p className="text-muted-foreground text-sm">
                            Loading products...
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {productsData?.results?.map((product: Product) => (
                              <div
                                key={product.uid}
                                className="flex items-center gap-2"
                              >
                                <Checkbox
                                  id={`product-${product.uid}`}
                                  checked={values.products.includes(
                                    product.uid,
                                  )}
                                  onCheckedChange={() =>
                                    toggleProduct(
                                      product.uid,
                                      setFieldValue,
                                      values.products,
                                    )
                                  }
                                />
                                <Label
                                  htmlFor={`product-${product.uid}`}
                                  className="cursor-pointer text-sm font-normal"
                                >
                                  {product.name} - ${product.price}
                                </Label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Field
                      id="notes"
                      name="notes"
                      as="textarea"
                      placeholder="Keep additional notes about the booking..."
                      rows={3}
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="images">Images (Max 3)</Label>
                    <div className="space-y-3">
                      {imagePreviews.length < 3 && (
                        <div className="flex items-center gap-2">
                          <input
                            id="images"
                            name="images"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) =>
                              handleImageChange(e, setFieldValue, values.images)
                            }
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              document.getElementById("images")?.click()
                            }
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Images ({imagePreviews.length}/3)
                          </Button>
                        </div>
                      )}
                      <ErrorMessage
                        name="images"
                        component="p"
                        className="text-xs text-red-500"
                      />
                      {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative">
                              <Image
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                width={96}
                                height={96}
                                className="h-24 w-full rounded-md object-cover"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 h-6 w-6"
                                onClick={() =>
                                  removeImage(
                                    index,
                                    setFieldValue,
                                    values.images,
                                  )
                                }
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting || isLoading}>
                      {isSubmitting || isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Booking"
                      )}
                    </Button>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditBookingDialog;
