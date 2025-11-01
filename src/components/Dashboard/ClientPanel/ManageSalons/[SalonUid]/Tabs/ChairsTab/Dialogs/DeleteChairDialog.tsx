import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useDeleteChairMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/Chairs/ChairsApi";
import { ChairDialogsProps } from "@/Types/ClientPanel/ManageSalonTypes/ChairsTypes/ChairsType";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const DeleteChairDialog: React.FC<ChairDialogsProps> = ({
  isOpen,
  onClose,
  selectedChairData,
}) => {
  const { salonuid } = useParams();
  const { resolvedTheme } = useTheme();
  // RTK Hook
  const [deleteChair, { isLoading }] = useDeleteChairMutation();

  const handleDelete = async () => {
    try {
      if (!salonuid) return;

      await deleteChair({
        salonUid: salonuid,
        chairUid: selectedChairData?.uid,
      }).unwrap();
      onClose();
      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Deleted successfully",
        html: `Successfully deleted <b class="text-danger">${selectedChairData?.name}</b> chair.`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 3000,
      });
    } catch (error) {
      console.error("Failed to delete chair:", error);
      toast.error("Failed to delete chair. Please try again.");
    }
    onClose();
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-danger">Delete Chair</DialogTitle>
        </DialogHeader>
        <div>
          Are you sure you want to delete this{" "}
          <b className="text-danger">{selectedChairData?.name}</b> chair? This
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

export default DeleteChairDialog;
