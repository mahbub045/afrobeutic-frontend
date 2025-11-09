import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateTime, safe } from "@/lib/utils";
import { useGetEmployeesDataQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Employees/EmployeesApi";
import {
  EmployeeProps,
  ViewEmployeePanelProps,
} from "@/Types/ClientPanel/ManageSalonTypes/EmployeesTypes/EmployeesType";
import { ArrowLeft, Edit, LoaderPinwheel } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import EditEmployeeBasicInfoDialog from "./Dialogs/EditEmployeeBasicInfoDialog";

const ViewEmployeePanel: React.FC<ViewEmployeePanelProps> = ({
  selectedEmployee,
  onClose,
}) => {
  const { data: session } = useSession();
  const { salonuid } = useParams();
  const salonUid = Array.isArray(salonuid) ? salonuid[0] : (salonuid ?? "");

  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);

  // Re-fetch employees data to get updated employee
  const { data: employeesData, refetch } = useGetEmployeesDataQuery(
    {
      salonUid,
      page: 1,
      page_size: 1000, // Fetch enough to find our employee
    },
    { skip: !salonUid },
  );

  const [displayedEmployee, setDisplayedEmployee] =
    useState<EmployeeProps>(selectedEmployee);

  // Update displayed employee when selectedEmployee prop changes
  useEffect(() => {
    setDisplayedEmployee(selectedEmployee);
  }, [selectedEmployee]);

  // Update displayed service when services data refetches (after edit)
  useEffect(() => {
    if (employeesData?.results && Array.isArray(employeesData.results)) {
      const updatedEmployee = (employeesData.results as EmployeeProps[]).find(
        (s) => s.uid === selectedEmployee.uid,
      );
      if (updatedEmployee) {
        setDisplayedEmployee(updatedEmployee);
      }
    }
  }, [employeesData, selectedEmployee.uid]);

  const handleEditEmployeeBasicInfo = () => {
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    // Refetch employees to get the latest data
    refetch();
  };

  if (!displayedEmployee) return null;

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Employee details</h2>
        <TabsList className="shadow-md dark:shadow-gray-600">
          <TabsTrigger value="list" className="px-3">
            List
          </TabsTrigger>
          <TabsTrigger value="details" className="px-3">
            Details
          </TabsTrigger>
        </TabsList>
      </div>

      <Card className="bg-card overflow-hidden rounded-md p-0 shadow-md dark:shadow-gray-600">
        <div className="grid grid-cols-1 gap-0 md:grid-cols-12">
          {/* Left: Image section (on mobile it shows first) */}
          <div className="bg-muted relative col-span-12 flex flex-col md:col-span-4">
            {displayedEmployee?.image ? (
              <div className="group relative h-[200px] w-full overflow-hidden md:h-[470px]">
                <Image
                  src={displayedEmployee.image}
                  alt={`${displayedEmployee.name}-main`}
                  height={470}
                  width={300}
                  className="h-full w-full object-cover"
                  onLoadingComplete={() => setIsImageLoading(false)}
                />

                {/* Loading spinner */}
                {isImageLoading && (
                  <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/10">
                    <LoaderPinwheel className="text-primary h-10 w-10 animate-spin" />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground flex min-h-[200px] w-full flex-1 items-center justify-center md:min-h-[470px]">
                No image
              </div>
            )}
          </div>

          {/* Right: Details section (on mobile it comes below image) */}
          <div className="col-span-12 p-4 md:col-span-8 md:p-6">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div></div>
              <div>
                <a className="text-primary text-lg font-medium hover:underline">
                  {displayedEmployee.name}
                </a>
              </div>

              <div className="text-left md:text-right">
                <div className="text-muted-foreground text-sm">Employee ID</div>
                <div className="text-lg font-semibold">
                  {safe(displayedEmployee.employee_id)}
                </div>
              </div>
            </div>

            {/* Basic info */}
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-base font-semibold">Basic info</h4>
              <div>
                {(session?.user?.role === "OWNER" ||
                  session?.user?.role === "ADMIN") && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="shadow-md dark:shadow-gray-600"
                    onClick={handleEditEmployeeBasicInfo}
                  >
                    <Edit size={16} />
                  </Button>
                )}
              </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div>
                <div className="text-muted-foreground text-xs uppercase">
                  Employee name
                </div>
                <div className="text-sm font-medium">
                  {safe(displayedEmployee.name)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs uppercase">
                  Phone
                </div>
                <div className="text-sm font-medium">
                  {safe(displayedEmployee.phone)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs uppercase">
                  Designation
                </div>
                <div className="text-sm font-medium">
                  {safe(displayedEmployee.designation)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs uppercase">
                  Created At
                </div>
                <div className="text-sm font-medium">
                  {safe(formatDateTime(displayedEmployee.created_at))}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs uppercase">
                  Updated At
                </div>
                <div className="text-sm font-medium">
                  {safe(formatDateTime(displayedEmployee.updated_at))}
                </div>
              </div>
            </div>

            {/* Back button */}
            <div className="mt-6 flex justify-end">
              {onClose && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onClose}
                  className="flex items-center gap-1 shadow-md dark:shadow-gray-600"
                >
                  <ArrowLeft size={16} />
                  Back
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
      <EditEmployeeBasicInfoDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        selectedEmployee={displayedEmployee}
        onEditSuccess={handleEditSuccess}
      />
    </>
  );
};

export default ViewEmployeePanel;
