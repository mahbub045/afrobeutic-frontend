import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { baseApi } from "@/Redux/Api/BaseApi";
import { useUpdateIndividualBookingStatusMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/IndividualBookings/IndividualBookingsApi";
import { CommonEditBookingDataProps } from "@/Types/ClientPanel/ManageSalonTypes/BookingsTypes/BookingsTypes";
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import AddLookBookImageDialog from "./AddLookBookImageDialog";

const PAYMENT_TYPES = [
  { value: "FRONT_DESK", label: "Front Desk" },
  { value: "SELF_CHECKOUT", label: "Self Checkout" },
  { value: "CREDIT_CARD", label: "Credit Card" },
  { value: "CASH", label: "Cash" },
  { value: "CHECK", label: "Check" },
  { value: "GIFT_CARD", label: "Gift Card" },
  { value: "VENMO", label: "Venmo" },
  { value: "OTHER", label: "Other" },
];

const ACTIVE_PAYMENT_TYPE = "CASH";

const EditBookingCheckoutDialog: React.FC<CommonEditBookingDataProps> = ({
  isOpen,
  onOpenChange,
  bookingData,
  onStatusUpdated,
  onCheckoutUpdated,
}) => {
  const { salonuid } = useParams();
  const salonUid = Array.isArray(salonuid) ? salonuid[0] : (salonuid ?? "");
  const { resolvedTheme } = useTheme();
  const dispatch = useDispatch();

  const [tipsAmount, setTipsAmount] = useState<string>("");
  const [paymentType, setPaymentType] = useState<string>("");
  const [showImageDialog, setShowImageDialog] = useState(false);

  const [editBooking, { isLoading }] =
    useUpdateIndividualBookingStatusMutation();

  useEffect(() => {
    if (bookingData) {
      setTipsAmount(bookingData.tips_amount?.toString() || "");
      setPaymentType(
        bookingData.payment_type === ACTIVE_PAYMENT_TYPE
          ? bookingData.payment_type
          : ACTIVE_PAYMENT_TYPE,
      );
    }
  }, [bookingData]);

  const handleSave = async () => {
    if (!bookingData) return;

    try {
      const updatedTipsAmount = parseFloat(tipsAmount) || 0;

      await editBooking({
        salonUid,
        bookingUid: bookingData.uid,
        data: {
          tips_amount: updatedTipsAmount,
          payment_type: paymentType,
          status: "COMPLETED",
        },
      }).unwrap();

      if (bookingData.uid) {
        onStatusUpdated?.("COMPLETED");
        onCheckoutUpdated?.({
          tips_amount: updatedTipsAmount,
          payment_type: paymentType,
        });
      }

      try {
        dispatch(baseApi.util.invalidateTags(["IndividualBookings"]));
      } catch (e) {
        console.warn(e);
      }

      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Checkout updated",
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 2000,
      });

      // Close checkout dialog and open image dialog
      onOpenChange(false);
      setShowImageDialog(true);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Failed to update checkout details" });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[80vh] !max-w-xl overflow-y-auto shadow-md">
          <DialogHeader>
            <DialogTitle className="text-primary">Checkout</DialogTitle>
            <DialogDescription>
              Modify checkout details for the booking.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Tips Amount */}
            <div className="space-y-2">
              <Label htmlFor="tips-amount">Tips Amount</Label>
              <Input
                id="tips-amount"
                type="number"
                placeholder="Enter tips amount"
                value={tipsAmount}
                onChange={(e) => setTipsAmount(e.target.value)}
                step="0.01"
                min="0"
              />
            </div>

            {/* Summary */}
            <div className="bg-muted space-y-1 rounded-lg border p-3">
              <div className="flex justify-between text-sm">
                <span>Final Price:</span>
                <span className="font-medium">
                  $
                  {bookingData?.final_price !== undefined
                    ? bookingData.final_price.toFixed(2)
                    : "0.00"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tips:</span>
                <span className="font-medium">
                  ${parseFloat(tipsAmount || "0").toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 text-base">
                <span className="font-semibold">Total:</span>
                <span className="text-primary font-semibold">
                  $
                  {(
                    (bookingData?.final_price || 0) +
                    parseFloat(tipsAmount || "0")
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Type */}
            <div className="space-y-2">
              <Label>Payment Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() =>
                      type.value === ACTIVE_PAYMENT_TYPE &&
                      setPaymentType(type.value)
                    }
                    disabled={type.value !== ACTIVE_PAYMENT_TYPE}
                    className={`rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                      paymentType === type.value
                        ? "bg-primary text-white shadow-md"
                        : type.value !== ACTIVE_PAYMENT_TYPE
                          ? "cursor-not-allowed bg-slate-100 text-gray-400 opacity-60 dark:bg-slate-800 dark:text-gray-500"
                          : "bg-slate-200 text-gray-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Watting..." : "Checkout"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Upload Dialog */}
      <AddLookBookImageDialog
        isOpen={showImageDialog}
        onOpenChange={setShowImageDialog}
        bookingUid={bookingData?.uid}
      />
    </>
  );
};

export default EditBookingCheckoutDialog;
