import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useDeleteEmployeeMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/Employees/EmployeesApi";
import { DeleteEmployeeDialogProps } from "@/Types/ClientPanel/ManageSalonTypes/EmployeesTypes/EmployeesType";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const DeleteEmployeeDialog: React.FC<DeleteEmployeeDialogProps> = ({
  selectedEmployee,
  isOpen,
  onClose,
}) => {
  const { salonuid } = useParams();
  const { resolvedTheme } = useTheme();
  const [deleteEmployee, { isLoading }] = useDeleteEmployeeMutation();

  const handleDelete = async () => {
    try {
      await deleteEmployee({
        salonUid: salonuid,
        employeeUid: selectedEmployee?.uid,
      }).unwrap();
      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Deleted!",
        html: `The employee <b class="text-danger">${selectedEmployee?.name}</b> has been successfully deleted.`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 2000,
      });
      onClose();
    } catch (error) {
      console.error("Failed to delete employee:", error);
      toast.error("Failed to delete employee. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="shadow dark:shadow-gray-600">
        <DialogHeader>
          <DialogTitle className="text-danger">Delete Employee</DialogTitle>
        </DialogHeader>
        <div>
          Are you sure you want to delete this{" "}
          <b className="text-danger">{selectedEmployee?.name}</b> employee? This
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

export default DeleteEmployeeDialog;
