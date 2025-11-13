import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useGetBookingQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Bookings/BookingsApi";
import { useAddChairBookingMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/Chairs/ChairsBookingApi";
import { useGetEmployeesDataQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Employees/EmployeesApi";
import { useGetProductsDataQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Products/ProductsApi";
import { useGetServicesDataQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Services/ServicesApi";
import { BookingFormValues } from "@/Types/ClientPanel/ManageSalonTypes/ChairsTypes/ChairBookingTypes";
import { ChairDialogsProps } from "@/Types/ClientPanel/ManageSalonTypes/ChairsTypes/ChairsType";
import { EmployeeProps } from "@/Types/ClientPanel/ManageSalonTypes/EmployeesTypes/EmployeesType";
import { ProductProps } from "@/Types/ClientPanel/ManageSalonTypes/ProductsTypes/ProductsType";
import { ServiceProps } from "@/Types/ClientPanel/ManageSalonTypes/ServicesTypes/ServicesType";
import { DialogTitle } from "@radix-ui/react-dialog";
import {
  ErrorMessage,
  Field,
  FieldProps,
  Form,
  Formik,
  FormikHelpers,
  FormikProps,
} from "formik";
import { X } from "lucide-react";
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import PhoneInput from "react-phone-input-2";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as Yup from "yup";

const BookingSchema = Yup.object().shape({
  customer: Yup.object()
    .shape({
      name: Yup.string().required("Customer name is required"),
      phone: Yup.string()
        .required("Customer phone is required")
        .matches(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"),
    })
    .required("Customer information is required"),
  booking_date: Yup.string().required("Booking date is required"),
  booking_time: Yup.string().required("Booking time is required"),
  notes: Yup.string(),
  services: Yup.array().min(1, "At least one service is required"),
  products: Yup.array(),
  employee: Yup.string().required("Employee is required"),
});

const CreateBookingDialog: React.FC<ChairDialogsProps> = ({
  isOpen,
  onClose,
  selectedChairData,
}) => {
  const { salonuid } = useParams();
  const { resolvedTheme } = useTheme();
  const salonUid = Array.isArray(salonuid) ? salonuid[0] : (salonuid ?? "");
  const [showServices, setShowServices] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const servicesInputRef = useRef<HTMLInputElement>(null);
  const productsInputRef = useRef<HTMLInputElement>(null);
  const servicesDropdownRef = useRef<HTMLDivElement>(null);
  const productsDropdownRef = useRef<HTMLDivElement>(null);

  // RTK Hooks
  const { data: servicesData, isLoading: isLoadingServices } =
    useGetServicesDataQuery({ salonUid: salonUid });
  const { data: productsData, isLoading: isLoadingProducts } =
    useGetProductsDataQuery({ salonUid: salonUid });
  const { data: employeesData, isLoading: isLoadingEmployees } =
    useGetEmployeesDataQuery({ salonUid: salonUid });
  const { refetch: refetchBookings } = useGetBookingQuery({
    salonUid: salonUid,
  });
  const [addChairBooking, { isLoading: isAddingChairBooking }] =
    useAddChairBookingMutation();

  // Format data for dropdowns
  const services = Array.isArray(servicesData?.results)
    ? servicesData.results
    : Array.isArray(servicesData)
      ? servicesData
      : [];

  const products = Array.isArray(productsData?.results)
    ? productsData.results
    : Array.isArray(productsData)
      ? productsData
      : [];

  const employees = Array.isArray(employeesData?.results)
    ? employeesData.results
    : Array.isArray(employeesData)
      ? employeesData
      : [];

  useEffect(() => {
    // Handle click outside to close dropdowns
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

  const handleAddBooking = async (
    values: BookingFormValues,
    helpers: FormikHelpers<BookingFormValues>,
  ) => {
    try {
      if (!salonuid || !selectedChairData?.uid) return;

      // Format booking_time to ISO timestamp format (HH:MM:SS.SSSZ)
      const formattedTime = values.booking_time.includes(".")
        ? values.booking_time
        : `${values.booking_time}:00.000Z`;

      const bookingPayload = {
        customer: values.customer,
        booking_date: values.booking_date,
        booking_time: formattedTime,
        notes: values.notes || "",
        services: values.services,
        products: values.products || [],
        employee: values.employee,
      };

      console.log("Booking Payload:", bookingPayload); // Debug log

      const response = await addChairBooking({
        salonUid: salonuid,
        chairUid: selectedChairData.uid,
        chairBookingData: bookingPayload,
      }).unwrap();

      console.log("Booking Response:", response); // Debug log

      onClose();

      // Explicitly refetch bookings to update the calendar
      refetchBookings();

      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Booking Created Successfully",
        html: `Booking for <b class="text-primary">${values.customer.name}</b> has been created.`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 3000,
      });
      helpers.resetForm();
    } catch (error: unknown) {
      console.error("Failed to create booking:", error);
      const apiError = error as {
        data?: { message?: string };
        message?: string;
      };
      console.error("Error details:", apiError?.data || apiError);
      toast.error(
        apiError?.data?.message ||
          apiError?.message ||
          "Failed to create booking. Please try again.",
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] !max-w-4xl overflow-y-auto shadow-md sm:!max-w-4xl md:!max-w-5xl dark:shadow-gray-600">
        <DialogHeader>
          <DialogTitle className="text-primary">Create Booking</DialogTitle>
          <DialogDescription>
            Please fill in the details for the new booking.
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={
            {
              customer: {
                name: "",
                phone: "",
              },
              booking_date: new Date().toISOString().split("T")[0],
              booking_time: "",
              notes: "",
              services: [],
              products: [],
              employee: "",
            } as BookingFormValues
          }
          validationSchema={BookingSchema}
          onSubmit={handleAddBooking}
        >
          {({ handleSubmit, setFieldValue, values }) => (
            <Form onSubmit={handleSubmit} className="space-y-4">
              {/* Customer Information */}
              <div className="space-y-4 rounded-lg border p-4">
                <h3 className="font-semibold">Customer Information</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="customer.name" className="mb-2">
                      Customer Name<span className="text-danger">*</span>
                    </Label>
                    <Field
                      id="customer.name"
                      name="customer.name"
                      as="input"
                      type="text"
                      required
                      placeholder="Enter customer name"
                    />
                    <ErrorMessage
                      name="customer.name"
                      component="p"
                      className="mt-1 text-sm text-red-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customer.phone" className="mb-2">
                      Customer Phone<span className="text-danger">*</span>
                    </Label>
                    <Field name="customer.phone" required>
                      {({
                        field,
                        form,
                      }: FieldProps<
                        string,
                        FormikProps<BookingFormValues>
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
                                  !numeric.startsWith(dial.replace(/\D/g, ""))
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
                            className="text-danger mt-1 text-xs"
                          />
                        </div>
                      )}
                    </Field>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="space-y-4 rounded-lg border p-4">
                <h3 className="font-semibold">Booking Details</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="booking_date" className="mb-2">
                      Booking Date<span className="text-danger">*</span>
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
                      className="mt-1 text-sm text-red-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="booking_time" className="mb-2">
                      Booking Time<span className="text-danger">*</span>
                    </Label>
                    <Field
                      id="booking_time"
                      name="booking_time"
                      as="select"
                      required
                      className="dark:bg-[#181818]"
                    >
                      <option value="" disabled>
                        Select time
                      </option>
                      {Array.from({ length: 96 }, (_, i) => {
                        const hours = Math.floor(i / 4);
                        const minutes = (i % 4) * 15;
                        const timeString = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
                        return (
                          <option key={timeString} value={timeString}>
                            {timeString}
                          </option>
                        );
                      })}
                    </Field>
                    <ErrorMessage
                      name="booking_time"
                      component="p"
                      className="mt-1 text-sm text-red-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {/* <div>
                    <Label htmlFor="status" className="mb-2">
                      Status<span className="text-danger">*</span>
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
                  </div> */}
                  <div>
                    <Label htmlFor="notes" className="mb-2">
                      Notes
                    </Label>
                    <Field
                      id="notes"
                      name="notes"
                      as="textarea"
                      placeholder="Enter booking notes (optional)"
                    />
                    <ErrorMessage
                      name="notes"
                      component="p"
                      className="mt-1 text-sm text-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Services and Products */}
              <div className="space-y-4 rounded-lg border p-4">
                <h3 className="font-semibold">Services & Products</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="relative">
                    <Label htmlFor="services" className="mb-2">
                      Services<span className="text-danger">*</span>
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
                              const service = services.find(
                                (s: ServiceProps) => s.uid === serviceUid,
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
                              onChange={(e) => setServiceSearch(e.target.value)}
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
                            onChange={(e) => setServiceSearch(e.target.value)}
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
                                ? services
                                    .filter((service: ServiceProps) =>
                                      service.name
                                        .toLowerCase()
                                        .includes(searchTerm),
                                    )
                                    .sort(
                                      (a: ServiceProps, b: ServiceProps) => {
                                        const aStarts = a.name
                                          .toLowerCase()
                                          .startsWith(searchTerm);
                                        const bStarts = b.name
                                          .toLowerCase()
                                          .startsWith(searchTerm);
                                        if (aStarts && !bStarts) return -1;
                                        if (!aStarts && bStarts) return 1;
                                        return 0;
                                      },
                                    )
                                : services;

                              return filteredServices.length > 0 ? (
                                <ul className="divide-y p-2">
                                  {filteredServices.map(
                                    (service: ServiceProps) => (
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
                                                      (s) => s !== service.uid,
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
                      className="mt-1 text-sm text-red-500"
                    />
                  </div>

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
                              const product = products.find(
                                (p: ProductProps) => p.uid === productUid,
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
                              onChange={(e) => setProductSearch(e.target.value)}
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
                            onChange={(e) => setProductSearch(e.target.value)}
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
                                ? products
                                    .filter((product: ProductProps) =>
                                      product.name
                                        .toLowerCase()
                                        .includes(searchTerm),
                                    )
                                    .sort(
                                      (a: ProductProps, b: ProductProps) => {
                                        const aStarts = a.name
                                          .toLowerCase()
                                          .startsWith(searchTerm);
                                        const bStarts = b.name
                                          .toLowerCase()
                                          .startsWith(searchTerm);
                                        if (aStarts && !bStarts) return -1;
                                        if (!aStarts && bStarts) return 1;
                                        return 0;
                                      },
                                    )
                                : products;

                              return filteredProducts.length > 0 ? (
                                <ul className="divide-y p-2">
                                  {filteredProducts.map(
                                    (product: ProductProps) => (
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
                                                      (p) => p !== product.uid,
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
                    <ErrorMessage
                      name="products"
                      component="p"
                      className="mt-1 text-sm text-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Employee Selection */}
              <div className="space-y-4 rounded-lg border p-4">
                <h3 className="font-semibold">Assign Employee</h3>

                <div>
                  <Label htmlFor="employee" className="mb-2">
                    Employee<span className="text-danger">*</span>
                  </Label>
                  {isLoadingEmployees ? (
                    <div className="flex items-center justify-center rounded-lg border border-dashed p-6">
                      <p className="text-muted text-sm">Loading employees...</p>
                    </div>
                  ) : employees.length > 0 ? (
                    <div className="max-h-52 overflow-y-auto rounded-lg border p-3">
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        {employees.map((employee: EmployeeProps) => (
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
                      <p className="text-muted text-sm">No employees found</p>
                    </div>
                  )}
                  <ErrorMessage
                    name="employee"
                    component="p"
                    className="mt-1 text-sm text-red-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isAddingChairBooking}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isAddingChairBooking ||
                    !salonuid ||
                    isLoadingServices ||
                    isLoadingEmployees
                  }
                >
                  {isAddingChairBooking ? "Creating..." : "Create Booking"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBookingDialog;
