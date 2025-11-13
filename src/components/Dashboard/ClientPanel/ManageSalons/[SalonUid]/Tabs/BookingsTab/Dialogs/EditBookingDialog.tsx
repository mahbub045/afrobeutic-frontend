import { Button } from "@/components/ui/button";
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
  EditBookingDialogProps,
  Employee,
  Product,
  Service,
} from "@/Types/ClientPanel/ManageSalonTypes/BookingsTypes/BookingsTypes";
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from "formik";
import { Loader2, Upload, X } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";

import * as Yup from "yup";

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
  const [showServices, setShowServices] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const servicesInputRef = useRef<HTMLInputElement>(null);
  const productsInputRef = useRef<HTMLInputElement>(null);
  const servicesDropdownRef = useRef<HTMLDivElement>(null);
  const productsDropdownRef = useRef<HTMLDivElement>(null);

  // RTK hooks
  const { data: servicesData, isLoading: isLoadingServices } =
    useGetServicesDataQuery({ salonUid: salonUid });
  const { data: productsData, isLoading: isLoadingProducts } =
    useGetProductsDataQuery({ salonUid: salonUid });
  const { data: employeesData, isLoading: isLoadingEmployees } =
    useGetEmployeesDataQuery({ salonUid: salonUid });
  const [editBooking, { isLoading }] = useEditBookingMutation();

  const hours = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0"),
  );
  const minutes = ["00", "15", "30", "45"];

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        servicesDropdownRef.current &&
        !servicesDropdownRef.current.contains(event.target as Node) &&
        servicesInputRef.current &&
        !servicesInputRef.current.contains(event.target as Node)
      ) {
        setShowServices(false);
      }
      if (
        productsDropdownRef.current &&
        !productsDropdownRef.current.contains(event.target as Node) &&
        productsInputRef.current &&
        !productsInputRef.current.contains(event.target as Node)
      ) {
        setShowProducts(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Validation schema
  const validationSchema = Yup.object({
    booking_date: Yup.string().required("Booking date is required"),
    booking_time: Yup.string().required("Booking time is required"),
    booking_duration: Yup.string().required("Duration is required"),
    status: Yup.string()
      .oneOf(["PLACED", "INPROGRESS", "RESCHEDULED", "COMPLETED", "CANCELLED"])
      .required("Status is required"),
    cancellation_reason: Yup.string().when("status", {
      is: "CANCELLED",
      then: (schema) =>
        schema.required(
          "Cancellation reason is required when booking is cancelled.",
        ),
      otherwise: (schema) => schema.optional(),
    }),
    notes: Yup.string(),
    employee: Yup.string().required("Employee is required"),
    services: Yup.array()
      .min(1, "At least one service is required")
      .required("Services are required"),
    products: Yup.array(),
    images: Yup.array().max(3, "Maximum 3 images allowed"),
  });

  const initialValues = {
    booking_date: bookingData?.booking_date || "",
    booking_time: bookingData?.booking_time?.slice(0, 5) || "",
    booking_duration: bookingData?.booking_duration || "",
    status: bookingData?.status || "PLACED",
    cancellation_reason: bookingData?.cancellation_reason || "",
    notes: bookingData?.notes || "",
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
      if (values.cancellation_reason) {
        formData.append("cancellation_reason", values.cancellation_reason);
      }
      formData.append("notes", values.notes);
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
        html: `Booking has been updated.`,
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] !max-w-4xl overflow-y-auto shadow-md sm:!max-w-4xl md:!max-w-5xl dark:shadow-gray-600">
        <div className="flex max-h-[95vh] flex-col">
          <div className="pb-6">
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
                        as="select"
                        required
                      >
                        <option value="">Select time</option>
                        {hours.map((h) =>
                          minutes.map((m) => (
                            <option
                              key={`${h}:${m}`}
                              value={`${h}:${m}`}
                            >{`${h}:${m}`}</option>
                          )),
                        )}
                      </Field>
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
                      </Field>
                      <ErrorMessage
                        name="status"
                        component="p"
                        className="text-xs text-red-500"
                      />
                    </div>
                  </div>

                  {/* Cancellation Reason - Conditional Field */}
                  {values.status === "CANCELLED" && (
                    <div className="space-y-2">
                      <Label htmlFor="cancellation_reason">
                        Cancellation Reason{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Field
                        id="cancellation_reason"
                        name="cancellation_reason"
                        as="textarea"
                        placeholder="Please provide the reason for cancellation..."
                        rows={3}
                        required
                      />
                      <ErrorMessage
                        name="cancellation_reason"
                        component="p"
                        className="text-xs text-red-500"
                      />
                    </div>
                  )}

                  {/* Employee Selection */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="employee" className="mb-2">
                        Assign Employee <span className="text-red-500">*</span>
                      </Label>
                      {isLoadingEmployees ? (
                        <div className="flex items-center justify-center rounded-lg border border-dashed p-6">
                          <p className="text-muted-foreground text-sm">
                            Loading employees...
                          </p>
                        </div>
                      ) : employeesData?.results &&
                        employeesData.results.length > 0 ? (
                        <div className="max-h-52 overflow-y-auto rounded-lg border p-3">
                          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                            {employeesData.results.map((employee: Employee) => (
                              <label
                                key={employee.uid}
                                className="hover:border-primary hover:bg-primary/5 flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all"
                              >
                                <input
                                  type="radio"
                                  name="employee"
                                  value={employee.uid}
                                  checked={values.employee === employee.uid}
                                  onChange={(e) =>
                                    setFieldValue("employee", e.target.value)
                                  }
                                  className="h-4 w-4 cursor-pointer"
                                  style={{
                                    accentColor: "#027f81",
                                  }}
                                />
                                <span className="flex-1 text-sm font-medium">
                                  {employee.name}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center rounded-lg border border-dashed p-6">
                          <p className="text-muted-foreground text-sm">
                            No employees found
                          </p>
                        </div>
                      )}
                      <ErrorMessage
                        name="employee"
                        component="p"
                        className="mt-1 text-xs text-red-500"
                      />
                    </div>
                  </div>

                  {/* Services and Products Selection */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">
                      Services & Products
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {/* Services Selection */}
                      <div className="relative">
                        <Label htmlFor="services" className="mb-2">
                          Services <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <div
                            onClick={() => {
                              setShowServices(true);
                              servicesInputRef.current?.focus();
                            }}
                            className="flex min-h-[42px] w-full cursor-text flex-wrap gap-2 rounded-md border px-3 py-2 dark:bg-[#181818]"
                          >
                            {values.services.length > 0 ? (
                              <>
                                {values.services.map((serviceUid) => {
                                  const service = servicesData?.results?.find(
                                    (s: Service) => s.uid === serviceUid,
                                  );
                                  return service ? (
                                    <span
                                      key={serviceUid}
                                      className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm"
                                    >
                                      {service.name}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setFieldValue(
                                            "services",
                                            values.services.filter(
                                              (s) => s !== serviceUid,
                                            ),
                                          );
                                        }}
                                        className="hover:bg-primary/20 rounded-full"
                                      >
                                        <X size={14} />
                                      </button>
                                    </span>
                                  ) : null;
                                })}
                                <input
                                  ref={servicesInputRef}
                                  type="text"
                                  placeholder="Search..."
                                  value={serviceSearch}
                                  onChange={(e) =>
                                    setServiceSearch(e.target.value)
                                  }
                                  onFocus={() => setShowServices(true)}
                                  className="min-w-[120px] flex-1 border-none bg-transparent outline-none"
                                />
                              </>
                            ) : (
                              <input
                                ref={servicesInputRef}
                                type="text"
                                placeholder="Search and select services..."
                                value={serviceSearch}
                                onChange={(e) =>
                                  setServiceSearch(e.target.value)
                                }
                                onFocus={() => setShowServices(true)}
                                className="w-full border-none bg-transparent outline-none"
                              />
                            )}
                          </div>

                          {showServices && (
                            <div
                              ref={servicesDropdownRef}
                              className="absolute right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded border bg-white shadow-lg dark:bg-[#0b1116]"
                            >
                              {isLoadingServices ? (
                                <div className="p-2 text-sm text-gray-500">
                                  Loading services...
                                </div>
                              ) : (
                                (() => {
                                  const searchTerm = serviceSearch
                                    .toLowerCase()
                                    .trim();
                                  const filteredServices = searchTerm
                                    ? (servicesData?.results || [])
                                        .filter((service: Service) =>
                                          service.name
                                            .toLowerCase()
                                            .includes(searchTerm),
                                        )
                                        .sort((a: Service, b: Service) => {
                                          const aStarts = a.name
                                            .toLowerCase()
                                            .startsWith(searchTerm);
                                          const bStarts = b.name
                                            .toLowerCase()
                                            .startsWith(searchTerm);
                                          if (aStarts && !bStarts) return -1;
                                          if (!aStarts && bStarts) return 1;
                                          return 0;
                                        })
                                    : servicesData?.results || [];

                                  return filteredServices.length > 0 ? (
                                    <ul className="divide-y p-2">
                                      {filteredServices.map(
                                        (service: Service) => (
                                          <li key={service.uid}>
                                            <label className="my-1 flex w-full cursor-pointer items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                                              <input
                                                type="checkbox"
                                                checked={values.services.includes(
                                                  service.uid,
                                                )}
                                                onChange={(e) => {
                                                  setFieldValue(
                                                    "services",
                                                    e.target.checked
                                                      ? [
                                                          ...values.services,
                                                          service.uid,
                                                        ]
                                                      : values.services.filter(
                                                          (s) =>
                                                            s !== service.uid,
                                                        ),
                                                  );
                                                }}
                                                className="h-4 w-4 cursor-pointer"
                                                style={{
                                                  accentColor: "#027f81",
                                                }}
                                              />
                                              <span className="text-sm">
                                                {service.name}
                                              </span>
                                            </label>
                                          </li>
                                        ),
                                      )}
                                    </ul>
                                  ) : (
                                    <div className="p-2 text-sm text-gray-500">
                                      No services found
                                    </div>
                                  );
                                })()
                              )}
                            </div>
                          )}
                        </div>
                        <ErrorMessage
                          name="services"
                          component="p"
                          className="mt-1 text-xs text-red-500"
                        />
                      </div>

                      {/* Products Selection */}
                      <div className="relative">
                        <Label htmlFor="products" className="mb-2">
                          Products
                        </Label>
                        <div className="relative">
                          <div
                            onClick={() => {
                              setShowProducts(true);
                              productsInputRef.current?.focus();
                            }}
                            className="flex min-h-[42px] w-full cursor-text flex-wrap gap-2 rounded-md border px-3 py-2 dark:bg-[#181818]"
                          >
                            {values.products.length > 0 ? (
                              <>
                                {values.products.map((productUid) => {
                                  const product = productsData?.results?.find(
                                    (p: Product) => p.uid === productUid,
                                  );
                                  return product ? (
                                    <span
                                      key={productUid}
                                      className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm"
                                    >
                                      {product.name}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setFieldValue(
                                            "products",
                                            values.products.filter(
                                              (p) => p !== productUid,
                                            ),
                                          );
                                        }}
                                        className="hover:bg-primary/20 rounded-full"
                                      >
                                        <X size={14} />
                                      </button>
                                    </span>
                                  ) : null;
                                })}
                                <input
                                  ref={productsInputRef}
                                  type="text"
                                  placeholder="Search..."
                                  value={productSearch}
                                  onChange={(e) =>
                                    setProductSearch(e.target.value)
                                  }
                                  onFocus={() => setShowProducts(true)}
                                  className="min-w-[120px] flex-1 border-none bg-transparent outline-none"
                                />
                              </>
                            ) : (
                              <input
                                ref={productsInputRef}
                                type="text"
                                placeholder="Search and select products..."
                                value={productSearch}
                                onChange={(e) =>
                                  setProductSearch(e.target.value)
                                }
                                onFocus={() => setShowProducts(true)}
                                className="w-full border-none bg-transparent outline-none"
                              />
                            )}
                          </div>

                          {showProducts && (
                            <div
                              ref={productsDropdownRef}
                              className="absolute right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded border bg-white shadow-lg dark:bg-[#0b1116]"
                            >
                              {isLoadingProducts ? (
                                <div className="p-2 text-sm text-gray-500">
                                  Loading products...
                                </div>
                              ) : (
                                (() => {
                                  const searchTerm = productSearch
                                    .toLowerCase()
                                    .trim();
                                  const filteredProducts = searchTerm
                                    ? (productsData?.results || [])
                                        .filter((product: Product) =>
                                          product.name
                                            .toLowerCase()
                                            .includes(searchTerm),
                                        )
                                        .sort((a: Product, b: Product) => {
                                          const aStarts = a.name
                                            .toLowerCase()
                                            .startsWith(searchTerm);
                                          const bStarts = b.name
                                            .toLowerCase()
                                            .startsWith(searchTerm);
                                          if (aStarts && !bStarts) return -1;
                                          if (!aStarts && bStarts) return 1;
                                          return 0;
                                        })
                                    : productsData?.results || [];

                                  return filteredProducts.length > 0 ? (
                                    <ul className="divide-y p-2">
                                      {filteredProducts.map(
                                        (product: Product) => (
                                          <li key={product.uid}>
                                            <label className="my-1 flex w-full cursor-pointer items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                                              <input
                                                type="checkbox"
                                                checked={values.products.includes(
                                                  product.uid,
                                                )}
                                                onChange={(e) => {
                                                  setFieldValue(
                                                    "products",
                                                    e.target.checked
                                                      ? [
                                                          ...values.products,
                                                          product.uid,
                                                        ]
                                                      : values.products.filter(
                                                          (p) =>
                                                            p !== product.uid,
                                                        ),
                                                  );
                                                }}
                                                className="h-4 w-4 cursor-pointer"
                                                style={{
                                                  accentColor: "#027f81",
                                                }}
                                              />
                                              <span className="text-sm">
                                                {product.name}
                                              </span>
                                            </label>
                                          </li>
                                        ),
                                      )}
                                    </ul>
                                  ) : (
                                    <div className="p-2 text-sm text-gray-500">
                                      No products found
                                    </div>
                                  );
                                })()
                              )}
                            </div>
                          )}
                        </div>
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

                  {/* Image Upload - Only shown when status is COMPLETED */}
                  {values.status === "COMPLETED" && (
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
                                handleImageChange(
                                  e,
                                  setFieldValue,
                                  values.images,
                                )
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
                  )}
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
