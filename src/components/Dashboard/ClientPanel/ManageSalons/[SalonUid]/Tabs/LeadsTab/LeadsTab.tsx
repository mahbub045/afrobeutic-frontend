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
import {
  useDeleteLeadsMutation,
  useGetLeadsDataQuery,
} from "@/Redux/Reducers/ClientPanel/ManageSalons/Leads/LeadsApi";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  LoaderPinwheel,
  Search,
  Trash2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Lead {
  uid: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  source?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

const LeadsTab: React.FC = () => {
  const { data: session } = useSession();
  const { salonuid } = useParams();
  const salonUid = Array.isArray(salonuid) ? salonuid[0] : (salonuid ?? "");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [viewTab, setViewTab] = useState<string>("list");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

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

  const [deleteLead] = useDeleteLeadsMutation();

  const extractedLeadsData: Lead[] = leadsData?.results ?? [];

  const handlePreviousPage = () => {
    if (leadsData?.previous) setCurrentPage((p) => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    if (leadsData?.next) setCurrentPage((p) => p + 1);
  };

  const totalPages = leadsData?.count
    ? Math.ceil(leadsData.count / (leadsData.results?.length || 1))
    : 0;

  const handleView = (lead?: Lead | null) => {
    if (lead) {
      setSelectedLead(lead);
      setViewTab("details");
    } else {
      setSelectedLead(null);
    }
  };


  return (
    <Tabs value={viewTab} onValueChange={(v) => setViewTab(v)}>
      <TabsContent value="list">
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
          <div />
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
              <TableHead className="text-primary text-center">
                Actions
              </TableHead>
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
              extractedLeadsData.map((lead: Lead) => (
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
                  <TableCell>
                    {formatDateTime(lead.created_at ?? null)}
                  </TableCell>

                  <TableCell className="flex justify-center gap-2">
                    <div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-primary/80 hover:text-primary dark:shadow-gray-600"
                        onClick={() => handleView(lead)}
                      >
                        <Eye />
                      </Button>
                    </div>
                    <div>
                      {(session?.user?.role === "OWNER" ||
                        session?.user?.role === "ADMIN") && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-danger/80 hover:text-danger dark:shadow-gray-600"
                        //   onClick={() => handleDelete(lead)}
                        >
                          <Trash2 />
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
            {leadsData &&
              leadsData.count > (leadsData.results?.length ?? 0) && (
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
      </TabsContent>

      <TabsContent value="details">
        {selectedLead ? (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Lead Details</h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <strong>Name:</strong>{" "}
                {`${selectedLead.first_name ?? ""} ${selectedLead.last_name ?? ""}`.trim() ||
                  "-"}
              </div>
              <div>
                <strong>Email:</strong> {selectedLead.email ?? "-"}
              </div>
              <div>
                <strong>Phone:</strong> {selectedLead.phone ?? "-"}
              </div>
              <div>
                <strong>Whatsapp:</strong> {selectedLead.whatsapp ?? "-"}
              </div>
              <div>
                <strong>Source:</strong> {selectedLead.source ?? "-"}
              </div>
              <div>
                <strong>Created:</strong>{" "}
                {formatDateTime(selectedLead.created_at ?? null)}
              </div>
              <div>
                <strong>Updated:</strong>{" "}
                {formatDateTime(selectedLead.updated_at ?? null)}
              </div>
            </div>

            <div className="pt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setViewTab("list")}
              >
                Back to list
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground py-6 text-center text-sm">
            No lead selected.
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default LeadsTab;
