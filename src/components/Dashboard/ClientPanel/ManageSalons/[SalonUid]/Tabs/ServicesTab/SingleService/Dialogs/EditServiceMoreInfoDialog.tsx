import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ServiceProps } from "@/Types/ClientPanel/ManageSalonTypes/ServicesTypes/ServicesType";

export interface EditServiceMoreInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedService: ServiceProps;
  onEditSuccess?: () => void;
}

const EditServiceMoreInfoDialog: React.FC<EditServiceMoreInfoDialogProps> = ({
  isOpen,
  onClose,
  selectedService,
  onEditSuccess,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="shadow-md sm:max-w-lg md:max-w-xl dark:shadow-gray-600">
        <DialogHeader>
          <DialogTitle>Edit Service More Info</DialogTitle>
          <DialogDescription>
            Make changes to the service information below.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default EditServiceMoreInfoDialog;
