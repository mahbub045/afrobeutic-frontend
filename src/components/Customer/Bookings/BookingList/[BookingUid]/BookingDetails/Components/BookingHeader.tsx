import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CustomerBookingDetail } from "@/Types/Customer/BookingTypes";
import { Building2, CreditCard, Hash } from "lucide-react";
import React from "react";

interface Props {
  booking: CustomerBookingDetail;
}

const STATUS_VARIANT: Record<
  string,
  "default" | "warning" | "secondary" | "destructive" | "outline" | "danger"
> = {
  CONFIRMED: "default",
  INPROGRESS: "warning",
  RESCHEDULED: "secondary",
  COMPLETED: "secondary",
  CANCELLED: "danger",
  NO_SHOW: "destructive",
};

const BookingHeader: React.FC<Props> = ({ booking }) => {
  const statusVariant = STATUS_VARIANT[booking.status] ?? "outline";

  return (
    <Card className="flex flex-col gap-4 rounded-xl border p-5 shadow-md sm:flex-row sm:items-center sm:justify-between dark:shadow-gray-600">
      {/* Left – IDs & Salon */}
      <div className="space-y-1.5">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Hash className="h-3.5 w-3.5" />
          <span className="text-foreground font-mono text-base font-medium">
            {booking.booking_id}
          </span>
        </div>
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Building2 className="h-3.5 w-3.5 shrink-0" />
          <span>{booking.salon?.name ?? "-"}</span>
        </div>
      </div>

      {/* Right – Status & Payment */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={statusVariant}>{booking.status}</Badge>
        {booking.payment_type && (
          <div className="text-muted-foreground flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs">
            <CreditCard className="h-3.5 w-3.5" />
            {booking.payment_type}
          </div>
        )}
      </div>
    </Card>
  );
};

export default BookingHeader;
