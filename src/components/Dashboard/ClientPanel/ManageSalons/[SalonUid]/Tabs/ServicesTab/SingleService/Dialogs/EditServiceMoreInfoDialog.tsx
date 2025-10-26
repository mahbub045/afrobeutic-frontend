import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useGetEmployeesDataQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Employees/EmployeesApi";
import { useEditServiceMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/Services/ServicesApi";
import { ServiceProps } from "@/Types/ClientPanel/ManageSalonTypes/ServicesTypes/ServicesType";
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";

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
  const { salonuid } = useParams();
  const salonUid = Array.isArray(salonuid) ? salonuid[0] : (salonuid ?? "");
  const { resolvedTheme } = useTheme();

  //   RTK Hooks
  const {
    data: employeesData,
    isLoading
  } = useGetEmployeesDataQuery({ salonUid });
  const [editService, { isLoading: isEditingService }] =
    useEditServiceMutation();

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
