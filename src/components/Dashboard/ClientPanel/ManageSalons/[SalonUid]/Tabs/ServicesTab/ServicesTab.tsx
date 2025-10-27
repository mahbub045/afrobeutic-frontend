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
import { formatDateTime } from "@/lib/utils";
import { useGetServicesDataQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Services/ServicesApi";
import { ServiceProps } from "@/Types/ClientPanel/ManageSalonTypes/ServicesTypes/ServicesType";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  LoaderPinwheel,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AddServiceDialog from "./Dialogs/AddServiceDialog";
import DeleteServiceDialog from "./Dialogs/DeleteServiceDialog";
import ViewServicePanel from "./SingleService/ViewServicePanel";

const ServicesTab: React.FC = () => {
  const { salonuid } = useParams();
  const salonUid = Array.isArray(salonuid) ? salonuid[0] : (salonuid ?? "");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [isOpenAddServiceDialog, setIsOpenAddServiceDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceProps | null>(
    null,
  );
  const [selectedServiceToView, setSelectedServiceToView] =
    useState<ServiceProps | null>(null);
  const [viewTab, setViewTab] = useState<string>("list");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data: serviceData,
    isLoading,
    isFetching,
  } = useGetServicesDataQuery({
    salonUid,
    page: currentPage,
    search: debouncedSearch || undefined,
  });

  const extractedServices: ServiceProps[] = serviceData?.results ?? [];

  const handlePreviousPage = () => {
    if (serviceData?.previous) setCurrentPage((p) => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    if (serviceData?.next) setCurrentPage((p) => p + 1);
  };

  const totalPages = serviceData?.count
    ? Math.ceil(serviceData.count / (serviceData.results?.length || 1))
    : 0;

  const handleIsOpenAddServiceDialog = () =>
    setIsOpenAddServiceDialog((v) => !v);

  const handleIsOpenDeleteDialog = (service?: ServiceProps | null) => {
    setSelectedService(service ?? null);
  };

  const handleIsOpenSingleServiceTab = (service?: ServiceProps | null) => {
    if (service) {
      setSelectedServiceToView(service);
      setViewTab("details");
    } else {
      setSelectedServiceToView(null);
    }
  };

  return (
    <Tabs value={viewTab} onValueChange={(v) => setViewTab(v)}>
      <TabsContent value="list">
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:justify-between">
          <h2 className="text-lg font-semibold">Services</h2>
          <div className="relative">
            <Search
              size={18}
              className="text-muted-foreground pointer-events-none absolute top-[10px] left-2"
            />
            <Input
              className="focus:!border-primary pl-7 shadow-md focus:!ring-0 dark:shadow-gray-600"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm((e.target as HTMLInputElement).value)
              }
            />
          </div>

          <Button
            size="sm"
            variant="default"
            onClick={handleIsOpenAddServiceDialog}
          >
            <Plus className="h-4 w-4" />
            Add New Service
          </Button>
        </div>

        <Table>
          <TableHeader className="text-xs">
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Service Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-6">
                  <div className="flex items-center justify-center">
                    <LoaderPinwheel className="h-6 w-6 animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : extractedServices.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground py-6 text-center text-sm"
                >
                  No services found.
                </TableCell>
              </TableRow>
            ) : (
              extractedServices.map((service: ServiceProps, index) => (
                <TableRow key={service.uid}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>{service.category}</TableCell>
                  <TableCell>${service.price}</TableCell>
                  <TableCell>
                    {formatDateTime(service?.created_at ?? null)}
                  </TableCell>
                  <TableCell>
                    {formatDateTime(service?.updated_at ?? null)}
                  </TableCell>

                  <TableCell className="flex justify-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-primary/80 hover:text-primary dark:shadow-gray-600"
                      onClick={() => handleIsOpenSingleServiceTab(service)}
                    >
                      <Eye />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-danger/80 hover:text-danger dark:shadow-gray-600"
                      color="red"
                      onClick={() => handleIsOpenDeleteDialog(service)}
                    >
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex justify-between px-2 py-4">
          <div>
            {serviceData && serviceData.count > 0 && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total: {serviceData.count} service
                {serviceData.count !== 1 ? "s" : ""}
              </div>
            )}
          </div>

          <div>
            {/* Pagination Controls */}
            {serviceData &&
              serviceData.count > (serviceData.results?.length ?? 0) && (
                <div className="flex items-center justify-center gap-4 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={!serviceData.previous || isFetching}
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
                    disabled={!serviceData.next || isFetching}
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
        {selectedServiceToView ? (
          <ViewServicePanel
            selectedService={selectedServiceToView}
            onClose={() => setViewTab("list")}
          />
        ) : (
          <div className="text-muted-foreground py-6 text-center text-sm">
            No service selected.
          </div>
        )}
      </TabsContent>

      {/* Dialogs */}
      <AddServiceDialog
        isOpen={isOpenAddServiceDialog}
        onClose={handleIsOpenAddServiceDialog}
      />
      {selectedService && (
        <DeleteServiceDialog
          selectedService={selectedService}
          isOpen={!!selectedService}
          onClose={() => handleIsOpenDeleteDialog()}
        />
      )}
    </Tabs>
  );
};

export default ServicesTab;
