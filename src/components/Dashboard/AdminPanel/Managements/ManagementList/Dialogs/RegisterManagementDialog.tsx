import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useRegisterManagementMutation } from "@/Redux/Reducers/AdminPanel/Managements/ManagementsApi";
import { ManagementsListDialogsProps } from "@/Types/AdminPanel/ManagementsTypes/ManagementsType";
import { DialogDescription } from "@radix-ui/react-dialog";

const RegisterManagementDialog: React.FC<ManagementsListDialogsProps> = ({
  isOpen,
  onClose,
}) => {
  const [registerManagement, { isLoading }] = useRegisterManagementMutation();
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle className="text-primary">Register Management</DialogTitle>
        <DialogDescription>
          <small> Fill in the details to register a new management user.</small>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterManagementDialog;
