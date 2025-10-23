import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEditSingleSalonMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/SingleSalon/SingleSalonApi";
import { SalonProps } from "@/Types/ClientPanel/ManageSalonTypes/SalonListType";
import { useParams } from "next/navigation";

export interface EditBasicInfoDialogProps {
  // Define any props if needed
  singleSalonData: SalonProps | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditBasicInfoDialog: React.FC<EditBasicInfoDialogProps> = ({
  singleSalonData,
  isOpen,
  onClose,
}) => {
  const { salonuid } = useParams();

  // RTK hooks
  const [editBasicInfo, { isLoading }] = useEditSingleSalonMutation();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="shadow-md dark:shadow-gray-600">
        <DialogHeader>
          <DialogTitle className="text-primary text-2xl">
            Add New Salon
          </DialogTitle>
          <DialogDescription className="text-xs">
            Fill in the details to add a new salon.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default EditBasicInfoDialog;
