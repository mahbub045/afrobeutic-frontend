"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatChoiceFieldValue } from "@/lib/utils";
import { useGetIndividualBookingsQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/IndividualBookings/IndividualBookingsApi";
import {
  Calendar as CalendarIcon,
  CalendarSearch,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import IndividualAppointmentDetailsPanel, {
  IndividualAppointment,
} from "./IndividualAppointmentDetailsPanel";

type ApiStatus =
  | "PLACED"
  | "INPROGRESS"
  | "COMPLETED"
  | "RESCHEDULED"
  | "CANCELLED";

type UiStatus =
  | "placed"
  | "in-progress"
  | "rescheduled"
  | "completed"
  | "cancelled";

interface Appointment {
  id: string;
  service: string;
  client: string;
  startTime: string;
  status: UiStatus;
  color: string;
  bookingDate?: string;
  bookingDuration?: string;
  services?: IndividualBookingApi["services"];
  products?: IndividualBookingApi["products"];
  notes?: string | null;
}

// Shape of a single booking item returned from the API
interface IndividualBookingApi {
  uid?: string;
  booking_id: string;
  booking_date: string; // YYYY-MM-DD
  booking_time: string; // HH:MM:SS
  booking_duration?: string; // HH:MM:SS
  status: ApiStatus;
  customer?: {
    first_name?: string | null;
    last_name?: string | null;
    phone?: string | null;
  } | null;
  services?: {
    name: string;
    price?: string;
    service_duration?: string;
  }[];
  products?: {
    name: string;
    price?: string;
  }[];
  notes?: string | null;
}

// Generate time slots (e.g. 08:00-09:00, 09:00-10:00 ...)
const generateTimeSlots = (
  startHour: number,
  endHour: number,
  stepHours: number,
) => {
  const slots: {
    time: string;
    label: string;
    startMinutes: number;
    endMinutes: number;
  }[] = [];

  for (let h = startHour; h < endHour; h += stepHours) {
    const start = h;
    const end = Math.min(h + stepHours, endHour);
    const startMinutes = start * 60;
    const endMinutes = end * 60;
    const pad = (n: number) => n.toString().padStart(2, "0");
    const time = `${pad(start)}:00-${pad(end)}:00`;
    const label = `${pad(start)}:00`;
    slots.push({ time, label, startMinutes, endMinutes });
  }

  return slots;
};

// Parse appointment time strings in 24-hour format (HH:MM:SS or HH:MM) into minutes since midnight
const parseTimeToMinutes = (timeStr: string) => {
  if (!timeStr) return NaN;
  const s = timeStr.trim();

  const hmatch = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (hmatch) {
    const hour = parseInt(hmatch[1], 10);
    const minute = parseInt(hmatch[2], 10);
    return hour * 60 + minute;
  }

  return NaN;
};

const formatDate = (date: Date, short = false) => {
  if (short) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};

const toLocalYMD = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const timeSlots = generateTimeSlots(8, 20, 1); // 08:00–20:00 hourly

const statusColorMap: Record<ApiStatus, string> = {
  PLACED: "bg-gradient-to-r from-blue-400 to-cyan-300",
  INPROGRESS: "bg-gradient-to-r from-amber-300 to-orange-400",
  COMPLETED: "bg-gradient-to-r from-emerald-300 to-teal-400",
  RESCHEDULED: "bg-gradient-to-r from-purple-300 to-pink-400",
  CANCELLED: "bg-gradient-to-r from-red-400 to-rose-500",
};

const statusMap: Record<ApiStatus, UiStatus> = {
  PLACED: "placed",
  INPROGRESS: "in-progress",
  COMPLETED: "completed",
  RESCHEDULED: "rescheduled",
  CANCELLED: "cancelled",
};

const IndividualBookingsTab: React.FC = () => {
  const { salonuid } = useParams();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<"ALL" | ApiStatus>("ALL");
  const [selectedAppointment, setSelectedAppointment] =
    useState<IndividualAppointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const dateParam = toLocalYMD(selectedDate);

  const filters: Record<string, string> = { booking_date: dateParam };
  if (statusFilter !== "ALL") {
    filters.status = statusFilter;
  }

  // RTK Hooks
  const {
    data: individualBookingsData,
    isLoading: isIndividualBookingsLoading,
  } = useGetIndividualBookingsQuery({
    salonUid: salonuid as string,
    params: filters,
  });

  // Normalize paginated API response into a flat bookings array
  const bookings: IndividualBookingApi[] =
    (individualBookingsData as IndividualBookingApi[]) ?? [];

  const filteredBookings = bookings.filter((booking) => {
    if (statusFilter === "ALL") return true;
    return booking.status === statusFilter;
  });

  const handleStatusUpdated = (newApiStatus: string) => {
    const apiStatus = newApiStatus as ApiStatus;
    setSelectedAppointment((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        status: statusMap[apiStatus] ?? prev.status,
      };
    });
  };

  const handleDateTimeUpdated = (data: {
    booking_date: string;
    booking_time: string;
    notes?: string;
  }) => {
    setSelectedAppointment((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        startTime:
          data.booking_time && data.booking_time.length === 5
            ? `${data.booking_time}:00`
            : data.booking_time || prev.startTime,
        bookingDate: data.booking_date || prev.bookingDate,
        notes: data.notes ?? prev.notes,
      };
    });
  };

  const appointments: Appointment[] = filteredBookings.map((booking) => {
    const apiStatus = booking.status as ApiStatus;

    const customerName = booking.customer
      ? `${booking.customer.first_name ?? ""} ${booking.customer.last_name ?? ""}`.trim()
      : "";

    const serviceName =
      booking.services && booking.services.length > 0
        ? booking.services[0].name
        : "Service";

    return {
      id: booking.uid ?? booking.booking_id,
      service: serviceName.toUpperCase(),
      client: customerName || booking.customer?.phone || "Unknown Customer",
      startTime: booking.booking_time,
      status: (statusMap[apiStatus] ?? "placed") as UiStatus,
      color: statusColorMap[apiStatus] ?? statusColorMap["PLACED"],
      bookingDate: booking.booking_date,
      bookingDuration: booking.booking_duration,
      services: booking.services,
      products: booking.products,
      notes: booking.notes,
    };
  });

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate.toISOString().slice(0, 10));
    newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    setSelectedDate(newDate);
  };

  return (
    <div className="bg-background flex h-full flex-col">
      {/* Header */}
      <div className="bg-card flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2 sm:px-6 sm:py-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(new Date())}
            className="px-2 text-xs font-semibold sm:px-4"
          >
            TODAY
          </Button>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8"
              onClick={() => navigateDate("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8"
              onClick={() => navigateDate("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-foreground text-xs font-normal sm:text-base">
            <span className="hidden sm:inline">{formatDate(selectedDate)}</span>
            <span className="sm:hidden">{formatDate(selectedDate, true)}</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as "ALL" | ApiStatus)}
          >
            <SelectTrigger className="h-7 w-[130px] text-xs font-semibold sm:h-8 sm:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="PLACED">Placed</SelectItem>
              <SelectItem value="INPROGRESS">In-progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="RESCHEDULED">Rescheduled</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-semibold"
              >
                <CalendarSearch className="mr-1 h-3 w-3" />
                {selectedDate.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="p-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => d && setSelectedDate(d)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Content */}
      {appointments.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-muted-foreground mt-10 text-center">
            <CalendarIcon className="mx-auto mb-4 h-16 w-16 opacity-30" />
            <p className="text-sm">No bookings for this date</p>
          </div>
        </div>
      ) : (
        <div className="grid flex-1 grid-cols-1 gap-0 overflow-hidden lg:grid-cols-[1fr_320px]">
          {/* Calendar column */}
          <div className="bg-card flex flex-col overflow-hidden lg:border-r">
            <div className="max-h-[600px] overflow-y-auto">
              <div className="relative min-w-full">
                {timeSlots.map((slot, index) => {
                  const slotAppointments = appointments.filter((apt) => {
                    const aptStart = parseTimeToMinutes(apt.startTime);
                    return (
                      !isNaN(aptStart) &&
                      aptStart >= slot.startMinutes &&
                      aptStart < slot.endMinutes
                    );
                  });

                  return (
                    <div key={index} className="flex border-b last:border-b-0">
                      <div className="bg-muted/50 text-muted-foreground w-14 flex-shrink-0 border-r text-[10px] sm:w-16 sm:text-xs lg:w-20">
                        <div className="min-h-[80px] px-1 py-2 sm:min-h-[90px] sm:px-2 lg:min-h-[100px] lg:px-3">
                          {slot.time}
                        </div>
                      </div>
                      <div className="min-h-[80px] flex-1 p-1 sm:min-h-[90px] sm:p-1.5 lg:min-h-[100px] lg:p-2">
                        {slotAppointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            className={cn(
                              "mb-1 cursor-pointer rounded p-1.5 transition-all hover:opacity-90 sm:mb-1.5 sm:p-2 lg:p-2.5",
                              appointment.color,
                            )}
                            onClick={() => {
                              const detailAppointment: IndividualAppointment = {
                                id: appointment.id,
                                service: appointment.service,
                                client: appointment.client,
                                startTime: appointment.startTime,
                                status: appointment.status,
                                bookingDate: appointment.bookingDate,
                                bookingDuration: appointment.bookingDuration,
                                services: appointment.services,
                                products: appointment.products,
                                notes: appointment.notes,
                              };
                              setSelectedAppointment(detailAppointment);
                              if (
                                typeof window !== "undefined" &&
                                window.innerWidth < 1024
                              ) {
                                setIsDetailsOpen(true);
                              }
                            }}
                          >
                            <div className="mb-0.5 flex items-center justify-between gap-2">
                              <div className="truncate text-[8px] font-extrabold tracking-wide text-gray-700 sm:text-[9px] lg:text-[10px] dark:text-gray-800">
                                {appointment.service ? (
                                  formatChoiceFieldValue(appointment.service)
                                ) : (
                                  <small>No Services Specified</small>
                                )}
                              </div>
                              <div className="text-[8px] font-extrabold tracking-wide whitespace-nowrap text-gray-700 sm:text-[9px] lg:text-[10px] dark:text-gray-800">
                                {formatChoiceFieldValue(appointment.status)}
                              </div>
                            </div>
                            <div className="text-[10px] font-medium text-gray-800 sm:text-xs dark:text-gray-900">
                              {appointment.client}
                            </div>
                            <div className="mt-0.5 text-[8px] text-gray-600 sm:text-[9px] lg:text-[10px] dark:text-gray-700">
                              At {appointment.startTime}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Details sidebar / mobile sheet */}
          <IndividualAppointmentDetailsPanel
            selectedAppointment={selectedAppointment}
            dateLabel={formatDate(selectedDate)}
            isOpen={isDetailsOpen}
            onOpenChange={setIsDetailsOpen}
            onStatusUpdated={handleStatusUpdated}
            onDateTimeUpdated={handleDateTimeUpdated}
          />
        </div>
      )}
    </div>
  );
};

export default IndividualBookingsTab;
