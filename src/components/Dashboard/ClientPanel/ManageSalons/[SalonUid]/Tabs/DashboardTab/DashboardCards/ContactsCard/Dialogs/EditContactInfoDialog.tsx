import { Dialog } from "@/components/ui/dialog";
import { useEditSingleSalonMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/SingleSalon/SingleSalonApi";
import { EditDashboardProps } from "@/Types/ClientPanel/ManageSalonTypes/SalonListType";
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";

const EditContactInfoDialog: React.FC<EditDashboardProps> = ({
  singleSalonData,
  isOpen,
  onClose,
}) => {
    const { salonuid } = useParams();
  const { resolvedTheme } = useTheme();
  // RTK hooks
  const [editBasicInfo, { isLoading }] = useEditSingleSalonMutation();

  return <Dialog>{/* JSX here */}</Dialog>;
};

export default EditContactInfoDialog;
