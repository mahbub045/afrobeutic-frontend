import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useDeleteServicesMutation } from "@/Redux/Reducers/ClientPanel/Services/ServicesApi";
import { ServiceProps } from "@/Types/ClientPanel/ServicesTypes/ServicesType";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";

export interface DeleteServiceDialogProps {
  selectedService: ServiceProps;
  isOpen: boolean;
  onClose: () => void;
}

const DeleteServiceDialog: React.FC<DeleteServiceDialogProps> = ({
  selectedService,
  isOpen,
  onClose,
}) => {
  const { salonuid } = useParams();
  const [deleteService, { isLoading }] = useDeleteServicesMutation();

  const handleDelete = async () => {
    try {
      await deleteService({
        salonUid: salonuid,
        serviceUid: selectedService?.uid,
      }).unwrap();
      toast.success("Service deleted successfully");
      onClose();
    } catch (error) {
      console.error("Failed to delete service:", error);
      toast.error("Failed to delete service. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Service</DialogTitle>
        </DialogHeader>
        <div>
          Are you sure you want to delete this{" "}
          <b className="text-danger">{selectedService?.name}</b> service? This
          action cannot be undone.
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteServiceDialog;
