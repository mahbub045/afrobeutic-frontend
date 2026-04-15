"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useEffectiveRole } from "@/hooks/use-effective-role";
import { formatDateTime } from "@/lib/utils";
import { useGetEmployeesDataQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Employees/EmployeesApi";
import { EmployeeProps } from "@/Types/ClientPanel/ManageSalonTypes/EmployeesTypes/EmployeesType";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  LoaderPinwheel,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AddEmployeeDialog from "./Dialogs/AddEmployeeDialog";
import DeleteEmployeeDialog from "./Dialogs/DeleteEmloyeeDialog";
import ViewEmployeePanel from "./EmployeeDetails/ViewEmployeePanel";

const EmployeesTab: React.FC = () => {
  const { data: session } = useSession();
  const { canManageClientAccount } = useEffectiveRole(session);
  const { salonuid } = useParams();
  const salonUid = Array.isArray(salonuid) ? salonuid[0] : (salonuid ?? "");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [isOpenAddEmployeeDialog, setIsOpenAddEmployeeDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeProps | null>(null);
  const [selectedEmployeeToView, setSelectedEmployeeToView] =
    useState<EmployeeProps | null>(null);
  const [viewTab, setViewTab] = useState<string>("list");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data: employeesData,
    isLoading,
    isFetching,
  } = useGetEmployeesDataQuery({
    salonUid,
    page: currentPage,
    search: debouncedSearch || undefined,
  });

  const extractedEmployees: EmployeeProps[] = employeesData?.results ?? [];

  const handlePreviousPage = () => {
    if (employeesData?.previous) setCurrentPage((p) => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    if (employeesData?.next) setCurrentPage((p) => p + 1);
  };

  const totalPages = employeesData?.count
    ? Math.ceil(employeesData.count / (employeesData.results?.length || 1))
    : 0;

  const handleIsOpenAddEmployeeDialog = () =>
    setIsOpenAddEmployeeDialog((v) => !v);

  const handleIsOpenDeleteDialog = (employee?: EmployeeProps | null) => {
    setSelectedEmployee(employee ?? null);
  };

  const handleIsOpenSingleEmployeeTab = (employee?: EmployeeProps | null) => {
    if (employee) {
      setSelectedEmployeeToView(employee);
      setViewTab("details");
    } else {
      setSelectedEmployeeToView(null);
    }
  };

  return (
    <Tabs value={viewTab} onValueChange={(v) => setViewTab(v)}>
      <TabsContent value="list">
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:justify-between">
          <h2 className="text-lg font-semibold">Employees</h2>
          <div className="relative">
            <Search
              size={18}
              className="text-muted-foreground pointer-events-none absolute top-[10px] left-2"
            />
            <Input
              className="focus:!border-primary pl-7 shadow-md focus:!ring-0 dark:shadow-gray-600"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm((e.target as HTMLInputElement).value)
              }
            />
          </div>
          <div>
            {canManageClientAccount && (
              <Button
                size="sm"
                variant="default"
                onClick={handleIsOpenAddEmployeeDialog}
              >
                <Plus className="h-4 w-4" />
                Add New Employee
              </Button>
            )}
          </div>
        </div>

        <Table>
          <TableHeader className="text-xs">
            <TableRow>
              <TableHead className="text-primary">Employee ID</TableHead>
              <TableHead className="text-primary">Name</TableHead>
              <TableHead className="text-primary">Phone</TableHead>
              <TableHead className="text-primary">Designation</TableHead>
              <TableHead className="text-primary">Created At</TableHead>
              <TableHead className="text-primary">Updated At</TableHead>
              <TableHead className="text-primary text-center">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-6">
                  <div className="flex items-center justify-center">
                    <LoaderPinwheel className="h-6 w-6 animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : extractedEmployees.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-muted-foreground py-6 text-center text-sm"
                >
                  No employees found.
                </TableCell>
              </TableRow>
            ) : (
              extractedEmployees.map((employee: EmployeeProps) => (
                <TableRow key={employee.uid}>
                  <TableCell>{employee.employee_id}</TableCell>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.phone}</TableCell>
                  <TableCell>{employee.designation}</TableCell>
                  <TableCell>
                    {formatDateTime(employee?.created_at ?? null)}
                  </TableCell>
                  <TableCell>
                    {formatDateTime(employee?.updated_at ?? null)}
                  </TableCell>

                  <TableCell className="flex justify-center gap-2">
                    <div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-primary/80 hover:text-primary dark:shadow-gray-600"
                        onClick={() => handleIsOpenSingleEmployeeTab(employee)}
                      >
                        <Eye />View
                      </Button>
                    </div>
                    <div>
                      {canManageClientAccount && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-danger/80 hover:text-danger dark:shadow-gray-600"
                          color="red"
                          onClick={() => handleIsOpenDeleteDialog(employee)}
                        >
                          <Trash2 />Delete
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex justify-between px-2 py-4">
          <div>
            {employeesData && employeesData.count > 0 && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total: {employeesData.count} employee
                {employeesData.count !== 1 ? "s" : ""}
              </div>
            )}
          </div>

          <div>
            {/* Pagination Controls */}
            {employeesData &&
              employeesData.count > (employeesData.results?.length ?? 0) && (
                <div className="flex items-center justify-center gap-4 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={!employeesData.previous || isFetching}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={!employeesData.next || isFetching}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="details">
        {selectedEmployeeToView ? (
          <ViewEmployeePanel
            selectedEmployee={selectedEmployeeToView}
            onClose={() => setViewTab("list")}
          />
        ) : (
          <div className="text-muted-foreground py-6 text-center text-sm">
            No employee selected.
          </div>
        )}
      </TabsContent>

      {/* Dialogs */}
      <AddEmployeeDialog
        isOpen={isOpenAddEmployeeDialog}
        onClose={handleIsOpenAddEmployeeDialog}
      />
      {selectedEmployee && (
        <DeleteEmployeeDialog
          selectedEmployee={selectedEmployee}
          isOpen={!!selectedEmployee}
          onClose={() => handleIsOpenDeleteDialog()}
        />
      )}
    </Tabs>
  );
};

export default EmployeesTab;
