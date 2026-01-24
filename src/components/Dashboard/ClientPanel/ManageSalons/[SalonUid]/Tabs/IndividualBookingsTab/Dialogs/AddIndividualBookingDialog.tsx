"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface AddIndividualBookingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddIndividualBookingDialog: React.FC<AddIndividualBookingDialogProps> = ({
  isOpen,
  onOpenChange,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] !max-w-2xl overflow-y-auto shadow-md">
        <DialogHeader>
          <DialogTitle className="text-primary">Add Individual Booking</DialogTitle>
          <DialogDescription>
            Add a new booking to the salon&apos;s schedule.
          </DialogDescription>
        </DialogHeader>
        <div className="text-center text-danger">This Dialog is under construction.</div>
      </DialogContent>
    </Dialog>
  );
};

export default AddIndividualBookingDialog;
