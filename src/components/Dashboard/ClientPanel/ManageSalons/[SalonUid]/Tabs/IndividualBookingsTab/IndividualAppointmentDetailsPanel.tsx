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
    // Dummy values to mimic AppointmentDetailsPanel layout
    const dummyDuration = "00:00:00";
    const dummyEmployeeName = "mahbub test";
    const dummyServicesCount = 0;
    const dummyProductsCount = 0;
    const dummyServicesTotal = "80.00";
    const dummyServicesDiscountTotal = "0.00";
    const dummyProductsTotal = "0.00";
    const dummyTips = "0.00";
    const dummyTotalPrice = "80.00";
    const dummyFinalPrice = "0.00";
    const dummyPaymentType = "NOT_SPECIFIED";
    const isCancelled = effectiveStatus === "cancelled";
    const cancellationReason = isCancelled
      ? "Client cancelled the appointment (dummy)."
      : "";

    return (
      <div className="space-y-5">
        <div className="flex items-start gap-3 text-sm">
          <span className="text-muted-foreground mt-0.5 text-xs">On</span>
          <span className="text-foreground font-medium">{dateLabel}</span>
        </div>

        <div className="item-center flex justify-between">
          <div className="flex items-start gap-3 text-xs">
            <span>At:</span>
            <div className="text-foreground">
              {selectedAppointment.startTime || "N/A"}
            </div>
          </div>
          <div className="text-muted-foreground text-xs">
            Duration: <span className="text-foreground">{dummyDuration}</span>
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
              Services ({dummyServicesCount})
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
          <div className="space-y-1 rounded-lg border p-3">
            <div className="flex items-start justify-between">
              <span className="text-foreground text-sm font-medium">
                {formatChoiceFieldValue(selectedAppointment.service) ||
                  "No Services Specified"}
              </span>
              <span className="text-foreground text-sm font-semibold">
                $0.00
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              with {dummyEmployeeName}
            </p>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-foreground text-sm font-semibold">
                Products ({dummyProductsCount})
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
            {/* No products in dummy view */}
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
                <del className="text-muted-foreground">
                  ${dummyServicesTotal}
                </del>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Services Total{" "}
                  <small className="text-[10px]">(After Discount)</small>
                </span>
                <span className="text-foreground">
                  ${dummyServicesDiscountTotal}
                </span>
              </div>
              {dummyProductsCount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Products Total</span>
                  <span className="text-foreground">${dummyProductsTotal}</span>
                </div>
              )}
              <div className="mt-1.5 border-t pt-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tips</span>
                  <span className="text-muted-foreground font-medium">
                    ${dummyTips}
                  </span>
                </div>
              </div>
              <div className="mt-1.5 border-t pt-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Price</span>
                  <del className="text-muted-foreground font-medium">
                    ${dummyTotalPrice}
                  </del>
                </div>
              </div>
              <div className="flex items-center justify-between text-base">
                <span className="text-foreground font-semibold">
                  Final Price
                </span>
                <span className="text-foreground font-bold">
                  ${dummyFinalPrice}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="mt-1.5 px-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Payment Type</span>
            <span className="text-muted-foreground font-medium">
              {formatChoiceFieldValue(dummyPaymentType) ?? "Not Specified"}
            </span>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="text-foreground mb-2 text-sm font-semibold">Notes:</h4>
          <p className="text-muted-foreground text-xs">
            In a real implementation, this area can show booking notes,
            preferences, or internal comments about the appointment.
          </p>
        </div>

        {isCancelled && (
          <>
            <Separator />
            <div>
              <h4 className="text-foreground mb-2 text-sm font-semibold">
                Cancellation Reason:
              </h4>
              <p className="text-muted-foreground text-xs">
                {cancellationReason || "No cancellation reason provided."}
              </p>
            </div>
          </>
        )}

        {effectiveStatus === "completed" && (
          <Button
            variant="outline"
            size="sm"
            className="w-full shadow dark:shadow-gray-600"
            type="button"
          >
            Download Receipt
          </Button>
        )}
      </div>
    );
  };

  const title = selectedAppointment?.service || "Appointment details";

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
    </>
  );
};

export default IndividualAppointmentDetailsPanel;
