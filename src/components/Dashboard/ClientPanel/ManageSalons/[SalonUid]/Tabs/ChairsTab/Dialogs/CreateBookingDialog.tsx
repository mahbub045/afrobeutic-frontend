import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { useGetEmployeesDataQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Employees/EmployeesApi";
import { useGetProductsDataQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Products/ProductsApi";
import { useGetServicesDataQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Services/ServicesApi";
import { ChairDialogsProps } from "@/Types/ClientPanel/ManageSalonTypes/ChairsTypes/ChairsType";
import { useParams } from "next/navigation";

const CreateBookingDialog: React.FC<ChairDialogsProps> = ({
  isOpen,
  onClose,
  selectedChairData,
}) => {
  const { salonuid } = useParams();
  const salonUid = Array.isArray(salonuid) ? salonuid[0] : (salonuid ?? "");
  // Rtk Hooks
  const { data: servicesData, isLoading: isLoadingServices } =
    useGetServicesDataQuery({ salonUid: salonUid });
  const { data: productsData, isLoading: isLoadingProducts } =
    useGetProductsDataQuery({ salonUid: salonUid });
  const { data: employeesData, isLoading: isLoadingEmployees } =
    useGetEmployeesDataQuery({ salonUid: salonUid });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>Create Booking</DialogHeader>
        <DialogDescription>
          Please fill in the details for the new booking.
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBookingDialog;
