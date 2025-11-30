import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatChoiceFieldValue } from "@/lib/utils";
import { SalonBookingsProps } from "@/Types/AdminPanel/AccountsTypes/SalonsTypes/SalonsType";
import Image from "next/image";
import React from "react";

type ViewBookingDetailsDialogProps = {
  booking: SalonBookingsProps;
  onClose: () => void;
};

const FieldRow: React.FC<{ label: string; value?: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="flex gap-4 py-1">
    <div className="text-muted-foreground w-36 text-sm">{label}</div>
    <div className="flex-1 text-sm">{value ?? "-"}</div>
  </div>
);

const ViewBookingDetailsDialog: React.FC<ViewBookingDetailsDialogProps> = ({
  booking,
  onClose,
}) => {
  if (!booking) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] !max-w-xl overflow-y-auto shadow-md sm:!max-w-2xl md:!max-w-3xl dark:shadow-gray-600">
        <DialogHeader>
          <DialogTitle className="text-primary">Booking Details</DialogTitle>
          <DialogDescription>
            Detailed information for booking{" "}
            <strong>{booking.booking_id}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <h4 className="mb-2 text-sm font-semibold">General</h4>
            <div className="rounded-md border p-3">
              <FieldRow label="#" value={booking.uid} />
              <FieldRow label="Booking ID" value={booking.booking_id} />
              <FieldRow label="Date" value={booking.booking_date} />
              <FieldRow label="Time" value={booking.booking_time} />
              <FieldRow
                label="Status"
                value={formatChoiceFieldValue(booking.status) ?? booking.status}
              />
              <FieldRow label="Duration" value={booking.booking_duration} />
              <FieldRow label="Created At" value={booking.created_at} />
              <FieldRow label="Completed At" value={booking.completed_at} />
              <FieldRow label="Cancelled By" value={booking.cancelled_by} />
              <FieldRow
                label="Cancellation Reason"
                value={booking.cancellation_reason || "-"}
              />
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold">Customer</h4>
            <div className="rounded-md border p-3">
              <FieldRow
                label="Name"
                value={
                  booking.customer
                    ? `${booking.customer.first_name ?? ""} ${booking.customer.last_name ?? ""}`.trim()
                    : "-"
                }
              />
              <FieldRow label="Email" value={booking.customer?.email} />
              <FieldRow label="Phone" value={booking.customer?.phone} />
              <FieldRow label="Source" value={booking.customer?.source} />
              <FieldRow label="Customer UID" value={booking.customer?.uid} />
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold">Chair & Employee</h4>
            <div className="rounded-md border p-3">
              <FieldRow label="Chair" value={booking.chair?.name} />
              <FieldRow label="Chair UID" value={booking.chair?.uid} />
              <FieldRow label="Chair Type" value={booking.chair?.type} />
              <FieldRow label="Employee" value={booking.employee?.name} />
              <FieldRow
                label="Employee ID"
                value={booking.employee?.employee_id}
              />
              <FieldRow
                label="Employee Phone"
                value={booking.employee?.phone || "-"}
              />
              <FieldRow
                label="Employee Designation"
                value={booking.employee?.designation || "-"}
              />
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold">Services</h4>
            <div className="rounded-md border p-3">
              {booking.services && booking.services.length > 0 ? (
                <ul className="space-y-2">
                  {booking.services.map((s) => (
                    <>
                      <li
                        key={s.uid}
                        className="bg-secondary/10 flex justify-between rounded-md p-3 shadow-md dark:shadow-gray-600"
                      >
                        <div>
                          <div className="font-medium">{s.name}</div>
                          <div className="text-muted-foreground text-xs">
                            {s.category}
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div>Price: {s.price}</div>
                          <div>Discount: {s.discount_percentage}%</div>
                          <div>Duration: {s.service_duration}</div>
                        </div>
                      </li>
                      {/* <hr /> */}
                    </>
                  ))}
                </ul>
              ) : (
                <div className="text-muted-foreground text-sm">No services</div>
              )}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold">Products</h4>
            <div className="rounded-md border p-3">
              {booking.products && booking.products.length > 0 ? (
                <ul className="space-y-2">
                  {booking.products.map((p) => (
                    <li
                      key={p.uid}
                      className="bg-secondary/10 flex justify-between rounded-md p-3 shadow-md dark:shadow-gray-600"
                    >
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-muted-foreground text-xs">
                          {p.category}
                        </div>
                      </div>
                      <div className="text-sm">Price: {p.price}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-muted-foreground text-sm">No products</div>
              )}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold">Images</h4>
            <div className="rounded-md border p-3">
              {booking.images && booking.images.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {booking.images.map((img, idx) => (
                    <div
                      key={`${img}-${idx}`}
                      className="h-24 w-24 overflow-hidden rounded border"
                    >
                      <Image
                        src={img}
                        alt={`booking-image-${idx}`}
                        width={96}
                        height={96}
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">No images</div>
              )}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold">Notes</h4>
            <div className="rounded-md border p-3 text-sm">
              {booking.notes ? (
                booking.notes
              ) : (
                <span className="text-muted-foreground">No notes</span>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewBookingDetailsDialog;
