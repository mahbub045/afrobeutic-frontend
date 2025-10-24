import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAddServicesMutation } from "@/Redux/Reducers/ClientPanel/Services/ServicesApi";

import { Formik } from "formik";
import { useParams } from "next/navigation";

export interface AddServiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddServiceDialog: React.FC<AddServiceDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { salonuid } = useParams();
  // RTK Hook
  const [addService, { isLoading, isSuccess, isError, error }] =
    useAddServicesMutation();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md shadow-md dark:shadow-gray-600">
        <DialogHeader>
          <DialogTitle>Add New Service</DialogTitle>
          <DialogDescription>Add a new service to the salon</DialogDescription>
        </DialogHeader>
        <Formik></Formik>
      </DialogContent>
    </Dialog>
  );
};

export default AddServiceDialog;
