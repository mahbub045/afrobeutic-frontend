import { Card } from "@/components/ui/card";
import { CustomerBookingDetail } from "@/Types/Customer/BookingTypes";
import { AlertCircle, FileText } from "lucide-react";
import React from "react";

interface Props {
  booking: CustomerBookingDetail;
}

const BookingNotes: React.FC<Props> = ({ booking }) => {
  const hasNotes = booking.notes && booking.notes.trim().length > 0;
  const hasCancellation =
    booking.cancellation_reason &&
    booking.cancellation_reason.trim().length > 0;

  if (!hasNotes && !hasCancellation) return null;

  return (
    <div className="space-y-3">
      {hasNotes && (
        <Card className="space-y-2 rounded-xl border p-5 shadow-md dark:shadow-gray-600">
          <div className="text-muted-foreground flex items-center gap-2 text-sm font-semibold tracking-wider uppercase">
            <FileText className="h-4 w-4" />
            Notes
          </div>
          <p className="text-foreground text-sm leading-relaxed">
            {booking.notes}
          </p>
        </Card>
      )}

      {hasCancellation && (
        <Card className="border-destructive/40 bg-destructive/5 space-y-2 rounded-xl border p-5 shadow-md dark:shadow-gray-600"> 
          <div className="text-destructive flex items-center gap-2 text-sm font-semibold tracking-wider uppercase">
            <AlertCircle className="h-4 w-4" />
            Cancellation Reason
          </div>
          <p className="text-destructive/90 text-sm leading-relaxed">
            {booking.cancellation_reason}
          </p>
        </Card>
      )}
    </div>
  );
};

export default BookingNotes;
