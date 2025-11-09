import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatChoiceFieldValue } from "@/lib/utils";
import { useGetChairsBookingDataQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Chairs/ChairsBookingApi";
import {
  BookingData,
  ViewBookingPanelProps,
} from "@/Types/ClientPanel/ManageSalonTypes/ChairsTypes/ChairBookingTypes";
import {
  ChevronLeft,
  ChevronRight,
  EyeIcon,
  LoaderPinwheel,
  Search,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import EditChairBookingDialog from "./Dialogs/EditChairBookingDialog";

const ViewBookingPanel: React.FC<ViewBookingPanelProps> = ({ chairUid }) => {
  const params = useParams();
  const salonUid = Array.isArray(params.salonuid)
    ? params.salonuid[0]
    : (params.salonuid ?? "");
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditBookingDialogOpen, setIsEditBookingDialogOpen] = useState(false);

  // const handleEditBooking = (booking: BookingData) => {
  //   setSelectedBooking(booking);
  //   setIsEditBookingDialogOpen(true);
  // };

  const {
    data: chairsBookingData,
    isLoading,
    isError,
  } = useGetChairsBookingDataQuery({
    salonUid: salonUid,
    chairUid: chairUid,
    page: page,
    search: debouncedSearch,
  });
  const extractingChairBookingData = chairsBookingData?.results || [];

  const handleViewDetails = (booking: BookingData) => {
    setSelectedBooking(booking);
    setIsSheetOpen(true);
  };

  // debounce effect for search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 500);
    return () => clearTimeout(t);
  }, [search]);

  // reset to first page when search or page size changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const handlePreviousPage = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const handleNextPage = () => {
    if (chairsBookingData?.next) setPage((p) => p + 1);
  };

  const totalCount = chairsBookingData?.count ?? 0;
  const totalPages = chairsBookingData?.count
    ? Math.ceil(
        chairsBookingData.count / (chairsBookingData.results?.length || 1),
      )
    : 0;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "PLACED":
        return "default";
      case "INPROGRESS":
        return "warning";
      case "RESCHEDULED":
        return "secondary";
      case "COMPLETED":
        return "outline";
      case "CANCELLED":
        return "danger";
      case "ABSENT":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5); // Returns HH:MM format
  };

  const calculateTotalPrice = (
    services: BookingData["services"],
    products: BookingData["products"],
  ) => {
    const servicesTotal = services.reduce(
      (sum, service) => sum + parseFloat(service.price),
      0,
    );
    const productsTotal = products.reduce(
      (sum, product) => sum + parseFloat(product.price),
      0,
    );
    return (servicesTotal + productsTotal).toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoaderPinwheel className="text-primary size-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-destructive">
          Error loading booking data. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-center">
        <div className="relative flex w-1/4">
          <Search className="text-muted-foreground absolute top-1/4 left-2 size-4" />
          <Input
            placeholder="Search Bookings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="focus:!border-primary pl-7 shadow-md focus:!ring-0 dark:shadow-gray-600"
          />
        </div>
      </div>
      <Table>
        <TableHeader className="text-xs">
          <TableRow>
            <TableHead className="text-primary">#</TableHead>
            <TableHead className="text-primary">Booking ID</TableHead>
            <TableHead className="text-primary">Customer</TableHead>
            <TableHead className="text-primary">Phone</TableHead>
            <TableHead className="text-primary">Employee</TableHead>
            <TableHead className="text-primary">Date</TableHead>
            <TableHead className="text-primary">Time</TableHead>
            <TableHead className="text-primary">Duration</TableHead>
            <TableHead className="text-primary">Status</TableHead>
            <TableHead className="text-primary">Total Price</TableHead>
            <TableHead className="text-primary text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {extractingChairBookingData.map(
            (booking: BookingData, index: number) => (
              <TableRow key={booking.uid}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell className="font-medium">
                  {booking.booking_id}
                </TableCell>
                <TableCell>{booking.customer.name}</TableCell>
                <TableCell>{booking.customer.phone}</TableCell>
                <TableCell>{booking.employee.name}</TableCell>
                <TableCell>{formatDate(booking.booking_date)}</TableCell>
                <TableCell>{formatTime(booking.booking_time)}</TableCell>
                <TableCell>{formatTime(booking.booking_duration)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(booking.status)}>
                    {formatChoiceFieldValue(booking.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  ${calculateTotalPrice(booking.services, booking.products)}
                </TableCell>
                <TableCell className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(booking)}
                  >
                    <EyeIcon className="size-4" />
                    View
                  </Button>
                  {/* <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditBooking(booking)}
                  >
                    <EditIcon className="size-4" />
                  </Button> */}
                </TableCell>
              </TableRow>
            ),
          )}
          {extractingChairBookingData.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={11}
                className="text-muted-foreground py-8 text-center text-sm"
              >
                No bookings found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      <div className="mt-2 flex items-center justify-between">
        <div className="text-muted-foreground text-sm">Total: {totalCount}</div>
        <div>
          {totalCount > extractingChairBookingData.length && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={page <= 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Page {page} of {totalPages}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!chairsBookingData?.next}
                className="flex items-center gap-2"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Booking Details Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Booking Details</SheetTitle>
            <SheetDescription>
              {selectedBooking && `Booking ID: ${selectedBooking.booking_id}`}
            </SheetDescription>
          </SheetHeader>

          {selectedBooking && (
            <div className="space-y-6 p-2">
              {/* Customer Information */}
              <div className="space-y-2">
                <h3 className="text-muted-foreground text-sm font-semibold">
                  Customer Information
                </h3>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Name:</span>{" "}
                    {selectedBooking.customer.name}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Phone:</span>{" "}
                    {selectedBooking.customer.phone}
                  </p>
                </div>
              </div>

              {/* Booking Information */}
              <div className="space-y-2">
                <h3 className="text-muted-foreground text-sm font-semibold">
                  Booking Information
                </h3>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Date:</span>{" "}
                    {formatDate(selectedBooking.booking_date)}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Time:</span>{" "}
                    {formatTime(selectedBooking.booking_time)}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Duration:</span>{" "}
                    {formatTime(selectedBooking.booking_duration)}
                  </p>
                  <p className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Status:</span>
                    <Badge variant={getStatusVariant(selectedBooking.status)}>
                      {formatChoiceFieldValue(selectedBooking.status)}
                    </Badge>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Employee:</span>{" "}
                    {selectedBooking.employee.name}
                  </p>
                  {selectedBooking.notes && (
                    <p className="text-sm">
                      <span className="font-medium">Notes:</span>{" "}
                      {selectedBooking.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Services */}
              {selectedBooking.services.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-muted-foreground text-sm font-semibold">
                    Services
                  </h3>
                  <div className="space-y-2">
                    {selectedBooking.services.map((service) => (
                      <div
                        key={service.uid}
                        className="flex items-start justify-between rounded-md border p-2"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{service.name}</p>
                          {service.description && (
                            <p className="text-muted-foreground text-xs">
                              {service.description}
                            </p>
                          )}
                          <p className="text-muted-foreground text-xs">
                            Duration: {formatTime(service.service_duration)}
                          </p>
                        </div>
                        <p className="text-sm font-semibold">
                          ${service.price}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Products */}
              {selectedBooking.products.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-muted-foreground text-sm font-semibold">
                    Products
                  </h3>
                  <div className="space-y-2">
                    {selectedBooking.products.map((product) => (
                      <div
                        key={product.uid}
                        className="flex items-start justify-between rounded-md border p-2"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{product.name}</p>
                          {product.description && (
                            <p className="text-muted-foreground text-xs">
                              {product.description}
                            </p>
                          )}
                        </div>
                        <p className="text-sm font-semibold">
                          ${product.price}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Price */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Total Price:</p>
                  <p className="text-lg font-bold">
                    $
                    {calculateTotalPrice(
                      selectedBooking.services,
                      selectedBooking.products,
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
      {/* Dialogs */}
      <EditChairBookingDialog
        isOpen={isEditBookingDialogOpen}
        onClose={() => setIsEditBookingDialogOpen(false)}
        selectedChairUid={chairUid}
        selectedChairBookingData={selectedBooking}
      />
    </div>
  );
};

export default ViewBookingPanel;
