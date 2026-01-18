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
import { cn, formatChoiceFieldValue } from "@/lib/utils";
import { Calendar as CalendarIcon, Edit } from "lucide-react";
import { useState } from "react";
import EditBookingDialog from "./Dialogs/EditBookingTimeAndDateDialog";
import EditBookingTimeAndDateDialog from "./Dialogs/EditBookingTimeAndDateDialog";

type UiStatus =
  | "placed"
  | "in-progress"
  | "rescheduled"
  | "completed"
  | "cancelled";

export interface IndividualAppointment {
  id: string;
  service: string;
  client: string;
  startTime: string;
  status: UiStatus;
  bookingDate?: string;
  bookingDuration?: string;
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

interface IndividualAppointmentDetailsPanelProps {
  selectedAppointment: IndividualAppointment | null;
  /** Formatted date label, e.g. "Tuesday, January 17" */
  dateLabel: string;
  /** Controls the mobile sheet */
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const IndividualAppointmentDetailsPanel: React.FC<
  IndividualAppointmentDetailsPanelProps
> = ({ selectedAppointment, dateLabel, isOpen, onOpenChange }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const effectiveStatus: UiStatus | undefined = selectedAppointment?.status;

  const statusClasses = cn(
    "flex items-center gap-2 rounded-full px-3 py-1",
    effectiveStatus === "placed" &&
      "bg-gradient-to-r from-blue-600 to-cyan-600 text-white",
    effectiveStatus === "in-progress" &&
      "bg-gradient-to-r from-amber-600 to-orange-600 text-white",
    effectiveStatus === "rescheduled" &&
      "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
    effectiveStatus === "completed" &&
      "bg-gradient-to-r from-emerald-600 to-teal-600 text-white",
    effectiveStatus === "cancelled" &&
      "bg-gradient-to-r from-red-400 to-rose-600 text-white",
  );

  const renderContent = () => {
    if (!selectedAppointment) {
      return (
        <div className="text-muted-foreground py-12 text-center">
          <CalendarIcon className="mx-auto mb-4 h-16 w-16 opacity-30" />
          <p className="text-sm">Select an appointment to view details</p>
        </div>
      );
    }
    const services = selectedAppointment.services ?? [];
    const products = selectedAppointment.products ?? [];

    const servicesCount = services.length;
    const productsCount = products.length;

    const parseAmount = (value?: string) => {
      const num = Number(value);
      return Number.isNaN(num) ? 0 : num;
    };

    const servicesTotal = services
      .reduce((sum, svc) => sum + parseAmount(svc.price), 0)
      .toFixed(2);

    const productsTotal = products
      .reduce((sum, prod) => sum + parseAmount(prod.price), 0)
      .toFixed(2);

    const grandTotal = (
      parseFloat(servicesTotal) + parseFloat(productsTotal)
    ).toFixed(2);

    return (
      <div className="space-y-5">
        <div className="flex justify-between">
          <div className="flex items-start gap-3 text-sm">
            <span className="text-muted-foreground mt-0.5 text-xs">On</span>
            <span className="text-foreground font-medium">{dateLabel}</span>
          </div>
          <div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0"
              type="button"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit size={14} />
            </Button>
          </div>
        </div>

        <div className="item-center flex justify-between">
          <div className="flex items-start gap-3 text-xs">
            <span>At:</span>
            <div className="text-foreground">
              {selectedAppointment.startTime || "N/A"}
            </div>
          </div>
          <div className="text-muted-foreground text-xs">
            Duration:{" "}
            <span className="text-foreground">
              {selectedAppointment.bookingDuration || "N/A"}
            </span>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Avatar className="border-background h-12 w-12 border-2 shadow">
              <AvatarImage src={undefined} />
              <AvatarFallback className="bg-primary font-semibold text-white">
                {selectedAppointment.client.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-foreground text-base font-semibold">
                {selectedAppointment.client}
              </div>
              <div className="text-muted-foreground text-xs">Client</div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-foreground text-sm font-semibold">
              Services ({servicesCount})
            </h4>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0"
              type="button"
            >
              <Edit size={14} />
            </Button>
          </div>
          {servicesCount === 0 ? (
            <p className="text-muted-foreground text-xs">
              No services added to this booking.
            </p>
          ) : (
            <div className="space-y-1 rounded-lg border p-3">
              {services.map((svc, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between py-1 first:pt-0 last:pb-0"
                >
                  <div>
                    <span className="text-foreground text-sm font-medium">
                      {formatChoiceFieldValue(svc.name)}
                    </span>
                    {svc.service_duration && (
                      <p className="text-muted-foreground text-[11px]">
                        Duration: {svc.service_duration}
                      </p>
                    )}
                  </div>
                  <span className="text-foreground text-sm font-semibold">
                    ${svc.price ?? "0.00"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-foreground text-sm font-semibold">
                Products ({productsCount})
              </h4>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0"
                type="button"
              >
                <Edit size={14} />
              </Button>
            </div>
            {productsCount === 0 ? (
              <p className="text-muted-foreground text-xs">
                No products added to this booking.
              </p>
            ) : (
              <div className="space-y-1 rounded-lg border p-3">
                {products.map((prod, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-1 first:pt-0 last:pb-0"
                  >
                    <span className="text-foreground text-sm font-medium">
                      {formatChoiceFieldValue(prod.name)}
                    </span>
                    <span className="text-foreground text-sm font-semibold">
                      ${prod.price ?? "0.00"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Separator />

        <div>
          <div className="space-y-2">
            <h4 className="text-foreground text-sm font-semibold">
              Pricing Summary
            </h4>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Services Total</span>
                <span className="text-foreground">${servicesTotal}</span>
              </div>
              {productsCount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Products Total</span>
                  <span className="text-foreground">${productsTotal}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-base">
                <span className="text-foreground font-semibold">
                  Grand Total
                </span>
                <span className="text-foreground font-bold">${grandTotal}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="text-foreground mb-2 text-sm font-semibold">Notes:</h4>
          <p className="text-muted-foreground text-xs">
            {selectedAppointment.notes || "No notes added for this booking."}
          </p>
        </div>
      </div>
    );
  };

  const title = selectedAppointment?.service || "Appointment details";

  // Convert selectedAppointment to booking data format for the dialog
  const bookingDataForDialog = selectedAppointment
    ? {
        uid: selectedAppointment.id,
        booking_date: selectedAppointment.bookingDate,
        booking_time: selectedAppointment.startTime,
        booking_duration: selectedAppointment.bookingDuration,
        notes: selectedAppointment.notes,
        services: selectedAppointment.services,
        products: selectedAppointment.products,
      }
    : null;

  return (
    <>
      {/* Desktop sidebar */}
      <div className="bg-card hidden max-h-[600px] overflow-hidden lg:flex lg:flex-col">
        <div className="flex-shrink-0 border-b px-6 py-3">
          <div className="mb-3 flex items-start justify-between">
            <h3 className="text-foreground text-base font-semibold">{title}</h3>
          </div>
          {selectedAppointment && effectiveStatus && (
            <div className="flex items-center gap-2">
              <div className={statusClasses}>
                <div className={cn("h-2 w-2 rounded-full bg-white")} />
                <span className="text-xs font-medium capitalize">
                  {(effectiveStatus || "").replace("-", " ")}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0"
                  type="button"
                >
                  <Edit size={14} />
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="ml-auto text-xs font-semibold uppercase"
              >
                Checkout
              </Button>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {renderContent()}
        </div>
      </div>

      {/* Mobile sheet */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
          <SheetContent side="bottom" className="h-[85vh] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>{title}</SheetTitle>
            </SheetHeader>
            <div className="flex h-full flex-col">
              <div className="border-b px-4 py-3">
                <div className="mb-3 flex items-start justify-start">
                  <h3 className="text-foreground text-base font-semibold">
                    {title}
                  </h3>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4">
                {renderContent()}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Edit Booking Dialog */}
      {bookingDataForDialog && (
        <EditBookingTimeAndDateDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          bookingData={bookingDataForDialog as any} // eslint-disable-line @typescript-eslint/no-explicit-any
        />
      )}
    </>
  );
};

export default IndividualAppointmentDetailsPanel;
