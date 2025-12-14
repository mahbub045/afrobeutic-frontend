import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useDeleteServiceMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/Services/ServicesApi";
import { DeleteServiceDialogProps } from "@/Types/ClientPanel/ManageSalonTypes/ServicesTypes/ServicesType";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const DeleteServiceDialog: React.FC<DeleteServiceDialogProps> = ({
  selectedService,
  isOpen,
  onClose,
}) => {
  const { salonuid } = useParams();
  const { resolvedTheme } = useTheme();
  const [deleteService, { isLoading }] = useDeleteServiceMutation();

  const handleDelete = async () => {
    try {
      await deleteService({
        salonUid: salonuid,
        serviceUid: selectedService?.uid,
      }).unwrap();
      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Deleted!",
        html: `The service <b class="text-danger">${selectedService?.name}</b> has been successfully deleted.`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 2000,
      });
      onClose();
    } catch (error) {
      console.error("Failed to delete service:", error);
      toast.error("Failed to delete service. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="shadow dark:shadow-gray-600">
        <DialogHeader>
          <DialogTitle className="text-danger">Delete Service</DialogTitle>
        </DialogHeader>
        <div>
          Are you sure you want to delete this{" "}
          <b className="text-danger">{selectedService?.name}</b> service? This
          action cannot be undone.
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteServiceDialog;
