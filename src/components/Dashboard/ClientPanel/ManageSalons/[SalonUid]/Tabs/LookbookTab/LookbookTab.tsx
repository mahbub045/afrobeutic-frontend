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
import { useGetLookBookDataQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/LookBook/LookBookApi";
import { LookBookProps } from "@/Types/ClientPanel/ManageSalonTypes/LookBookTypes/LookBookType";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  LoaderPinwheel,
  Search,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ViewLookBookPanel from "./LookBookDetails/ViewLookBookPanel";

const LookbookTab: React.FC = () => {
  const { salonuid } = useParams();
  const salonUid = Array.isArray(salonuid) ? salonuid[0] : (salonuid ?? "");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [selectedLookBookToView, setSelectedLookBookToView] =
    useState<LookBookProps | null>(null);
  const [viewTab, setViewTab] = useState<string>("list");

  // RTK Hook
  const { data: lookBookData, isLoading } = useGetLookBookDataQuery({
    salonUid,
    page: currentPage,
    search: debouncedSearch || undefined,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handlePreviousPage = () => {
    if (lookBookData?.previous) setCurrentPage((p) => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    if (lookBookData?.next) setCurrentPage((p) => p + 1);
  };

  const totalPages = lookBookData?.count
    ? Math.ceil(lookBookData.count / (lookBookData.results?.length || 1))
    : 0;

  const extractedLookBook: LookBookProps[] = lookBookData?.results ?? [];

  const handleIsOpenSingleLookBookTab = (lookBook?: LookBookProps | null) => {
    if (lookBook) {
      setSelectedLookBookToView(lookBook);
      setViewTab("details");
    } else {
      setSelectedLookBookToView(null);
    }
  };

  return (
    <Tabs value={viewTab} onValueChange={(v) => setViewTab(v)}>
      <TabsContent value="list">
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:justify-between">
          <h2 className="text-lg font-semibold">LookBooks</h2>
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
          <div />
        </div>

        <Table>
          <TableHeader className="text-xs">
            <TableRow>
              <TableHead className="text-primary">Booking ID</TableHead>
              <TableHead className="text-primary">Customer Name</TableHead>
              <TableHead className="text-primary">Customer Phone</TableHead>
              <TableHead className="text-primary">Completed At</TableHead>
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
            ) : extractedLookBook.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-muted-foreground py-6 text-center text-sm"
                >
                  No employees found.
                </TableCell>
              </TableRow>
            ) : (
              extractedLookBook.map((lookBook: LookBookProps) => (
                <TableRow key={lookBook.uid}>
                  <TableCell>{lookBook?.booking_id}</TableCell>
                  <TableCell>{lookBook.customer?.name}</TableCell>
                  <TableCell>{lookBook?.customer?.phone}</TableCell>
                  <TableCell>
                    {formatDateTime(lookBook.completed_at ?? null)}
                  </TableCell>
                  <TableCell>
                    {formatDateTime(lookBook?.created_at ?? null)}
                  </TableCell>
                  <TableCell>
                    {formatDateTime(lookBook?.updated_at ?? null)}
                  </TableCell>

                  <TableCell className="flex justify-center gap-2">
                    <div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-primary/80 hover:text-primary dark:shadow-gray-600"
                        onClick={() => handleIsOpenSingleLookBookTab(lookBook)}
                      >
                        <Eye />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex justify-between px-2 py-4">
          <div>
            {lookBookData && lookBookData.count > 0 && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total: {lookBookData.count} employee
                {lookBookData.count !== 1 ? "s" : ""}
              </div>
            )}
          </div>

          <div>
            {/* Pagination Controls */}
            {lookBookData &&
              lookBookData.count > (lookBookData.results?.length ?? 0) && (
                <div className="flex items-center justify-center gap-4 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={!lookBookData.previous || isLoading}
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
                    disabled={!lookBookData.next || isLoading}
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
        {selectedLookBookToView ? (
          <ViewLookBookPanel
            selectedLookBook={selectedLookBookToView}
            onClose={() => setViewTab("list")}
          />
        ) : (
          <div className="text-muted-foreground py-6 text-center text-sm">
            No employee selected.
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default LookbookTab;
