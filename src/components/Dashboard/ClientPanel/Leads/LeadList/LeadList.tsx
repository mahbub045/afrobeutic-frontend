"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/utils";
import { useGetLeadsDataQuery } from "@/Redux/Reducers/ClientPanel/Leads/LeadsApi";
import { useGetCommonCategoriesDataQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Common/CategoriesApi";
import { LeadProps } from "@/Types/ClientPanel/LeadsTypes/LeadsType";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Filter,
  FilterX,
  LoaderPinwheel,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import AddLeadDialog from "./Dialogs/AddLeadDialog";
import EditLeadDialog from "./Dialogs/EditLeadDialog";

const LeadList: React.FC = () => {
  const { data: session } = useSession();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [debouncedStartDate, setDebouncedStartDate] = useState<string>("");
  const [debouncedEndDate, setDebouncedEndDate] = useState<string>("");
  const [ordering, setOrdering] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [addLeadDialogOpen, setAddLeadDialogOpen] = useState<boolean>(false);
  const [editLeadDialogOpen, setEditLeadDialogOpen] = useState<boolean>(false);
  const [selectedLead, setSelectedLead] = useState<LeadProps | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string>("");
  const CATEGORY_TYPE_FILTER = "CUSTOMER_SOURCE";

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Debounce startDate / endDate changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedStartDate(startDate);
      setDebouncedEndDate(endDate);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [startDate, endDate]);

  // Reset page when ordering changes
  useEffect(() => {
    setCurrentPage(1);
  }, [ordering]);

  const { data: commonCategoriesData } = useGetCommonCategoriesDataQuery({
    category_type: CATEGORY_TYPE_FILTER,
  });

  const {
    data: leadsData,
    isLoading,
    isFetching,
  } = useGetLeadsDataQuery({
    page: currentPage,
    search: debouncedSearch ? debouncedSearch : undefined,
    created_at__gte: debouncedStartDate ? debouncedStartDate : undefined,
    created_at__lte: debouncedEndDate ? debouncedEndDate : undefined,
    ordering: ordering ? ordering : undefined,
    source: sourceFilter ? sourceFilter : undefined,
  });

  const extractedLeadsData: LeadProps[] = leadsData?.results ?? [];

  // build a deduplicated list of customer source strings from commonCategoriesData
  const customerSourceOptions: string[] = (() => {
    const src: unknown[] = Array.isArray(commonCategoriesData)
      ? commonCategoriesData
      : Array.isArray(commonCategoriesData?.data)
        ? commonCategoriesData!.data
        : [];

    const looksLikeSource = (c: unknown) => {
      if (typeof c === "string") return true;
      if (c && typeof c === "object") {
        const obj = c as Record<string, unknown>;
        const ct =
          obj.category_type ?? obj.type ?? obj.categoryType ?? obj.kind;
        if (ct === undefined || ct === null) return true;
        return String(ct).toLowerCase() === CATEGORY_TYPE_FILTER.toLowerCase();
      }
      return false;
    };

    const formatCategoryValue = (c: unknown, idx: number) => {
      if (typeof c === "string") return c;
      if (c && typeof c === "object") {
        const obj = c as Record<string, unknown>;
        const val =
          obj.name ?? obj.category ?? obj.title ?? obj.label ?? obj.id ?? idx;
        return String(val);
      }
      return String(c ?? idx);
    };

    const seen = new Set<string>();
    const out: string[] = [];
    src.forEach((c, i) => {
      if (!looksLikeSource(c)) return;
      const v = formatCategoryValue(c, i);
      if (v !== "" && !seen.has(v)) {
        seen.add(v);
        out.push(v);
      }
    });
    return out;
  })();

  const openEditDialog = (lead: LeadProps) => {
    setSelectedLead(lead);
    setEditLeadDialogOpen(true);
  };

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

        <div className="flex w-full max-w-xs items-center gap-3">
          <div className="relative flex-1">
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
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={showFilters ? "secondary" : "outline"}
            onClick={() => setShowFilters((s) => !s)}
          >
            {showFilters ? <FilterX /> : <Filter />} Filters
          </Button>

          <Button size="sm" onClick={() => setAddLeadDialogOpen(true)}>
            <Plus />
            Add Lead
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="border-border from-background to-muted/20 mb-6 rounded-lg border bg-gradient-to-br p-4 shadow-sm">
          <div className="grid gap-4 md:grid-cols-5 md:items-end">
            <div className="flex flex-col gap-2">
              <label className="text-foreground text-sm font-medium">
                Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) =>
                  setStartDate((e.target as HTMLInputElement).value)
                }
                className="shadow-sm"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-foreground text-sm font-medium">
                End Date
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) =>
                  setEndDate((e.target as HTMLInputElement).value)
                }
                className="shadow-sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Source</Label>
              {customerSourceOptions.length === 0 ? (
                <Input disabled placeholder="No sources" />
              ) : (
                <Select
                  value={sourceFilter}
                  onValueChange={(v) => setSourceFilter(v)}
                >
                  <SelectTrigger size="sm" className="w-full py-[17px]">
                    <SelectValue placeholder="All sources" />
                  </SelectTrigger>
                  <SelectContent className="max-h-52 overflow-auto">
                    {customerSourceOptions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-foreground text-sm font-medium">
                Sort By
              </label>
              <select
                value={ordering}
                onChange={(e) => setOrdering(e.target.value)}
                className="border-input bg-background hover:border-primary/50 focus:border-primary focus:ring-primary rounded-md border px-3 !py-2 text-sm shadow-sm transition-colors focus:ring-1 focus:outline-none"
              >
                <option value="">All Time</option>
                <option value="-created_at">Newest First</option>
                <option value="created_at">Oldest First</option>
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setOrdering("");
              }}
              className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive h-9"
            >
              <X />
              Clear Filters
            </Button>
          </div>
        </div>
      )}

      <Table>
        <TableHeader className="text-xs">
          <TableRow>
            <TableHead className="text-primary">Name</TableHead>
            <TableHead className="text-primary">Email</TableHead>
            <TableHead className="text-primary">Phone</TableHead>
            {session?.user?.account_type === "INDIVIDUAL_STYLIST" ? null : (
              <TableHead className="text-primary">Salon</TableHead>
            )}
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
                {session?.user?.account_type === "INDIVIDUAL_STYLIST" ? null : (
                  <TableCell>
                    {lead.salon ? (
                      lead.salon.name
                    ) : (
                      <small className="text-muted-foreground">Not Found</small>
                    )}
                  </TableCell>
                )}
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

export default LeadList;
