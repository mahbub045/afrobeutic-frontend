import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { EyeIcon, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

interface BookingData {
  uid: string;
  customer: {
    uid: string;
    name: string;
    phone: string;
    created_at: string;
    updated_at: string;
  };
  booking_id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  booking_duration: string;
  notes: string | null;
  services: Array<{
    uid: string;
    name: string;
    category: number;
    price: string;
    description: string | null;
    service_duration: string;
    created_at: string;
    updated_at: string;
  }>;
  products: Array<{
    uid: string;
    name: string;
    category: number;
    price: string;
    description: string;
    created_at: string;
    updated_at: string;
  }>;
  employee: {
    uid: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

interface ViewBookingPanelProps {
  chairUid: string;
  chairName: string;
}

const ViewBookingPanel: React.FC<ViewBookingPanelProps> = ({
  chairUid,
  chairName,
}) => {
  const params = useParams();
  const salonUid = Array.isArray(params.salonuid)
    ? params.salonuid[0]
    : (params.salonuid ?? "");
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(
    null,
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const {
    data: chairsBookingData,
    isLoading,
    isError,
  } = useGetChairsBookingDataQuery({ salonUid: salonUid, chairUid: chairUid });
  const extractingChairBookingData = chairsBookingData?.results || [];

  const handleViewDetails = (booking: BookingData) => {
    setSelectedBooking(booking);
    setIsSheetOpen(true);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "PLACED":
        return "default";
      case "CONFIRMED":
        return "secondary";
      case "COMPLETED":
        return "outline";
      case "CANCELLED":
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
        <Loader2 className="text-primary size-8 animate-spin" />
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

  if (extractingChairBookingData.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">No bookings found.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <Table>
        <TableHeader className="text-xs">
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Booking ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total Price</TableHead>
            <TableHead className="text-center">Actions</TableHead>
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
                <TableCell className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(booking)}
                  >
                    <EyeIcon className="mr-1 size-4" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ),
          )}
        </TableBody>
      </Table>

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
    </div>
  );
};

export default ViewBookingPanel;
