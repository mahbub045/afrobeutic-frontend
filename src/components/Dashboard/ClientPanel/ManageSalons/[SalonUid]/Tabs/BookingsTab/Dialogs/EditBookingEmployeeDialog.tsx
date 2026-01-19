import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { baseApi } from "@/Redux/Api/BaseApi";
import { useEditBookingMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/Bookings/BookingsApi";
import { useGetEmployeesDataQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Employees/EmployeesApi";
import type {
  CommonEditBookingDataProps,
  Employee,
} from "@/Types/ClientPanel/ManageSalonTypes/BookingsTypes/BookingsTypes";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";

const EditBookingEmployeeDialog: React.FC<CommonEditBookingDataProps> = ({
  isOpen,
  onOpenChange,
  bookingData,
}) => {
  const { salonuid } = useParams();
  const salonUid = Array.isArray(salonuid) ? salonuid[0] : (salonuid ?? "");
  const { resolvedTheme } = useTheme();
  const dispatch = useDispatch();

  const { data: employeesData, isLoading: isLoadingEmployees } =
    useGetEmployeesDataQuery({ salonUid });

  const [selectedEmployee, setSelectedEmployee] = useState<string>("");

  const [editBooking, { isLoading }] = useEditBookingMutation();

  // Sync selectedEmployee with bookingData when modal opens or data changes
  useEffect(() => {
    if (isOpen && bookingData) {
      const employeeUid =
        (bookingData?.employee as unknown as { uid?: string })?.uid || "";
      setSelectedEmployee(employeeUid);
    }
  }, [isOpen, bookingData]);

  const handleSave = async () => {
    if (!bookingData || !selectedEmployee) return;
    try {
      await editBooking({
        salonUid,
        bookingUid: bookingData.uid,
        data: { employee: selectedEmployee },
      }).unwrap();

      try {
        dispatch(baseApi.util.invalidateTags(["ChairsBooking"]));
      } catch (e) {
        console.warn(e);
      }

      Swal.fire({
        icon: "success",
        title: "Employee updated",
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        timer: 1800,
      });

      onOpenChange(false);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Failed to update employee" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] !max-w-2xl overflow-y-auto shadow-md">
        <DialogHeader>
          <DialogTitle className="text-primary">Change Employee</DialogTitle>
          <DialogDescription>
            Select a different employee for this booking.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className="mb-2">Select Employee</Label>
            {isLoadingEmployees ? (
              <div className="flex items-center justify-center rounded-lg border border-dashed p-6">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : employeesData?.results && employeesData.results.length > 0 ? (
              <div className="max-h-80 overflow-y-auto rounded-lg border p-3">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {employeesData.results.map((employee: Employee) => (
                    <label
                      key={employee.uid}
                      className="hover:border-primary hover:bg-primary/5 flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all"
                    >
                      <input
                        type="radio"
                        name="employee"
                        value={employee.uid}
                        checked={selectedEmployee === employee.uid}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                        className="h-4 w-4 cursor-pointer"
                        style={{
                          accentColor: "#027f81",
                        }}
                      />
                      <span className="flex-1 text-sm font-medium">
                        {employee.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-lg border border-dashed p-6">
                <p className="text-muted-foreground text-sm">
                  No employees found
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={isLoading || !selectedEmployee}
            onClick={handleSave}
          >
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditBookingEmployeeDialog;
