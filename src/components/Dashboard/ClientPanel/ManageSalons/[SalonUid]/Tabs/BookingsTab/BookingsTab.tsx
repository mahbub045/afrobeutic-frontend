"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn, formatChoiceFieldValue } from "@/lib/utils";
import {
  useGetBookingQuery,
  useGetSingleBookingQuery,
} from "@/Redux/Reducers/ClientPanel/ManageSalons/Bookings/BookingsApi";
import {
  Booking,
  StaffMemberWithBookings,
} from "@/Types/ClientPanel/ManageSalonTypes/BookingsTypes/BookingsTypes";
import {
  Calendar as CalendarIcon,
  CalendarSearch,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit,
  LoaderPinwheel,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useState } from "react";
import EditBookingDialog from "./Dialogs/EditBookingDialog";

interface Appointment {
  id: string;
  service: string;
  client: string;
  clientAvatar?: string;
  staff: string;
  startTime: string;
  endTime: string;
  status: "placed" | "in-progress" | "rescheduled" | "completed" | "cancelled";
  color: string;
  column: number;
  fullBookingData?: Booking;
}

interface StaffMember {
  id: string;
  name: string;
  avatar?: string;
}

const BookingsTab: React.FC = () => {
  const { salonuid } = useParams();
  const { data: session } = useSession();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode] = useState<"day" | "week">("day");
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBookingUid, setSelectedBookingUid] = useState<string | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PLACED" | "INPROGRESS" | "COMPLETED" | "RESCHEDULED" | "CANCELLED"
  >("ALL");

  const handleIsEditDialogOpen = (open: boolean) => {
    setIsEditDialogOpen(open);
  };

  // RTK Hooks
  // Convert selected date to local YYYY-MM-DD to avoid UTC shift (off-by-one)
  const toLocalYMD = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };
  const dateParam = toLocalYMD(selectedDate);
  const filters: Record<string, string> = { date: dateParam };
  if (statusFilter !== "ALL") {
    filters.status = statusFilter;
  }
  const { data: bookingsData, isLoading: isBookingsLoading } =
    useGetBookingQuery({
      salonUid: salonuid as string,
      filters,
    });

  // Fetch single booking details when a booking is selected
  const { data: singleBookingData, isLoading: isSingleBookingLoading } =
    useGetSingleBookingQuery(
      {
        salonUid: salonuid as string,
        bookingUid: selectedBookingUid!,
      },
      {
        skip: !selectedBookingUid, // Only fetch when a booking is selected
      },
    );

  const extractBookingData = bookingsData?.results || [];

  // Extract staff members from API data
  const staffMembers: StaffMember[] = extractBookingData.map(
    (staff: StaffMemberWithBookings) => ({
      id: staff.uid,
      name: staff.name,
      avatar: staff.image || undefined,
    }),
  );

  // Transform API bookings to appointments and store full booking data
  const appointments: Appointment[] = extractBookingData.flatMap(
    (staff: StaffMemberWithBookings, staffIndex: number) =>
      staff.bookings.map((booking: Booking) => {
        // Use booking_time directly as startTime (already in HH:MM:SS format)
        const startTime = booking.booking_time;

        // Get service names (combine multiple services if needed)
        const serviceNames = booking.services
          .map((s) => s.name)
          .join(", ")
          .toUpperCase();

        // Assign colors based on status
        const statusColorMap: { [key: string]: string } = {
          PLACED: "bg-gradient-to-r from-blue-400 to-cyan-300",
          INPROGRESS: "bg-gradient-to-r from-amber-300 to-orange-400",
          COMPLETED: "bg-gradient-to-r from-emerald-300 to-teal-400",
          RESCHEDULED: "bg-gradient-to-r from-purple-300 to-pink-400",
          CANCELLED: "bg-gradient-to-r from-red-400 to-rose-500",
        };

        // Map status enum to display format
        const statusMap: {
          [key: string]:
            | "placed"
            | "in-progress"
            | "rescheduled"
            | "completed"
            | "cancelled";
        } = {
          PLACED: "placed",
          INPROGRESS: "in-progress",
          COMPLETED: "completed",
          RESCHEDULED: "rescheduled",
          CANCELLED: "cancelled",
        };

        return {
          id: booking.uid,
          service: serviceNames,
          client: booking.customer.name,
          clientAvatar: undefined,
          staff: staff.name,
          startTime,
          endTime: "",
          status: statusMap[booking.status] || "placed",
          color: statusColorMap[booking.status] || "bg-gray-200",
          column: staffIndex,
          // Store full booking data for details view
          fullBookingData: booking,
        };
      }),
  );

  // Generate time slots programmatically so we can easily change the step (hours)
  // Produces 24-hour ranges like "10:00-12:00". Times are stored in minutes for precise matching.
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

  // Use 24-hour format, 2-hour intervals for full day (0:00 to 24:00)
  const timeSlots = generateTimeSlots(0, 24, 2); // 00:00-02:00, 02:00-04:00, ..., 22:00-24:00

  // Parse appointment time strings in 24-hour format (HH:MM:SS or HH:MM) into minutes since midnight
  const parseTimeToMinutes = (timeStr: string) => {
    if (!timeStr) return NaN;
    const s = timeStr.trim();

    // Try 24h format like "13:00:00" or "13:00"
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

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    if (viewMode === "day") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    } else {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    }
    setSelectedDate(newDate);
  };

  // Helpers to safely handle cancelled status and reason from possibly under-typed API shapes
  const isCancelled = (() => {
    const selectedAptCancelled = selectedAppointment?.status === "cancelled";
    const apiStatus = (singleBookingData as unknown as { status?: string })
      ?.status;
    const fullStatus = (
      selectedAppointment?.fullBookingData as unknown as { status?: string }
    )?.status;
    return (
      selectedAptCancelled ||
      apiStatus === "CANCELLED" ||
      fullStatus === "CANCELLED"
    );
  })();

  const cancellationReason = (
    singleBookingData as unknown as { cancellation_reason?: string }
  )?.cancellation_reason;

  // Map API status to UI status string used for styling/labels
  const getUiStatus = (
    status?: string,
  ):
    | "placed"
    | "in-progress"
    | "rescheduled"
    | "completed"
    | "cancelled"
    | undefined => {
    switch (status) {
      case "PLACED":
        return "placed";
      case "INPROGRESS":
        return "in-progress";
      case "COMPLETED":
        return "completed";
      case "RESCHEDULED":
        return "rescheduled";
      case "CANCELLED":
        return "cancelled";
      default:
        return undefined;
    }
  };

  const effectiveStatus =
    getUiStatus(
      (singleBookingData as unknown as { status?: string })?.status,
    ) || selectedAppointment?.status;

  const getServiceTitle = () => {
    const services = (
      singleBookingData as unknown as { services?: { name: string }[] }
    )?.services;
    if (services && services.length > 0) {
      return services
        .map((s) => s.name)
        .join(", ")
        .toUpperCase();
    }
    return selectedAppointment ? selectedAppointment.service : "Appointment";
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
            onValueChange={(v) =>
              setStatusFilter(
                v as
                  | "ALL"
                  | "PLACED"
                  | "INPROGRESS"
                  | "COMPLETED"
                  | "RESCHEDULED"
                  | "CANCELLED",
              )
            }
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

      {isBookingsLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="p-10 text-center">
            <LoaderPinwheel className="animate-spin" />
          </div>
        </div>
      ) : staffMembers.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-muted-foreground mt-10 text-center">
            <CalendarIcon className="mx-auto mb-4 h-16 w-16 opacity-30" />
            <p className="text-sm">No staff members found</p>
          </div>
        </div>
      ) : (
        <div className="grid flex-1 grid-cols-1 gap-0 overflow-hidden lg:grid-cols-[1fr_320px]">
          {/* Calendar View */}
          <div className="bg-card flex flex-col overflow-hidden lg:border-r">
            {/* Time Slots with Appointments */}
            <div className="max-h-[600px] flex-1 overflow-auto">
              <div className="relative">
                {timeSlots.map((slot, index) => (
                  <div key={index} className="flex border-b">
                    <div className="bg-muted/50 text-muted-foreground w-10 flex-shrink-0 border-r text-[10px] sm:w-12 sm:text-xs lg:w-16">
                      {index === 0 && (
                        <div className="border-b px-1 py-2 sm:px-2 sm:py-[22px] lg:px-3">
                          &nbsp;
                        </div>
                      )}
                      <div className="min-h-[80px] px-1 py-2 sm:min-h-[90px] sm:px-2 lg:min-h-[100px] lg:px-3">
                        {slot.time}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "grid min-w-max flex-1",
                        staffMembers.length === 1 && "grid-cols-1",
                        staffMembers.length === 2 && "grid-cols-2",
                        staffMembers.length === 3 && "grid-cols-3",
                        staffMembers.length >= 4 && "grid-cols-4",
                      )}
                    >
                      {staffMembers.map((staff, colIndex) => {
                        const staffAppointments = appointments.filter((apt) => {
                          if (apt.staff !== staff.name) return false;
                          const aptStart = parseTimeToMinutes(apt.startTime);
                          return (
                            !isNaN(aptStart) &&
                            aptStart >= slot.startMinutes &&
                            aptStart < slot.endMinutes
                          );
                        });

                        return (
                          <div
                            key={`${staff.id}-${slot.time}`}
                            className={cn(
                              "relative min-w-[120px] sm:min-w-[140px] lg:min-w-0",
                              colIndex < staffMembers.length - 1 && "border-r",
                            )}
                          >
                            {/* Staff Header in first row */}
                            {index === 0 && (
                              <div className="bg-muted/50 flex items-center justify-center gap-1 border-b px-1 py-2 sm:gap-2 sm:px-2 sm:py-3 lg:px-4">
                                <Avatar className="border-background h-6 w-6 border-2 shadow-sm sm:h-8 sm:w-8 lg:h-9 lg:w-9">
                                  <AvatarImage src={staff.avatar} />
                                  <AvatarFallback
                                    className={cn(
                                      "text-xs font-medium text-white sm:text-sm",
                                      colIndex === 0 && "bg-orange-400",
                                      colIndex === 1 && "bg-purple-400",
                                      colIndex === 2 && "bg-indigo-400",
                                      colIndex === 3 && "bg-pink-400",
                                      colIndex >= 4 && "bg-cyan-400",
                                    )}
                                  >
                                    {staff.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-foreground text-[10px] font-medium whitespace-nowrap sm:text-xs lg:text-sm">
                                  {staff.name}
                                </span>
                                <ChevronDown className="text-muted-foreground hidden h-3 w-3 sm:h-4 sm:w-4 lg:block" />
                              </div>
                            )}

                            {/* Appointments area */}
                            <div className="hover:bg-muted/30 min-h-[80px] p-1 transition-colors sm:min-h-[90px] sm:p-1.5 lg:min-h-[100px]">
                              {staffAppointments.map((appointment) => (
                                <div
                                  key={appointment.id}
                                  className={cn(
                                    "mb-1 cursor-pointer rounded p-1.5 transition-all hover:opacity-90 sm:mb-1.5 sm:p-2 lg:p-2.5",
                                    appointment.color,
                                    selectedAppointment?.id ===
                                      appointment.id && "ring-primary ring-2",
                                  )}
                                  onClick={() => {
                                    setSelectedAppointment(appointment);
                                    setSelectedBookingUid(appointment.id);
                                    // Only open sheet on mobile/tablet (below lg breakpoint)
                                    if (window.innerWidth < 1024) {
                                      setIsDetailsOpen(true);
                                    }
                                  }}
                                >
                                  <div className="mb-0.5 flex items-center justify-between gap-2">
                                    <div className="truncate text-[8px] font-extrabold tracking-wide text-gray-700 sm:text-[9px] lg:text-[10px] dark:text-gray-800">
                                      {formatChoiceFieldValue(
                                        appointment.service,
                                      )}
                                    </div>
                                    <div className="text-[8px] font-extrabold tracking-wide whitespace-nowrap text-gray-700 sm:text-[9px] lg:text-[10px] dark:text-gray-800">
                                      {formatChoiceFieldValue(
                                        appointment.status,
                                      )}
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
                ))}
              </div>
            </div>
          </div>

          {/* Appointment Details Sidebar - Desktop */}
          <div className="bg-card hidden max-h-[600px] overflow-hidden lg:flex lg:flex-col">
            <div className="flex-shrink-0 border-b px-6 py-3">
              <div className="mb-3 flex items-start justify-between">
                <h3 className="text-foreground text-base font-semibold">
                  {getServiceTitle()}
                </h3>
                <div className="-mt-1 flex items-center gap-1">
                  {selectedAppointment && (
                    <>
                      <div>
                        {(session?.user?.role === "OWNER" ||
                          session?.user?.role === "ADMIN") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleIsEditDialogOpen(true)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
              {selectedAppointment && (
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-full px-3 py-1",
                      effectiveStatus === "placed" &&
                        "bg-gradient-to-r from-blue-400 to-cyan-300 text-white",
                      effectiveStatus === "in-progress" &&
                        "bg-gradient-to-r from-amber-300 to-orange-400 text-white",
                      effectiveStatus === "rescheduled" &&
                        "bg-gradient-to-r from-purple-300 to-pink-400 text-white",
                      effectiveStatus === "completed" &&
                        "bg-gradient-to-r from-emerald-300 to-teal-400 text-white",
                      effectiveStatus === "cancelled" &&
                        "bg-gradient-to-r from-red-400 to-rose-500 text-white",
                    )}
                  >
                    <div className={cn("h-2 w-2 rounded-full bg-white")} />
                    <span className="text-xs font-medium capitalize">
                      {(effectiveStatus || "").replace("-", " ")}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto text-xs font-semibold"
                  >
                    CHECKOUT
                  </Button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {selectedAppointment ? (
                isSingleBookingLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoaderPinwheel className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="flex items-start gap-3 text-sm">
                      <span className="text-muted-foreground mt-0.5 text-xs">
                        On
                      </span>
                      <span className="text-foreground font-medium">
                        {formatDate(selectedDate, false)}
                      </span>
                    </div>

                    <div className="item-center flex justify-between">
                      <div className="flex items-start gap-3 text-xs">
                        At:
                        <div>
                          <div className="text-foreground">
                            {singleBookingData?.booking_time ?? "N/A"}
                          </div>
                        </div>
                      </div>
                      <div className="text-muted-foreground text-xs">
                        Duration:{" "}
                        <span className="text-foreground">
                          {singleBookingData?.booking_duration ?? "N/A"}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="border-background h-12 w-12 border-2 shadow">
                          <AvatarImage src={selectedAppointment.clientAvatar} />
                          <AvatarFallback className="bg-primary font-semibold text-white">
                            {(singleBookingData?.customer.name || "?").charAt(
                              0,
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="text-foreground text-base font-semibold">
                            {singleBookingData?.customer.name ?? "Unknown"}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            Client
                          </div>
                        </div>
                        {/* <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MessageSquare className="h-4 w-4" />
                      </Button> */}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="text-foreground text-sm font-semibold">
                        Services ({singleBookingData?.total_services ?? 0})
                      </h4>
                      {(singleBookingData?.services || []).map((service) => (
                        <div
                          key={service.uid}
                          className="space-y-1 rounded-lg border p-3"
                        >
                          <div className="flex items-start justify-between">
                            <span className="text-foreground text-sm font-medium">
                              {service.name}
                            </span>
                            <span className="text-foreground text-sm font-semibold">
                              ${service.discount_price}
                            </span>
                          </div>
                          <div className="text-muted-foreground text-xs">
                            Price: ${service.price} • Discount:{" "}
                            {service.discount_percentage}% • Final: $
                            {service.discount_price}
                          </div>
                          {service.description && (
                            <p className="text-muted-foreground mt-1 text-xs">
                              {service.description}
                            </p>
                          )}
                        </div>
                      ))}
                      <div className="text-muted-foreground flex items-center gap-3 pt-2 text-sm">
                        <span>
                          with{" "}
                          {(
                            singleBookingData as unknown as {
                              employee?: { name?: string };
                            }
                          )?.employee?.name || selectedAppointment.staff}
                        </span>
                      </div>
                    </div>

                    {singleBookingData?.products &&
                      singleBookingData.products.length > 0 && (
                        <>
                          <Separator />
                          <div className="space-y-3">
                            <h4 className="text-foreground text-sm font-semibold">
                              Products ({singleBookingData?.total_products ?? 0}
                              )
                            </h4>
                            {(singleBookingData?.products || []).map(
                              (product) => (
                                <div
                                  key={product.uid}
                                  className="space-y-1 rounded-lg border p-3"
                                >
                                  <div className="flex items-start justify-between">
                                    <span className="text-foreground text-sm font-medium">
                                      {product.name}
                                    </span>
                                    <span className="text-foreground text-sm font-semibold">
                                      ${product.price}
                                    </span>
                                  </div>
                                  {product.description && (
                                    <p className="text-muted-foreground mt-1 text-xs">
                                      {product.description}
                                    </p>
                                  )}
                                </div>
                              ),
                            )}
                          </div>
                        </>
                      )}

                    <Separator />

                    <div className="space-y-2">
                      <h4 className="text-foreground text-sm font-semibold">
                        Pricing Summary
                      </h4>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Services Total
                          </span>
                          <del className="text-muted-foreground">
                            $
                            {(
                              singleBookingData?.total_services_price ??
                              (singleBookingData?.services || []).reduce(
                                (sum, s) => sum + parseFloat(s.price),
                                0,
                              )
                            ).toFixed(2)}
                          </del>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Services Total{" "}
                            <small className="text-[10px]">
                              (After Discount)
                            </small>
                          </span>
                          <span className="text-foreground">
                            $
                            {(
                              singleBookingData?.services_discount_price ??
                              (singleBookingData?.services || []).reduce(
                                (sum, s) => sum + parseFloat(s.discount_price),
                                0,
                              )
                            ).toFixed(2)}
                          </span>
                        </div>
                        {singleBookingData?.products &&
                          singleBookingData.products.length > 0 && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                Products Total
                              </span>
                              <span className="text-foreground">
                                $
                                {(
                                  singleBookingData?.total_products_price ??
                                  (singleBookingData?.products || []).reduce(
                                    (sum, p) => sum + parseFloat(p.price),
                                    0,
                                  )
                                ).toFixed(2)}
                              </span>
                            </div>
                          )}
                        <div className="mt-1.5 border-t pt-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Total Price
                            </span>
                            <del className="text-muted-foreground font-medium">
                              $
                              {(singleBookingData?.total_price ?? 0).toFixed(2)}
                            </del>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-base">
                          <span className="text-foreground font-semibold">
                            Final Price
                          </span>
                          <span className="text-foreground font-bold">
                            ${(singleBookingData?.final_price ?? 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="text-foreground mb-2 text-sm font-semibold">
                        Notes:
                      </h4>
                      {singleBookingData?.notes ? (
                        <p className="text-foreground text-xs">
                          {singleBookingData.notes}
                        </p>
                      ) : (
                        <p className="text-muted-foreground text-xs">
                          No additional notes for this booking.
                        </p>
                      )}
                    </div>

                    {isCancelled && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="text-foreground mb-2 text-sm font-semibold">
                            Cancellation Reason:
                          </h4>
                          {cancellationReason ? (
                            <p className="text-foreground text-xs">
                              {cancellationReason}
                            </p>
                          ) : (
                            <p className="text-muted-foreground text-xs">
                              No cancellation reason provided.
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              ) : (
                <div className="text-muted-foreground py-12 text-center">
                  <CalendarIcon className="mx-auto mb-4 h-16 w-16 opacity-30" />
                  <p className="text-sm">
                    Select an appointment to view details
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Appointment Details Sidebar - Mobile (Sheet) - Hidden on lg and above */}
          <div className="lg:hidden">
            <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
              <SheetContent side="bottom" className="h-[85vh] p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>{getServiceTitle()}</SheetTitle>
                </SheetHeader>
                <div className="flex h-full flex-col">
                  <div className="border-b px-4 py-3">
                    <div className="mb-3 flex items-start justify-start gap-4">
                      <h3 className="text-foreground text-base font-semibold">
                        {getServiceTitle()}
                      </h3>
                      <div className="flex items-center gap-1">
                        {selectedAppointment && (
                          <>
                            <div>
                              {(session?.user?.role === "OWNER" ||
                                session?.user?.role === "ADMIN") && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleIsEditDialogOpen(true)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    {selectedAppointment && (
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "flex items-center gap-2 rounded-full px-3 py-1",
                            effectiveStatus === "placed" &&
                              "bg-gradient-to-r from-blue-400 to-cyan-300 text-white",
                            effectiveStatus === "in-progress" &&
                              "bg-gradient-to-r from-amber-300 to-orange-400 text-white",
                            effectiveStatus === "rescheduled" &&
                              "bg-gradient-to-r from-purple-300 to-pink-400 text-white",
                            effectiveStatus === "completed" &&
                              "bg-gradient-to-r from-emerald-300 to-teal-400 text-white",
                            effectiveStatus === "cancelled" &&
                              "bg-gradient-to-r from-red-400 to-rose-500 text-white",
                          )}
                        >
                          <div
                            className={cn("h-2 w-2 rounded-full bg-white")}
                          />
                          <span className="text-xs font-medium capitalize">
                            {(effectiveStatus || "").replace("-", " ")}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-auto text-xs font-semibold"
                        >
                          CHECKOUT
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto px-4 py-4">
                    {selectedAppointment ? (
                      isSingleBookingLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <LoaderPinwheel className="h-8 w-8 animate-spin" />
                        </div>
                      ) : (
                        <div className="space-y-5">
                          <div className="flex items-start gap-3 text-sm">
                            <span className="text-muted-foreground mt-0.5 text-xs">
                              On
                            </span>
                            <span className="text-foreground font-medium">
                              {formatDate(selectedDate, false)}
                            </span>
                          </div>

                          <div className="item-center flex justify-between">
                            <div className="flex items-start gap-3 text-xs">
                              At:
                              <div>
                                <div className="text-foreground">
                                  {singleBookingData?.booking_time ?? "N/A"}
                                </div>
                              </div>
                            </div>
                            <div className="text-muted-foreground text-xs">
                              Duration:{" "}
                              <span className="text-foreground">
                                {singleBookingData?.booking_duration ?? "N/A"}
                              </span>
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-4">
                            <div className="flex items-start gap-3">
                              <Avatar className="border-background h-12 w-12 border-2 shadow">
                                <AvatarImage src={undefined} />
                                <AvatarFallback className="bg-primary font-semibold text-white">
                                  {(
                                    singleBookingData?.customer?.name || "?"
                                  ).charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="text-foreground text-base font-semibold">
                                  {singleBookingData?.customer?.name ??
                                    "Unknown"}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                  Client
                                </div>
                              </div>
                              {/* <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button> */}
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-3">
                            <h4 className="text-foreground text-sm font-semibold">
                              Services ({singleBookingData?.total_services ?? 0}
                              )
                            </h4>
                            {(singleBookingData?.services || []).map(
                              (service) => (
                                <div
                                  key={service.uid}
                                  className="space-y-1 rounded-lg border p-3"
                                >
                                  <div className="flex items-start justify-between">
                                    <span className="text-foreground text-sm font-medium">
                                      {service.name}
                                    </span>
                                    <span className="text-foreground text-sm font-semibold">
                                      ${service.discount_price}
                                    </span>
                                  </div>
                                  <div className="text-muted-foreground text-xs">
                                    Price: ${service.price} • Discount:{" "}
                                    {service.discount_percentage}% • Final: $
                                    {service.discount_price}
                                  </div>
                                  {service.description && (
                                    <p className="text-muted-foreground mt-1 text-xs">
                                      {service.description}
                                    </p>
                                  )}
                                </div>
                              ),
                            )}
                            <div className="text-muted-foreground flex items-center gap-3 pt-2 text-sm">
                              <span>
                                with{" "}
                                {(
                                  singleBookingData as unknown as {
                                    employee?: { name?: string };
                                  }
                                )?.employee?.name || selectedAppointment.staff}
                              </span>
                            </div>
                          </div>

                          {(singleBookingData?.products || []).length > 0 && (
                            <>
                              <Separator />
                              <div className="space-y-3">
                                <h4 className="text-foreground text-sm font-semibold">
                                  Products (
                                  {singleBookingData?.total_products ?? 0})
                                </h4>
                                {(singleBookingData?.products || []).map(
                                  (product) => (
                                    <div
                                      key={product.uid}
                                      className="space-y-1 rounded-lg border p-3"
                                    >
                                      <div className="flex items-start justify-between">
                                        <span className="text-foreground text-sm font-medium">
                                          {product.name}
                                        </span>
                                        <span className="text-foreground text-sm font-semibold">
                                          ${product.price}
                                        </span>
                                      </div>
                                      {product.description && (
                                        <p className="text-muted-foreground mt-1 text-xs">
                                          {product.description}
                                        </p>
                                      )}
                                    </div>
                                  ),
                                )}
                              </div>
                            </>
                          )}

                          <Separator />

                          <div className="space-y-2">
                            <h4 className="text-foreground text-sm font-semibold">
                              Pricing Summary
                            </h4>
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Services Total
                                </span>
                                <del className="text-muted-foreground">
                                  $
                                  {(
                                    singleBookingData?.total_services_price ??
                                    (singleBookingData?.services || []).reduce(
                                      (sum, s) => sum + parseFloat(s.price),
                                      0,
                                    )
                                  ).toFixed(2)}
                                </del>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Services Total{" "}
                                  <small className="text-[10px]">
                                    (After Discount)
                                  </small>
                                </span>
                                <span className="text-foreground">
                                  $
                                  {(
                                    singleBookingData?.services_discount_price ??
                                    (singleBookingData?.services || []).reduce(
                                      (sum, s) =>
                                        sum + parseFloat(s.discount_price),
                                      0,
                                    )
                                  ).toFixed(2)}
                                </span>
                              </div>
                              {(singleBookingData?.products || []).length >
                                0 && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    Products Total
                                  </span>
                                  <span className="text-foreground">
                                    $
                                    {(
                                      singleBookingData?.total_products_price ??
                                      (
                                        singleBookingData?.products || []
                                      ).reduce(
                                        (sum, p) => sum + parseFloat(p.price),
                                        0,
                                      )
                                    ).toFixed(2)}
                                  </span>
                                </div>
                              )}
                              <div className="mt-1.5 border-t pt-1.5">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    Total Price
                                  </span>
                                  <del className="text-muted-foreground font-medium">
                                    $
                                    {(
                                      singleBookingData?.total_price ?? 0
                                    ).toFixed(2)}
                                  </del>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-base">
                                <span className="text-foreground font-semibold">
                                  Final Price
                                </span>
                                <span className="text-foreground font-bold">
                                  $
                                  {(
                                    singleBookingData?.final_price ?? 0
                                  ).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          <div>
                            <h4 className="text-foreground mb-2 text-sm font-semibold">
                              Notes:
                            </h4>
                            {singleBookingData?.notes ? (
                              <p className="text-foreground text-xs">
                                {singleBookingData.notes}
                              </p>
                            ) : (
                              <p className="text-muted-foreground text-xs">
                                No additional notes for this booking.
                              </p>
                            )}
                          </div>

                          {isCancelled && (
                            <>
                              <Separator />
                              <div>
                                <h4 className="text-foreground mb-2 text-sm font-semibold">
                                  Cancellation Reason:
                                </h4>
                                {cancellationReason ? (
                                  <p className="text-foreground text-xs">
                                    {cancellationReason}
                                  </p>
                                ) : (
                                  <p className="text-muted-foreground text-xs">
                                    No cancellation reason provided.
                                  </p>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )
                    ) : (
                      <div className="text-muted-foreground py-12 text-center">
                        <CalendarIcon className="mx-auto mb-4 h-16 w-16 opacity-30" />
                        <p className="text-sm">
                          Select an appointment to view details
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      )}

      {/* Edit Booking Dialog */}
      <EditBookingDialog
        isOpen={isEditDialogOpen}
        onClose={() => handleIsEditDialogOpen(false)}
        bookingData={
          selectedAppointment
            ? {
                uid: selectedAppointment.id,
                booking_date:
                  singleBookingData?.booking_date ||
                  selectedAppointment.fullBookingData?.booking_date ||
                  "",
                booking_time:
                  singleBookingData?.booking_time ||
                  selectedAppointment.startTime,
                booking_duration:
                  singleBookingData?.booking_duration ||
                  selectedAppointment.fullBookingData?.booking_duration ||
                  "",
                status:
                  singleBookingData?.status ||
                  selectedAppointment.fullBookingData?.status ||
                  "PLACED",
                cancellation_reason:
                  (
                    singleBookingData as unknown as {
                      cancellation_reason?: string;
                    }
                  )?.cancellation_reason ||
                  (
                    selectedAppointment.fullBookingData as unknown as {
                      cancellation_reason?: string;
                    }
                  )?.cancellation_reason ||
                  "",
                notes:
                  singleBookingData?.notes ||
                  selectedAppointment.fullBookingData?.notes ||
                  "",
                customer: {
                  name:
                    singleBookingData?.customer?.name ||
                    selectedAppointment.fullBookingData?.customer?.name ||
                    selectedAppointment.client,
                  phone:
                    singleBookingData?.customer?.phone ||
                    selectedAppointment.fullBookingData?.customer?.phone ||
                    "",
                },
                employee: {
                  uid:
                    singleBookingData?.employee?.uid ||
                    selectedAppointment.fullBookingData?.employee?.uid ||
                    "",
                },
                services:
                  singleBookingData?.services ||
                  selectedAppointment.fullBookingData?.services ||
                  [],
                products:
                  singleBookingData?.products ||
                  selectedAppointment.fullBookingData?.products ||
                  [],
                images: [],
              }
            : undefined
        }
      />
    </div>
  );
};

export default BookingsTab;
