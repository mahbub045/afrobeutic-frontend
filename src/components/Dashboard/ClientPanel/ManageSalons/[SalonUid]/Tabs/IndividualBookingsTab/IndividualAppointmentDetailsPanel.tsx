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
import { cn, formatChoiceFieldValue, getCurrencySymbol } from "@/lib/utils";
import { useViewReceiptMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/Bookings/ViewReceiptApi";
import type {
  BookingProduct,
  BookingService,
} from "@/Types/ClientPanel/ManageSalonTypes/BookingsTypes/BookingsTypes";
import {
  IndBookingUiStatus,
  IndividualAppointmentDetailsPanelProps,
} from "@/Types/ClientPanel/ManageSalonTypes/IndividualBookingTypes/IndividualBookingTypes";
import { Calendar as CalendarIcon, Edit } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import EditBookingCheckoutDialog from "./Dialogs/EditBookingCheckoutDialog";
import EditBookingProductsDialog from "./Dialogs/EditBookingProductsDialog";
import EditBookingServicesDialog from "./Dialogs/EditBookingServicesDialog";
import EditBookingStatusDialog from "./Dialogs/EditBookingStatusDialog";
import EditBookingTimeAndDateDialog from "./Dialogs/EditBookingTimeAndDateDialog";

const IndividualAppointmentDetailsPanel: React.FC<
  IndividualAppointmentDetailsPanelProps
> = ({
  selectedAppointment,
  dateLabel,
  isOpen,
  onOpenChange,
  isCancelled,
  cancellationReason,
  onStatusUpdated,
  onDateTimeUpdated,
  onServicesUpdated,
  onProductsUpdated,
  onCheckoutUpdated,
}) => {
  const { salonuid } = useParams();
  const salonUid = Array.isArray(salonuid) ? salonuid[0] : (salonuid ?? "");

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isServicesDialogOpen, setIsServicesDialogOpen] = useState(false);
  const [isProductsDialogOpen, setIsProductsDialogOpen] = useState(false);
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [viewReceipt, { isLoading: isViewReceiptLoading }] =
    useViewReceiptMutation();
  const effectiveStatus: IndBookingUiStatus | undefined =
    selectedAppointment?.status;
  const isStatusEditDisabled = effectiveStatus === "completed";
  const selectedServiceNames =
    selectedAppointment?.services
      ?.map((service) => formatChoiceFieldValue(service.name)?.trim())
      .filter((serviceName): serviceName is string => Boolean(serviceName)) ??
    [];

  const handleViewReceipt = async () => {
    if (!selectedAppointment?.id) {
      toast.error("Booking ID is missing");
      return;
    }

    try {
      const response = await viewReceipt({
        salonUid,
        bookingUid: selectedAppointment.id,
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
      link.download = fileName || `receipt-${selectedAppointment.id}.pdf`;

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

  const statusClasses = cn(
    "flex items-center gap-2 rounded-full px-3 py-1",
    effectiveStatus === "confirmed" &&
      "bg-gradient-to-r from-cyan-600 to-emerald-600 text-white",
    effectiveStatus === "in-progress" &&
      "bg-gradient-to-r from-amber-600 to-orange-600 text-white",
    effectiveStatus === "rescheduled" &&
      "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
    effectiveStatus === "completed" &&
      "bg-gradient-to-r from-emerald-600 to-teal-600 text-white",
    effectiveStatus === "cancelled" &&
      "bg-gradient-to-r from-red-400 to-rose-600 text-white",
    effectiveStatus === "no-show" &&
      "bg-gradient-to-r from-slate-500 to-slate-700 text-white",
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

    // Helpers for safely handling numeric values that may be strings or undefined
    const getNumber = (value?: string | number) => {
      const num = Number(value ?? 0);
      return Number.isNaN(num) ? 0 : num;
    };

    const format = (n: number) => n.toFixed(2);

    // Prefer pre-computed totals from the API, but fall back to
    // computing from the services/products arrays when needed.
    const rawServicesTotalPrice =
      selectedAppointment.total_services_price ??
      selectedAppointment.totalServicesPrice;
    const servicesTotalOriginal =
      rawServicesTotalPrice !== undefined
        ? getNumber(rawServicesTotalPrice)
        : services.reduce((sum, svc) => sum + getNumber(svc.price), 0);

    const rawServicesDiscountTotal =
      selectedAppointment.services_discount_price ??
      selectedAppointment.servicesDiscountPrice;
    const servicesTotalAfterDiscount =
      rawServicesDiscountTotal !== undefined
        ? getNumber(rawServicesDiscountTotal)
        : servicesTotalOriginal;

    const rawProductsTotalPrice =
      selectedAppointment.total_products_price ??
      selectedAppointment.totalProductsPrice;
    const productsTotal =
      rawProductsTotalPrice !== undefined
        ? getNumber(rawProductsTotalPrice)
        : products.reduce((sum, prod) => sum + getNumber(prod.price), 0);

    const rawTips =
      selectedAppointment.tips_amount ?? selectedAppointment.tipsAmount;
    const tipsTotal = getNumber(rawTips);

    const rawTotalPrice =
      selectedAppointment.total_price ?? selectedAppointment.total_rice;
    const totalPrice =
      rawTotalPrice !== undefined
        ? getNumber(rawTotalPrice)
        : servicesTotalAfterDiscount + productsTotal;

    const rawFinalPrice =
      selectedAppointment.final_price ?? selectedAppointment.finalPrice;
    const finalPrice =
      rawFinalPrice !== undefined
        ? getNumber(rawFinalPrice)
        : totalPrice + tipsTotal;

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
              <div className="text-muted-foreground text-xs">Customer</div>
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
              onClick={() => setIsServicesDialogOpen(true)}
            >
              <Edit size={14} />
            </Button>
          </div>
          {servicesCount === 0 ? (
            <p className="text-muted-foreground text-xs">
              Services not selected yet.
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
                    {getCurrencySymbol()}
                    {svc.price ?? "0.00"}
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
                onClick={() => setIsProductsDialogOpen(true)}
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
                      {getCurrencySymbol()}
                      {prod.price ?? "0.00"}
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
              {/* Services total - show original and discounted when applicable */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Services Total</span>
                <div className="text-right">
                  <div>
                    <div className="text-muted-foreground text-sm line-through">
                      {getCurrencySymbol()}
                      {format(servicesTotalOriginal)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Services Total (After Discount)
                </span>
                <span className="text-foreground">
                  {getCurrencySymbol()}
                  {format(servicesTotalAfterDiscount)}
                </span>
              </div>

              {/* Products */}
              {productsCount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Products Total</span>
                  <span className="text-foreground">
                    {getCurrencySymbol()}
                    {format(productsTotal)}
                  </span>
                </div>
              )}

              <Separator />

              {/* Total Price (pre-final) - may be struck through if final differs */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Price</span>
                <div>
                  <div className="text-muted-foreground line-through">
                    {getCurrencySymbol()}
                    {format(totalPrice)}
                  </div>
                </div>
              </div>
              <Separator />

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tips</span>
                <span className="text-foreground">
                  {getCurrencySymbol()}
                  {format(tipsTotal)}
                </span>
              </div>

              <Separator />

              {/* Final price */}
              <div className="flex items-center justify-between text-base">
                <span className="text-foreground font-semibold">
                  Final Price
                </span>
                <span className="text-foreground font-bold">
                  {getCurrencySymbol()}
                  {format(finalPrice)}
                </span>
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

        {isCancelled && (
          <>
            <Separator />
            <div>
              <h4 className="text-foreground mb-2 text-sm font-semibold">
                Cancellation Reason:
              </h4>
              {cancellationReason ? (
                <p className="text-foreground text-xs">{cancellationReason}</p>
              ) : (
                <p className="text-muted-foreground text-xs">
                  No cancellation reason provided.
                </p>
              )}
            </div>
          </>
        )}

        {selectedAppointment.status === "completed" && (
          <div>
            <Separator />
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full shadow dark:shadow-gray-600"
              onClick={handleViewReceipt}
              disabled={isViewReceiptLoading}
              type="button"
            >
              {isViewReceiptLoading ? "Loading Receipt..." : "Download Receipt"}
            </Button>
          </div>
        )}
      </div>
    );
  };

  const title =
    selectedServiceNames.length > 0
      ? selectedServiceNames.join(", ")
      : "Services not selected yet";

  // Convert selectedAppointment to booking data format for the dialog
  const bookingDataForDialog = selectedAppointment
    ? {
        uid: selectedAppointment.id,
        booking_date: selectedAppointment.bookingDate,
        booking_time: selectedAppointment.startTime,
        booking_duration: selectedAppointment.bookingDuration || null,
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
            <h5 className="text-foreground text-xs font-semibold">{title}</h5>
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
                  disabled={isStatusEditDisabled}
                  onClick={() => setIsStatusDialogOpen(true)}
                >
                  <Edit size={14} />
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="ml-auto text-xs font-semibold uppercase"
                onClick={() => setIsCheckoutDialogOpen(true)}
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
                <div className="mb-1 flex items-start justify-start">
                  <h5 className="text-foreground text-xs font-semibold">
                    {title}
                  </h5>
                </div>
                {selectedAppointment && effectiveStatus && (
                  <div className="mt-1 flex items-center gap-2">
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
                        disabled={isStatusEditDisabled}
                        onClick={() => setIsStatusDialogOpen(true)}
                      >
                        <Edit size={14} />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="ml-auto text-xs font-semibold uppercase"
                      onClick={() => setIsCheckoutDialogOpen(true)}
                    >
                      Checkout
                    </Button>
                  </div>
                )}
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
          onDateTimeUpdated={(data) => {
            onDateTimeUpdated?.(data);
          }}
        />
      )}

      {/* Edit Booking Services Dialog */}
      {selectedAppointment && (
        <EditBookingServicesDialog
          isOpen={isServicesDialogOpen}
          onOpenChange={setIsServicesDialogOpen}
          bookingData={{
            uid: selectedAppointment.id,
            services: (selectedAppointment.services ??
              []) as unknown as BookingService[],
          }}
          onServicesUpdated={(services) => {
            onServicesUpdated?.(
              services.map((svc) => ({
                uid: svc.uid,
                name: svc.name,
                price: svc.price,
                service_duration: svc.service_duration,
              })),
            );
          }}
        />
      )}

      {/* Edit Booking Products Dialog */}
      {selectedAppointment && (
        <EditBookingProductsDialog
          isOpen={isProductsDialogOpen}
          onOpenChange={setIsProductsDialogOpen}
          bookingData={{
            uid: selectedAppointment.id,
            products: (selectedAppointment.products ??
              []) as unknown as BookingProduct[],
          }}
          onProductsUpdated={(products) => {
            onProductsUpdated?.(
              products.map((prod) => ({
                uid: prod.uid,
                name: prod.name,
                price: prod.price,
              })),
            );
          }}
        />
      )}

      {/* Checkout Dialog */}
      {selectedAppointment && (
        <EditBookingCheckoutDialog
          isOpen={isCheckoutDialogOpen}
          onOpenChange={setIsCheckoutDialogOpen}
          bookingData={{
            uid: selectedAppointment.id,
            final_price: selectedAppointment.finalPrice,
            tips_amount: selectedAppointment.tipsAmount,
            payment_type: selectedAppointment.paymentType,
          }}
          onStatusUpdated={(newStatus) => {
            onStatusUpdated?.(newStatus);
          }}
          onCheckoutUpdated={(data) => {
            onCheckoutUpdated?.(data);
          }}
        />
      )}

      {/* Edit Booking Status Dialog */}
      {selectedAppointment && (
        <EditBookingStatusDialog
          isOpen={isStatusDialogOpen}
          onClose={() => setIsStatusDialogOpen(false)}
          bookingData={{
            uid: selectedAppointment.id,
            status: selectedAppointment.status
              .toUpperCase()
              .replace("-", "") as string,
          }}
          onStatusUpdated={(newStatus) => {
            onStatusUpdated?.(newStatus);
          }}
        />
      )}
    </>
  );
};

export default IndividualAppointmentDetailsPanel;
