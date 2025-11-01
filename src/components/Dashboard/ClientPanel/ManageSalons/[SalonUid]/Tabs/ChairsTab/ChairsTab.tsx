"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { formatChoiceFieldValue } from "@/lib/utils";
import { useGetChairsDataQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Chairs/ChairsApi";
import {
  Armchair,
  ChevronLeft,
  ChevronRight,
  Edit,
  MoreVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { useParams } from "next/navigation";
import * as React from "react";
import { useState } from "react";

type ChairProps = {
  id: string;
  name: string;
  uid?: string;
  status?: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
  type?: string;
  created_at?: string;
  updated_at?: string;
};

const ChairsTab: React.FC = () => {
  const { salonuid } = useParams();
  const salonUid = Array.isArray(salonuid) ? salonuid[0] : (salonuid ?? "");
  const [currentPage, setCurrentPage] = useState(1);

  // RTK Hooks
  const {
    data: chairsData,
    isLoading,
    isFetching,
  } = useGetChairsDataQuery({
    salonUid: salonUid,
    page: currentPage,
  });
  const extractedChairs: ChairProps[] = chairsData?.results ?? [];

  const handlePreviousPage = () => {
    if (chairsData?.previous) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (chairsData?.next) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const totalPages = chairsData?.count
    ? Math.ceil(chairsData.count / (chairsData.results?.length || 1))
    : 0;

  // Helper function to get status indicator color (dot animation)
  const getStatusIndicatorColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case "AVAILABLE":
        return "bg-green-600";
      case "OUTOFORDER":
        return "bg-danger";
      case "MAINTENANCE":
        return "bg-warning";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold md:text-2xl">Chairs Management</h2>
        <Button variant="default">
          {" "}
          <Plus className="h-4 w-4" /> Add Chair
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(12)].map((_, idx) => (
            <Card
              key={`chair-skeleton-${idx}`}
              className="group relative overflow-hidden border border-gray-200/60 bg-white/80 shadow-md backdrop-blur-sm dark:border-gray-700/60 dark:bg-gray-900/80 dark:shadow-gray-600"
            >
              {/* Animated border gradient */}
              <div className="from-primary/10 dark:from-primary/20 dark:to-primary/20 to-primary/10 absolute inset-0 rounded-lg bg-gradient-to-r via-transparent opacity-0" />
              <div className="absolute inset-[1px] rounded-lg" />

              {/* Content */}
              <div className="relative z-10">
                <CardHeader className="pt-0 pb-3">
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <div className="flex-1" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                  <div className="mb-4 flex justify-center">
                    <Skeleton className="h-18 w-18 rounded-full" />
                  </div>
                  <Skeleton className="mx-auto h-6 w-3/4" />
                </CardHeader>

                <CardContent className="px-6 pb-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2">
                      <Skeleton className="h-3 w-3 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      ) : extractedChairs?.length === 0 ? (
        <div className="w-full rounded-xl border-2 border-dashed border-gray-400/60 bg-white/80 p-8 text-center dark:border-gray-700/60 dark:bg-gray-900/80">
          <div className="bg-primary/5 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
            <Armchair className="text-primary h-6 w-6" />
          </div>
          <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
            No chairs yet
          </h3>
          <p className="text-muted-foreground text-sm">
            Click the Add button to create your first chair
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {extractedChairs.map((chair: ChairProps) => (
            <Card
              key={chair.id || chair.uid}
              className="group hover:shadow-primary/10 relative overflow-hidden border border-gray-200/60 bg-white/80 shadow-md backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:border-gray-700/60 dark:bg-gray-900/80 dark:shadow-gray-600 dark:hover:shadow-gray-600/30"
            >
              {/* Animated border gradient */}
              <div className="from-primary/10 dark:from-primary/20 dark:to-primary/20 to-primary/10 absolute inset-0 rounded-lg bg-gradient-to-r via-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="absolute inset-[1px] rounded-lg" />

              {/* Content */}
              <div className="relative z-10">
                <CardHeader className="pt-0 pb-3">
                  <div className="mb-4 flex items-center justify-between gap-2">
                    {chair.type && (
                      <Badge variant="secondary">{chair.type}</Badge>
                    )}
                    <div className="flex-1" />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 dark:text-red-400">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mb-4 flex justify-center">
                    <div className="relative">
                      <div className="from-primary/10 to-primary/5 ring-primary/20 flex h-18 w-18 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br ring-1 transition-transform duration-300 group-hover:scale-110">
                        <Armchair className="text-primary group-hover:text-primary/80 h-8 w-8 transition-colors duration-300" />
                      </div>
                    </div>
                  </div>
                  <CardTitle className="text-center text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {chair.name}
                  </CardTitle>
                </CardHeader>

                <CardContent className="px-6 pb-6">
                  <div className="space-y-3">
                    {/* Status Indicator with Animation */}
                    <div className="flex items-center justify-center gap-4">
                      <div className="flex items-center gap-1">
                        <div className="relative">
                          <span
                            className={`absolute inline-flex h-3 w-3 rounded-full ${getStatusIndicatorColor(chair.status)} animate-ping opacity-75`}
                          />
                          <span
                            className={`relative inline-flex h-3 w-3 rounded-full ${getStatusIndicatorColor(chair.status)} border-2 border-white`}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {formatChoiceFieldValue(chair.status) || "UNKNOWN"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Total Count and Pagination */}
      <div className="flex items-center justify-between">
        <div>
          {chairsData && chairsData.count > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total: {chairsData.count} chair{chairsData.count !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        <div>
          {chairsData && chairsData.count > chairsData.results.length && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={!chairsData.previous || isFetching}
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
                disabled={!chairsData.next || isFetching}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChairsTab;
