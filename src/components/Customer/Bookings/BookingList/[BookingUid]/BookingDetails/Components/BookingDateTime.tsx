import { CustomerBookingDetail } from "@/Types/Customer/BookingTypes";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { CalendarDays, CheckCircle2, Clock, Timer } from "lucide-react";
import React from "react";

interface Props {
  booking: CustomerBookingDetail;
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="bg-muted text-muted-foreground mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
      {icon}
    </div>
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-foreground text-sm font-medium">{value}</p>
    </div>
  </div>
);

const BookingDateTime: React.FC<Props> = ({ booking }) => {
  const dateTime = `${booking.booking_date}T${booking.booking_time}`;

  return (
    <Card className="space-y-4 rounded-xl border p-5 shadow-md dark:shadow-gray-600">
      <h4 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
        Date &amp; Time
      </h4>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InfoRow
          icon={<CalendarDays className="h-4 w-4" />}
          label="Appointment"
          value={formatDateTime(dateTime)}
        />
        <InfoRow
          icon={<Timer className="h-4 w-4" />}
          label="Duration"
          value={
            booking.booking_duration && booking.booking_duration !== "00:00:00"
              ? booking.booking_duration
              : "Not set"
          }
        />
        <InfoRow
          icon={<Clock className="h-4 w-4" />}
          label="Booked On"
          value={formatDateTime(booking.created_at)}
        />
        {booking.completed_at && (
          <InfoRow
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Completed At"
            value={formatDateTime(booking.completed_at)}
          />
        )}
      </div>
    </Card>
  );
};

export default BookingDateTime;
