import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { useEditBookingMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/Bookings/BookingsApi";

export interface EditBookingDialogProps {
  // Define any props needed for the dialog here
  isOpen: boolean;
  onClose: () => void;
}

const EditBookingDialog: React.FC<EditBookingDialogProps> = ({
  isOpen,
  onClose,
}) => {
  // RTK hooks
  const [editBooking, { isLoading }] = useEditBookingMutation();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader className="text-primary">Edit Booking</DialogHeader>
        <DialogDescription>
          Please edit the booking details below.
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default EditBookingDialog;
