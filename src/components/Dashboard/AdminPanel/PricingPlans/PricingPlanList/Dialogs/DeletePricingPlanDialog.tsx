import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeletePricingPlanMutation } from "@/Redux/Reducers/AdminPanel/PricingPlans/PricingPlansApi";
import { DeletePricingPlanDialogProps } from "@/Types/AdminPanel/PricingPlansTypes/PricingPlansTypes";
import { useTheme } from "next-themes";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const DeletePricingPlanDialog: React.FC<DeletePricingPlanDialogProps> = ({
  isOpen,
  onClose,
  pricingPlanData,
}) => {
  const { resolvedTheme } = useTheme();
  const [deletePricingPlan, { isLoading: isDeleting }] =
    useDeletePricingPlanMutation();

  const handleDelete = async () => {
    if (!pricingPlanData) return;

    try {
      await deletePricingPlan({ uid: pricingPlanData.uid }).unwrap();

      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Deleted!",
        html: `Pricing plan <b>${pricingPlanData.name}</b> has been deleted.`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 2000,
      });

      onClose();
    } catch (error) {
      console.error("Failed to delete pricing plan:", error);
      toast.error("Failed to delete pricing plan. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="shadow-md dark:shadow-gray-600">
        <DialogHeader>
          <DialogTitle className="text-danger">Delete Pricing Plan</DialogTitle>
          <DialogDescription className="text-xs">
            Are you sure you want to delete{" "}
            <b className="text-danger">{pricingPlanData?.name}</b>?
            <span className="text-muted-foreground mt-2 block text-xs">
              This action cannot be undone.
            </span>
          </DialogDescription>

          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="danger"
              className="text-white"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default DeletePricingPlanDialog;
