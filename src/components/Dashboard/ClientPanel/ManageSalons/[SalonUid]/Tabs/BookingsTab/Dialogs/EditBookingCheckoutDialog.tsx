import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CommonEditBookingDataProps } from "@/Types/ClientPanel/ManageSalonTypes/BookingsTypes/BookingsTypes";

const EditBookingCheckoutDialog: React.FC<CommonEditBookingDataProps> = ({
  isOpen,
  onOpenChange,
  bookingData,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] !max-w-2xl overflow-y-auto shadow-md">
        <DialogHeader>
          <DialogTitle className="text-primary">Checkout</DialogTitle>
          <DialogDescription>
            Modify checkout details for the booking.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default EditBookingCheckoutDialog;
