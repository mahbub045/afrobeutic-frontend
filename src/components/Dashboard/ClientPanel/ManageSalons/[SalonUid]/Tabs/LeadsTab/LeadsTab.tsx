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
import { formatDateTime } from "@/lib/utils";
import { useGetLeadsDataQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Leads/LeadsApi";
import { LeadProps } from "@/Types/ClientPanel/ManageSalonTypes/LeadsTypes/LeadsType";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  LoaderPinwheel,
  Plus,
  Search,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AddLeadDialog from "./Dialogs/AddLeadDialog";
import EditLeadDialog from "./Dialogs/EditLeadDialog";

const LeadsTab: React.FC = () => {
  const { data: session } = useSession();
  const { salonuid } = useParams();
  const salonUid = Array.isArray(salonuid) ? salonuid[0] : (salonuid ?? "");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [addLeadDialogOpen, setAddLeadDialogOpen] = useState<boolean>(false);
  const [editLeadDialogOpen, setEditLeadDialogOpen] = useState<boolean>(false);
  const [selectedLead, setSelectedLead] = useState<LeadProps | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data: leadsData,
    isLoading,
    isFetching,
  } = useGetLeadsDataQuery({
    salonUid,
    page: currentPage,
    search: debouncedSearch || undefined,
  });

  const extractedLeadsData: LeadProps[] = leadsData?.results ?? [];

  const openEditDialog = (lead: LeadProps) => {
    setSelectedLead(lead);
    setEditLeadDialogOpen(true);
  };

  //   const closeEditDialog = () => {
  //     setEditLeadDialogOpen(false);
  //     setSelectedLead(null);
  //   };

  const handlePreviousPage = () => {
    if (leadsData?.previous) setCurrentPage((p) => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    if (leadsData?.next) setCurrentPage((p) => p + 1);
  };

  const totalPages = leadsData?.count
    ? Math.ceil(leadsData.count / (leadsData.results?.length || 1))
    : 0;

  return (
    <div>
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:justify-between">
        <h2 className="text-lg font-semibold">Leads</h2>

        <div className="relative">
          <Search
            size={18}
            className="text-muted-foreground pointer-events-none absolute top-[10px] left-2"
          />
          <Input
            className="focus:!border-primary pl-7 shadow-md focus:!ring-0 dark:shadow-gray-600"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm((e.target as HTMLInputElement).value)
            }
          />
        </div>
        <div>
          <Button size="sm" onClick={() => setAddLeadDialogOpen(true)}>
            <Plus />
            Add Lead
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader className="text-xs">
          <TableRow>
            <TableHead className="text-primary">Name</TableHead>
            <TableHead className="text-primary">Email</TableHead>
            <TableHead className="text-primary">Phone</TableHead>
            <TableHead className="text-primary">Whatsapp</TableHead>
            <TableHead className="text-primary">Source</TableHead>
            <TableHead className="text-primary">Created At</TableHead>
            <TableHead className="text-primary text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="py-6">
                <div className="flex items-center justify-center">
                  <LoaderPinwheel className="h-6 w-6 animate-spin" />
                </div>
              </TableCell>
            </TableRow>
          ) : extractedLeadsData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-muted-foreground py-6 text-center text-sm"
              >
                No leads found.
              </TableCell>
            </TableRow>
          ) : (
            extractedLeadsData.map((lead: LeadProps) => (
              <TableRow key={lead.uid}>
                <TableCell>
                  {`${lead.first_name ?? ""} ${lead.last_name ?? ""}`.trim() ||
                    "-"}
                </TableCell>
                <TableCell>
                  {lead.email ? (
                    lead.email
                  ) : (
                    <small className="text-muted-foreground">Not Found</small>
                  )}
                </TableCell>
                <TableCell>
                  {lead.phone ? (
                    lead.phone
                  ) : (
                    <small className="text-muted-foreground">Not Found</small>
                  )}
                </TableCell>
                <TableCell>
                  {lead.whatsapp ? (
                    lead.whatsapp
                  ) : (
                    <small className="text-muted-foreground">Not Found</small>
                  )}
                </TableCell>
                <TableCell>
                  {lead.source ? (
                    lead.source
                  ) : (
                    <small className="text-muted-foreground">Not Found</small>
                  )}
                </TableCell>
                <TableCell>{formatDateTime(lead.created_at ?? null)}</TableCell>

                <TableCell className="flex justify-center gap-2">
                  <div>
                    {(session?.user?.role === "OWNER" ||
                      session?.user?.role === "ADMIN") && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-primary/80 hover:text-primary dark:shadow-gray-600"
                        onClick={() => openEditDialog(lead)}
                      >
                        <Edit />
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
          {leadsData && leadsData.count > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total: {leadsData.count} lead{leadsData.count !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        <div>
          {leadsData && leadsData.count > (leadsData.results?.length ?? 0) && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={!leadsData.previous || isFetching}
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
                disabled={!leadsData.next || isFetching}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* Modals */}
      <AddLeadDialog
        isOpen={addLeadDialogOpen}
        onClose={() => setAddLeadDialogOpen(false)}
      />
      <EditLeadDialog
        isOpen={editLeadDialogOpen}
        onClose={() => setEditLeadDialogOpen(false)}
        LeadData={selectedLead}
      />
    </div>
  );
};

export default LeadsTab;
