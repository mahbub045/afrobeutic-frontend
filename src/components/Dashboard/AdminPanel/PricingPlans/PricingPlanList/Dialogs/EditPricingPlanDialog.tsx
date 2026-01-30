import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEditPricingPlanMutation } from "@/Redux/Reducers/AdminPanel/PricingPlans/PricingPlansApi";
import { EditPricingPlanDialogProps } from "@/Types/AdminPanel/PricingPlansTypes/PricingPlansTypes";
import { useTheme } from "next-themes";

const EditPricingPlanDialog: React.FC<EditPricingPlanDialogProps> = ({
  isOpen,
  onClose,
  pricingPlanData,
}) => {
  const { resolvedTheme } = useTheme();
  const [editPricingPlan, { isLoading }] = useEditPricingPlanMutation();
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto shadow-md dark:shadow-gray-600">
        <DialogHeader>
          <DialogTitle className="text-primary">Edit Pricing Plan</DialogTitle>
          <DialogDescription>
            Please fill out the form below to edit the pricing plan.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default EditPricingPlanDialog;
