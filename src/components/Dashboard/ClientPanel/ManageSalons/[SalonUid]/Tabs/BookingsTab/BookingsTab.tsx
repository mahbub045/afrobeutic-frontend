"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useGetBookingQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Bookings/BookingsApi";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Edit,
  Filter,
  MessageSquare,
  MoreVertical,
  Settings,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

interface Appointment {
  id: string;
  service: string;
  client: string;
  clientAvatar?: string;
  staff: string;
  startTime: string;
  endTime: string;
  status: "checked-in" | "confirmed" | "pending" | "completed";
  color: string;
  column: number;
}

interface StaffMember {
  id: string;
  name: string;
  avatar?: string;
}

const BookingsTab: React.FC = () => {
  const { salonuid } = useParams();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2025, 6, 16)); // July 16, 2025
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // RTK Hooks
  const { data: bookingsData, isLoading: isBookingsLoading } =
    useGetBookingQuery({ salonUid: salonuid });

  // Sample staff members
  const staffMembers: StaffMember[] = [
    { id: "1", name: "Marcus" },
    { id: "2", name: "Natalie" },
    { id: "3", name: "Michael" },
    { id: "4", name: "Chelsea" },
  ];

  // Sample appointments with exact positioning
  const appointments: Appointment[] = [
    // 12 PM Row
    {
      id: "1",
      service: "WOMEN'S HAIRCUT",
      client: "Laura Johnson",
      staff: "Marcus",
      startTime: "12:00 PM",
      endTime: "1:00 PM",
      status: "confirmed",
      color: "bg-gray-300",
      column: 0,
    },
    {
      id: "2",
      service: "50-MINUTE FACIAL",
      client: "Teresa Marion",
      staff: "Natalie",
      startTime: "12:00 PM",
      endTime: "1:00 PM",
      status: "confirmed",
      color: "bg-pink-200",
      column: 1,
    },
    {
      id: "3",
      service: "DOUBLE PROCESS COLOR",
      client: "Abbey Bauch",
      staff: "Michael",
      startTime: "12:00 PM",
      endTime: "1:45 PM",
      status: "confirmed",
      color: "bg-pink-300",
      column: 2,
    },
    {
      id: "4",
      service: "MEN'S HAIRCUT",
      client: "Matthew Hamner",
      staff: "Chelsea",
      startTime: "12:00 PM",
      endTime: "12:45 PM",
      status: "confirmed",
      color: "bg-gray-200",
      column: 3,
    },
    // 1 PM Row
    {
      id: "5",
      service: "WOMEN'S HAIRCUT",
      client: "Ella Harrington",
      staff: "Marcus",
      startTime: "1:00 PM",
      endTime: "2:00 PM",
      status: "confirmed",
      color: "bg-gray-200",
      column: 0,
    },
    {
      id: "6",
      service: "50-MINUTE FACIAL",
      client: "Lucy Carmichael",
      staff: "Natalie",
      startTime: "1:00 PM",
      endTime: "2:00 PM",
      status: "checked-in",
      color: "bg-pink-200 border-2 border-pink-400",
      column: 1,
    },
    {
      id: "7",
      service: "SINGLE PROCESS COLOR",
      client: "Harriet Nelson",
      staff: "Chelsea",
      startTime: "1:00 PM",
      endTime: "2:15 PM",
      status: "confirmed",
      color: "bg-pink-200",
      column: 3,
    },
    // 2 PM Row
    {
      id: "8",
      service: "FULL HIGHLIGHT",
      client: "Kesha Williamson",
      staff: "Marcus",
      startTime: "2:00 PM",
      endTime: "3:30 PM",
      status: "confirmed",
      color: "bg-purple-200",
      column: 0,
    },
    {
      id: "9",
      service: "PEDICURE",
      client: "Nathaniel James",
      staff: "Natalie",
      startTime: "2:00 PM",
      endTime: "3:00 PM",
      status: "confirmed",
      color: "bg-pink-100",
      column: 1,
    },
    {
      id: "10",
      service: "BALAYAGE",
      client: "Natalie Harrington",
      staff: "Michael",
      startTime: "1:45 PM",
      endTime: "3:15 PM",
      status: "confirmed",
      color: "bg-cyan-200",
      column: 2,
    },
    {
      id: "11",
      service: "MEN'S HAIRCUT",
      client: "Jason Chatham",
      staff: "Chelsea",
      startTime: "2:15 PM",
      endTime: "3:00 PM",
      status: "confirmed",
      color: "bg-gray-200",
      column: 3,
    },
    // 3 PM Row
    {
      id: "12",
      service: "GEL MANICURE",
      client: "Kelly Green",
      staff: "Natalie",
      startTime: "3:00 PM",
      endTime: "4:00 PM",
      status: "confirmed",
      color: "bg-pink-100",
      column: 1,
    },
    {
      id: "13",
      service: "Time Block",
      client: "",
      staff: "Michael",
      startTime: "3:15 PM",
      endTime: "3:45 PM",
      status: "confirmed",
      color: "bg-orange-200",
      column: 2,
    },
    {
      id: "14",
      service: "WOMEN'S HAIRCUT",
      client: "Jennifer Baker",
      staff: "Chelsea",
      startTime: "3:00 PM",
      endTime: "4:00 PM",
      status: "confirmed",
      color: "bg-gray-200",
      column: 3,
    },
    // 4 PM Row
    {
      id: "15",
      service: "DOUBLE PROCESS COLOR",
      client: "Lauren Cook",
      staff: "Marcus",
      startTime: "3:45 PM",
      endTime: "5:45 PM",
      status: "confirmed",
      color: "bg-cyan-300",
      column: 0,
    },
    {
      id: "16",
      service: "GEL MANI/PEDI",
      client: "Jason Davidson",
      staff: "Natalie",
      startTime: "4:00 PM",
      endTime: "5:00 PM",
      status: "confirmed",
      color: "bg-cyan-200",
      column: 1,
    },
    {
      id: "17",
      service: "WOMEN'S HAIRCUT",
      client: "Tanisha Williams",
      staff: "Michael",
      startTime: "3:45 PM",
      endTime: "4:45 PM",
      status: "confirmed",
      color: "bg-pink-200",
      column: 2,
    },
    {
      id: "18",
      service: "PARTIAL HIGHLIGHT",
      client: "Ellen Hartlet",
      staff: "Chelsea",
      startTime: "4:00 PM",
      endTime: "5:30 PM",
      status: "confirmed",
      color: "bg-cyan-300",
      column: 3,
    },
  ];

  const timeSlots = [
    { time: "12 PM", label: "12:00 PM" },
    { time: "1 PM", label: "1:00 PM" },
    { time: "2 PM", label: "2:00 PM" },
    { time: "3 PM", label: "3:00 PM" },
    { time: "4 PM", label: "4:00 PM" },
    { time: "5 PM", label: "5:00 PM" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "checked-in":
        return "bg-pink-500";
      case "confirmed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "completed":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
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
          <Button
            variant="outline"
            size="sm"
            className="hidden text-xs font-semibold sm:flex"
          >
            <Filter className="mr-2 h-3 w-3" />
            FILTERS
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 sm:hidden">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-0 overflow-hidden lg:grid-cols-[1fr_380px]">
        {/* Calendar View */}
        <div className="bg-card flex flex-col overflow-hidden lg:border-r">
          {/* Staff Header */}
          <div className="bg-muted/50 flex overflow-x-auto border-b">
            <div className="w-10 flex-shrink-0 border-r sm:w-12 lg:w-16"></div>
            <div className="grid min-w-max flex-1 grid-cols-4">
              {staffMembers.map((staff, index) => (
                <div
                  key={staff.id}
                  className={cn(
                    "flex items-center justify-center gap-1 px-1 py-2 sm:gap-2 sm:px-2 sm:py-3 lg:px-4",
                    index < 3 && "border-r",
                  )}
                >
                  <Avatar className="border-background h-6 w-6 border-2 shadow-sm sm:h-8 sm:w-8 lg:h-9 lg:w-9">
                    <AvatarImage src={staff.avatar} />
                    <AvatarFallback
                      className={cn(
                        "text-xs font-medium text-white sm:text-sm",
                        index === 0 && "bg-orange-400",
                        index === 1 && "bg-purple-400",
                        index === 2 && "bg-indigo-400",
                        index === 3 && "bg-pink-400",
                      )}
                    >
                      {staff.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-foreground text-[10px] font-medium whitespace-nowrap sm:text-xs lg:text-sm">
                    {staff.name}
                  </span>
                  <ChevronRight className="text-muted-foreground hidden h-3 w-3 sm:h-4 sm:w-4 lg:block" />
                </div>
              ))}
            </div>
          </div>

          {/* Time Slots with Appointments */}
          <div className="flex-1 overflow-auto">
            <div className="relative">
              {timeSlots.map((slot, index) => (
                <div
                  key={index}
                  className="flex min-h-[80px] border-b sm:min-h-[90px] lg:min-h-[100px]"
                >
                  <div className="bg-muted/50 text-muted-foreground w-10 flex-shrink-0 border-r px-1 py-2 text-[10px] sm:w-12 sm:px-2 sm:text-xs lg:w-16 lg:px-3">
                    {slot.time}
                  </div>
                  <div className="grid min-w-max flex-1 grid-cols-4">
                    {staffMembers.map((staff, colIndex) => {
                      const staffAppointments = appointments.filter(
                        (apt) =>
                          apt.staff === staff.name &&
                          apt.startTime.includes(slot.label.split(":")[0]),
                      );

                      return (
                        <div
                          key={`${staff.id}-${slot.time}`}
                          className={cn(
                            "hover:bg-muted/30 relative min-w-[120px] p-1 transition-colors sm:min-w-[140px] sm:p-1.5 lg:min-w-0",
                            colIndex < 3 && "border-r",
                          )}
                        >
                          {staffAppointments.map((appointment) => (
                            <div
                              key={appointment.id}
                              className={cn(
                                "mb-1 cursor-pointer rounded p-1.5 transition-all hover:opacity-90 sm:mb-1.5 sm:p-2 lg:p-2.5",
                                appointment.color,
                                selectedAppointment?.id === appointment.id &&
                                  "ring-primary ring-2",
                              )}
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                // Only open sheet on mobile/tablet (below lg breakpoint)
                                if (window.innerWidth < 1024) {
                                  setIsDetailsOpen(true);
                                }
                              }}
                            >
                              <div className="mb-0.5 text-[8px] font-bold tracking-wide text-gray-700 uppercase sm:text-[9px] lg:text-[10px] dark:text-gray-800">
                                {appointment.service}
                              </div>
                              <div className="text-[10px] font-medium text-gray-800 sm:text-xs dark:text-gray-900">
                                {appointment.client}
                              </div>
                              <div className="mt-0.5 text-[8px] text-gray-600 sm:text-[9px] lg:text-[10px] dark:text-gray-700">
                                {appointment.startTime} – {appointment.endTime}
                              </div>
                            </div>
                          ))}
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
        <div className="bg-card hidden overflow-y-auto lg:block">
          <div className="border-b px-6 py-4">
            <div className="mb-3 flex items-start justify-between">
              <h3 className="text-foreground text-base font-semibold">
                {selectedAppointment
                  ? selectedAppointment.service
                  : "Appointment"}
              </h3>
              <div className="-mt-1 flex items-center gap-1">
                {selectedAppointment && (
                  <>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
            {selectedAppointment && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-full bg-pink-100 px-3 py-1 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400">
                  <div className="h-2 w-2 rounded-full bg-pink-500 dark:bg-pink-400" />
                  <span className="text-xs font-medium">Checked In</span>
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

          <div className="px-6 py-4">
            {selectedAppointment ? (
              <div className="space-y-5">
                <div className="flex items-start gap-3 text-sm">
                  <span className="text-muted-foreground mt-0.5 text-xs">
                    On
                  </span>
                  <span className="text-foreground font-medium">
                    Tue, Jul 16
                  </span>
                </div>

                <div className="flex items-start gap-3 text-sm">
                  <span className="text-muted-foreground mt-0.5 text-xs">
                    At
                  </span>
                  <div>
                    <div className="text-foreground font-medium">
                      {selectedAppointment.startTime}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      for: 1 hour
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="border-background h-12 w-12 border-2 shadow">
                      <AvatarImage src={selectedAppointment.clientAvatar} />
                      <AvatarFallback className="bg-pink-500 font-semibold text-white">
                        LC
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-foreground text-base font-semibold">
                        Lucy Carmichael
                      </div>
                      <div className="text-muted-foreground text-xs">
                        Client since April 2022
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="bg-muted/50 rounded-lg border p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <span className="text-foreground text-sm font-medium">
                        Premium Facial Membership
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="-mt-1 -mr-1 h-6 w-6"
                      >
                        <Settings className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-2 text-xs">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>Active</span>
                      <span className="opacity-50">|</span>
                      <span>Billing: July 25</span>
                    </div>
                  </div>

                  <button className="text-primary text-sm hover:underline">
                    Show additional client info
                  </button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground text-base font-semibold">
                      50-Minute Facial
                    </span>
                    <span className="text-foreground text-lg font-semibold">
                      $90
                    </span>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-3 text-sm">
                    <span>with Natalie</span>
                    <span>request: none</span>
                  </div>
                  <div className="text-muted-foreground mt-1 text-xs">
                    at 1:00 PM
                  </div>
                  <div className="text-muted-foreground text-xs">
                    for: 1 hour
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-foreground mb-2 text-sm font-semibold">
                    Booking Details
                  </h4>
                  <div className="text-muted-foreground text-sm">
                    No additional notes
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground py-12 text-center">
                <CalendarIcon className="mx-auto mb-4 h-16 w-16 opacity-30" />
                <p className="text-sm">Select an appointment to view details</p>
              </div>
            )}
          </div>
        </div>

        {/* Appointment Details Sidebar - Mobile (Sheet) - Hidden on lg and above */}
        <div className="lg:hidden">
          <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <SheetContent side="bottom" className="h-[85vh] p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>
                  {selectedAppointment
                    ? selectedAppointment.service
                    : "Appointment Details"}
                </SheetTitle>
              </SheetHeader>
              <div className="flex h-full flex-col">
                <div className="border-b px-4 py-3">
                  <div className="mb-3 flex items-start justify-start gap-4">
                    <h3 className="text-foreground text-base font-semibold">
                      {selectedAppointment
                        ? selectedAppointment.service
                        : "Appointment"}
                    </h3>
                    <div className="flex items-center gap-1">
                      {selectedAppointment && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  {selectedAppointment && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 rounded-full bg-pink-100 px-3 py-1 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400">
                        <div className="h-2 w-2 rounded-full bg-pink-500 dark:bg-pink-400" />
                        <span className="text-xs font-medium">Checked In</span>
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
                    <div className="space-y-5">
                      <div className="flex items-start gap-3 text-sm">
                        <span className="text-muted-foreground mt-0.5 text-xs">
                          On
                        </span>
                        <span className="text-foreground font-medium">
                          Tue, Jul 16
                        </span>
                      </div>

                      <div className="flex items-start gap-3 text-sm">
                        <span className="text-muted-foreground mt-0.5 text-xs">
                          At
                        </span>
                        <div>
                          <div className="text-foreground font-medium">
                            {selectedAppointment.startTime}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            for: 1 hour
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="border-background h-12 w-12 border-2 shadow">
                            <AvatarImage
                              src={selectedAppointment.clientAvatar}
                            />
                            <AvatarFallback className="bg-pink-500 font-semibold text-white">
                              LC
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="text-foreground text-base font-semibold">
                              Lucy Carmichael
                            </div>
                            <div className="text-muted-foreground text-xs">
                              Client since April 2022
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="bg-muted/50 rounded-lg border p-4">
                          <div className="mb-2 flex items-start justify-between">
                            <span className="text-foreground text-sm font-medium">
                              Premium Facial Membership
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="-mt-1 -mr-1 h-6 w-6"
                            >
                              <Settings className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <div className="text-muted-foreground flex items-center gap-2 text-xs">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <span>Active</span>
                            <span className="opacity-50">|</span>
                            <span>Billing: July 25</span>
                          </div>
                        </div>

                        <button className="text-primary text-sm hover:underline">
                          Show additional client info
                        </button>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-foreground text-base font-semibold">
                            50-Minute Facial
                          </span>
                          <span className="text-foreground text-lg font-semibold">
                            $90
                          </span>
                        </div>
                        <div className="text-muted-foreground flex items-center gap-3 text-sm">
                          <span>with Natalie</span>
                          <span>request: none</span>
                        </div>
                        <div className="text-muted-foreground mt-1 text-xs">
                          at 1:00 PM
                        </div>
                        <div className="text-muted-foreground text-xs">
                          for: 1 hour
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="text-foreground mb-2 text-sm font-semibold">
                          Booking Details
                        </h4>
                        <div className="text-muted-foreground text-sm">
                          No additional notes
                        </div>
                      </div>
                    </div>
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
    </div>
  );
};

export default BookingsTab;
