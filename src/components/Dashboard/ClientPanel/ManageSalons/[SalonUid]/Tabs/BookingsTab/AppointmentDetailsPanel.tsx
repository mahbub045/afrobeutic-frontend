"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn, formatChoiceFieldValue, getCurrencySymbol } from "@/lib/utils";
import { useViewReceiptMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/Bookings/ViewReceiptApi";
import type {
  Appointment,
  Booking,
} from "@/Types/ClientPanel/ManageSalonTypes/BookingsTypes/BookingsTypes";
import { Calendar as CalendarIcon, Edit, LoaderPinwheel } from "lucide-react";
import { useParams } from "next/navigation";
import { SetStateAction, useState, type Dispatch } from "react";
import { toast } from "sonner";
import EditBookingCheckoutDialog from "./Dialogs/EditBookingCheckoutDialog";
import EditBookingEmployeeDialog from "./Dialogs/EditBookingEmployeeDialog";
import EditBookingProductsDialog from "./Dialogs/EditBookingProductsDialog";
import EditBookingServicesDialog from "./Dialogs/EditBookingServicesDialog";

interface AppointmentDetailsPanelProps {
  serviceTitle: string;
  selectedAppointment: Appointment | null;
  effectiveStatus?:
    | "placed"
    | "confirmed"
    | "in-progress"
    | "rescheduled"
    | "completed"
    | "cancelled"
    | "no-show";
  isCancelled: boolean;
  cancellationReason?: string;
  isDetailsOpen: boolean;
  setIsDetailsOpen: Dispatch<SetStateAction<boolean>>;
  isSingleBookingLoading: boolean;
  singleBookingData?: Booking | null;
  appointmentDateLabel: string;
  onOpenEdit: (open: boolean) => void;
  onOpenEditStatus: (open: boolean) => void;
}

const AppointmentDetailsPanel: React.FC<AppointmentDetailsPanelProps> = ({
  serviceTitle,
  selectedAppointment,
  effectiveStatus,
  isCancelled,
  cancellationReason,
  isDetailsOpen,
  setIsDetailsOpen,
  isSingleBookingLoading,
  singleBookingData,
  appointmentDateLabel,
  onOpenEdit,
  onOpenEditStatus,
}) => {
  const { salonuid } = useParams();
  const salonUid = Array.isArray(salonuid) ? salonuid[0] : (salonuid ?? "");

  const [isEditCheckoutOpen, setIsEditCheckoutOpen] = useState(false);
  const [isEditServicesOpen, setIsEditServicesOpen] = useState(false);
  const [isEditProductsOpen, setIsEditProductsOpen] = useState(false);
  const [isEditEmployeeOpen, setIsEditEmployeeOpen] = useState(false);

  const [viewReceipt, { isLoading: isViewReceiptLoading }] =
    useViewReceiptMutation();
  const isStatusEditDisabled = effectiveStatus === "completed";

  const handleViewReceipt = async () => {
    if (!singleBookingData?.uid) {
      toast.error("Booking ID is missing");
      return;
    }

    try {
      const response = await viewReceipt({
        salonUid,
        bookingUid: singleBookingData.uid,
      }).unwrap();

      if (typeof window === "undefined") {
        toast.error("Unable to download receipt on server side");
        return;
      }

      const { url, fileName } = response;

      if (!url) {
        toast.error("Failed to create receipt link");
        return;
      }
      const link = document.createElement("a");
      link.href = url;
      link.download =
        fileName || `receipt-${singleBookingData.uid || "booking"}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

      toast.success("Receipt download started");
    } catch (error) {
      console.error("Failed to load receipt:", error);
      toast.error("Failed to load receipt");
    }
  };
  return (
    <>
      {/* Appointment Details Sidebar - Desktop */}
      <div className="bg-card hidden max-h-[600px] overflow-hidden lg:flex lg:flex-col">
        <div className="flex-shrink-0 border-b px-6 py-3">
          <div className="mb-3 flex items-start justify-between">
            <h5 className="text-foreground text-xs font-semibold">
              {serviceTitle}
            </h5>
          </div>
          {selectedAppointment && (
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex items-center gap-2 rounded-full px-3 py-1",
                  effectiveStatus === "placed" &&
                    "bg-gradient-to-r from-blue-600 to-cyan-600 text-white",
                  effectiveStatus === "in-progress" &&
                    "bg-gradient-to-r from-amber-600 to-orange-600 text-white",
                  effectiveStatus === "rescheduled" &&
                    "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
                  effectiveStatus === "confirmed" &&
                    "bg-gradient-to-r from-cyan-600 to-emerald-600 text-white",
                  effectiveStatus === "completed" &&
                    "bg-gradient-to-r from-emerald-600 to-teal-600 text-white",
                  effectiveStatus === "cancelled" &&
                    "bg-gradient-to-r from-red-400 to-rose-600 text-white",
                  effectiveStatus === "no-show" &&
                    "bg-gradient-to-r from-slate-500 to-slate-700 text-white",
                )}
              >
                <div className={cn("h-2 w-2 rounded-full bg-white")} />
                <span className="text-xs font-medium capitalize">
                  {(effectiveStatus || "").replace("-", " ")}
                </span>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0"
                  disabled={isStatusEditDisabled}
                  onClick={() => onOpenEditStatus(true)}
                >
                  <Edit size={14} />
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto text-xs font-semibold uppercase"
                onClick={() => setIsEditCheckoutOpen(true)}
              >
                Checkout
              </Button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {selectedAppointment ? (
            isSingleBookingLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoaderPinwheel className="text-primary h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 text-sm">
                    <span className="text-muted-foreground mt-0.5 text-xs">
                      On
                    </span>
                    <span className="text-foreground font-medium">
                      {appointmentDateLabel}
                    </span>
                  </div>
                  <div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onOpenEdit(true)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
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
                        {(singleBookingData?.customer.first_name || "?").charAt(
                          0,
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-foreground text-base font-semibold">
                        {singleBookingData?.customer.first_name ?? "Unknown"}{" "}
                        {singleBookingData?.customer.last_name ?? ""}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        Client
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-foreground text-sm font-semibold">
                      Services ({singleBookingData?.total_services ?? 0})
                    </h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 p-0"
                      onClick={() => setIsEditServicesOpen(true)}
                    >
                      <Edit size={14} />
                    </Button>
                  </div>
                  {(singleBookingData?.services || []).map((service) => (
                    <div
                      key={service.uid}
                      className="space-y-1 rounded-lg border p-3"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-foreground text-sm font-medium">
                          {service.name}
                        </span>
                        <span className="text-primary text-sm font-semibold">
                          {getCurrencySymbol()}
                          {service.discount_price}
                        </span>
                      </div>
                      <div className="text-muted-foreground text-xs">
                        Price: {getCurrencySymbol()}
                        {service.price} {"->"} Discount:{" "}
                        {service.discount_percentage}% {"->"}{" "}
                        <span className="text-primary">
                          Final: {getCurrencySymbol()}
                          {service.discount_price}
                        </span>
                      </div>
                      {service.description && (
                        <p className="text-muted-foreground mt-1 text-xs">
                          {service.description}
                        </p>
                      )}
                    </div>
                  ))}
                  <div className="text-primary flex items-center justify-between gap-3 pt-2 text-sm">
                    <span>
                      with{" "}
                      {(
                        singleBookingData as unknown as {
                          employee?: { name?: string };
                        }
                      )?.employee?.name || selectedAppointment.staff}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 p-0"
                      onClick={() => setIsEditEmployeeOpen(true)}
                    >
                      <Edit size={12} />
                    </Button>
                  </div>
                </div>

                <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-foreground text-sm font-semibold">
                        Products ({singleBookingData?.total_products ?? 0})
                      </h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0"
                        onClick={() => setIsEditProductsOpen(true)}
                      >
                        <Edit size={14} />
                      </Button>
                    </div>
                    {(singleBookingData?.products || []).map((product) => (
                      <div
                        key={product.uid}
                        className="space-y-1 rounded-lg border p-3"
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-foreground text-sm font-medium">
                            {product.name}
                          </span>
                          <span className="text-primary text-sm font-semibold">
                            {getCurrencySymbol()}
                            {product.price}
                          </span>
                        </div>
                        {product.description && (
                          <p className="text-muted-foreground mt-1 text-xs">
                            {product.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </>

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
                        {getCurrencySymbol()}
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
                        <small className="text-[10px]">(After Discount)</small>
                      </span>
                      <span className="text-foreground">
                        {getCurrencySymbol()}
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
                            {getCurrencySymbol()}
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
                    <Separator />

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Price</span>
                      <del className="text-muted-foreground font-medium">
                        {getCurrencySymbol()}
                        {(singleBookingData?.total_price ?? 0).toFixed(2)}
                      </del>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tips</span>
                      <span className="text-foreground font-medium">
                        {getCurrencySymbol()}
                        {singleBookingData?.tips_amount ?? 0}
                      </span>
                    </div>
                    <Separator />

                    <div className="flex items-center justify-between text-base">
                      <span className="text-foreground font-semibold">
                        Final Price
                      </span>
                      <span className="text-foreground font-bold">
                        {getCurrencySymbol()}
                        {(singleBookingData?.final_price ?? 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="mt-1.5 px-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Payment Type</span>
                    <Badge variant="secondary">
                      {formatChoiceFieldValue(
                        singleBookingData?.payment_type,
                      ) ?? "Not Specified"}
                    </Badge>
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
                <div>
                  {selectedAppointment.status === "completed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full shadow dark:shadow-gray-600"
                      onClick={handleViewReceipt}
                      disabled={isViewReceiptLoading}
                    >
                      {isViewReceiptLoading
                        ? "Loading Receipt..."
                        : "Download Receipt"}
                    </Button>
                  )}
                </div>
              </div>
            )
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
              <SheetTitle>{serviceTitle}</SheetTitle>
            </SheetHeader>
            <div className="flex h-full flex-col">
              <div className="border-b px-4 py-3">
                <div className="mb-3 flex items-start justify-start gap-4">
                  <h3 className="text-foreground text-xs font-semibold">
                    {serviceTitle}
                  </h3>
                </div>
                {selectedAppointment && (
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
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
                      )}
                    >
                      <div className={cn("h-2 w-2 rounded-full bg-white")} />
                      <span className="text-xs font-medium capitalize">
                        {(effectiveStatus || "").replace("-", " ")}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0"
                        disabled={isStatusEditDisabled}
                        onClick={() => onOpenEditStatus(true)}
                      >
                        <Edit size={14} />
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-auto text-xs font-semibold uppercase"
                      onClick={() => setIsEditCheckoutOpen(true)}
                    >
                      Checkout
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4">
                {selectedAppointment ? (
                  isSingleBookingLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <LoaderPinwheel className="text-primary h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 text-sm">
                          <span className="text-muted-foreground mt-0.5 text-xs">
                            On
                          </span>
                          <span className="text-foreground font-medium">
                            {appointmentDateLabel}
                          </span>
                        </div>
                        <div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onOpenEdit(true)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
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
                                singleBookingData?.customer?.first_name || "?"
                              ).charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="text-foreground text-base font-semibold">
                              {`${singleBookingData?.customer?.first_name || ""} ${singleBookingData?.customer?.last_name || ""}`.trim() ||
                                "Unknown"}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              Client
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-foreground text-sm font-semibold">
                            Services ({singleBookingData?.total_services ?? 0})
                          </h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 p-0"
                            onClick={() => setIsEditServicesOpen(true)}
                          >
                            <Edit size={14} />
                          </Button>
                        </div>
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
                              Price: ${service.price} {"->"} Discount:{" "}
                              {service.discount_percentage}% {"->"}{" "}
                              <span className="text-primary">
                                Final: ${service.discount_price}
                              </span>
                            </div>
                            {service.description && (
                              <p className="text-muted-foreground mt-1 text-xs">
                                {service.description}
                              </p>
                            )}
                          </div>
                        ))}
                        <div className="text-primary flex items-center justify-between gap-3 pt-2 text-sm">
                          <span>
                            with{" "}
                            {(
                              singleBookingData as unknown as {
                                employee?: { name?: string };
                              }
                            )?.employee?.name || selectedAppointment.staff}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 p-0"
                            onClick={() => setIsEditEmployeeOpen(true)}
                          >
                            <Edit size={12} />
                          </Button>
                        </div>
                      </div>

                      <>
                        <Separator />
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-foreground text-sm font-semibold">
                              Products ({singleBookingData?.total_products ?? 0}
                              )
                            </h4>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 p-0"
                              onClick={() => setIsEditProductsOpen(true)}
                            >
                              <Edit size={14} />
                            </Button>
                          </div>
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
                                  <span className="text-primary text-sm font-semibold">
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
                          {(singleBookingData?.products || []).length > 0 && (
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
                          <Separator />
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Total Price
                            </span>
                            <del className="text-muted-foreground font-medium">
                              $
                              {(singleBookingData?.total_price ?? 0).toFixed(2)}
                            </del>
                          </div>
                          <Separator />

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Tips</span>
                            <span className="text-foreground font-medium">
                              ${singleBookingData?.tips_amount ?? 0}
                            </span>
                          </div>
                          <Separator />

                          <div className="flex items-center justify-between text-base">
                            <span className="text-foreground font-semibold">
                              Final Price
                            </span>
                            <span className="text-foreground font-bold">
                              $
                              {(singleBookingData?.final_price ?? 0).toFixed(2)}
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
                      <div>
                        {selectedAppointment.status === "completed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full shadow dark:shadow-gray-600"
                            onClick={handleViewReceipt}
                            disabled={isViewReceiptLoading}
                          >
                            {isViewReceiptLoading
                              ? "Loading Receipt..."
                              : "Download Receipt"}
                          </Button>
                        )}
                      </div>
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
      <EditBookingCheckoutDialog
        isOpen={isEditCheckoutOpen}
        onOpenChange={setIsEditCheckoutOpen}
        bookingData={singleBookingData}
      />
      <EditBookingServicesDialog
        isOpen={isEditServicesOpen}
        onOpenChange={setIsEditServicesOpen}
        bookingData={singleBookingData}
      />
      <EditBookingProductsDialog
        isOpen={isEditProductsOpen}
        onOpenChange={setIsEditProductsOpen}
        bookingData={singleBookingData}
      />
      <EditBookingEmployeeDialog
        isOpen={isEditEmployeeOpen}
        onOpenChange={setIsEditEmployeeOpen}
        bookingData={singleBookingData}
      />
    </>
  );
};

export default AppointmentDetailsPanel;
