"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetSalonListQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/SalonList/SalonListApi";
import { SalonProps } from "@/Types/ClientPanel/ManageSalonTypes/SalonListType";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Plus,
  Scissors,
  Search,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import Breadcrumbs from "../../CommonComponents/Breadcrumbs";

const ManageSalonsContainer: React.FC = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  // Track which salon logos failed to load (by uid)
  const [failedLogos, setFailedLogos] = React.useState<Record<string, boolean>>(
    {},
  );

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page on new search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // RTK hook
  const {
    data: salonListData,
    isLoading,
    isFetching,
  } = useGetSalonListQuery({
    page: currentPage,
    search: debouncedSearch || undefined,
  });

  const handlePreviousPage = () => {
    if (salonListData?.previous) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (salonListData?.next) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const totalPages = salonListData?.count
    ? Math.ceil(salonListData.count / (salonListData.results?.length || 1))
    : 0;

  return (
    <div className="container mx-auto space-y-6 px-4 py-6 md:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard/client-panel" },
          {
            label: "Manage Salons",
            href: "/dashboard/client-panel/manage-salons",
          },
        ]}
      />

      {/* Header with Search and Add Button */}
      <div className="flex w-full flex-col items-stretch justify-between gap-3 sm:items-center sm:gap-4 md:flex-row">
        <h1 className="text-2xl font-semibold md:text-lg lg:text-2xl">
          Manage Salons
        </h1>

        <div className="relative min-w-sm md:min-w-xs lg:min-w-sm">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            type="text"
            placeholder="Search salons by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="!px-8"
          />
        </div>

        <Button variant="default" size="sm" className="text-white">
          <Plus className="h-4 w-4" />
          Add new Salon
        </Button>
      </div>

      {/* Content */}
      <div className="mt-6">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, idx) => (
              <Card
                key={`salon-skeleton-${idx}`}
                className="relative overflow-hidden border border-gray-200/60 bg-white/80 shadow-md dark:border-gray-700/60 dark:bg-gray-900/80"
              >
                <CardHeader className="pt-6 pb-4">
                  <div className="mb-4 flex justify-center">
                    <Skeleton className="h-16 w-16 rounded-2xl" />
                  </div>
                  <Skeleton className="mx-auto h-6 w-3/4" />
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <Skeleton className="mx-auto h-4 w-full" />
                  <Skeleton className="mx-auto mt-2 h-4 w-2/3" />
                </CardContent>
                <CardFooter className="px-6 pt-0 pb-6">
                  <Skeleton className="h-12 w-full rounded-lg" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : !salonListData?.results || salonListData.results.length === 0 ? (
          <div className="bg-muted rounded-md border p-6 text-center">
            <p className="text-muted-foreground">
              {searchTerm
                ? "No salons found matching your search."
                : "No salons yet. Click the button above to add your first salon."}
            </p>
            {searchTerm && (
              <Button
                variant="link"
                onClick={() => setSearchTerm("")}
                className="text-danger mt-2"
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {salonListData.results.map((s: SalonProps) => (
              <Card
                key={s.uid}
                className="group hover:shadow-primary/10 relative overflow-hidden border border-gray-200/60 bg-white/80 shadow-md backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:border-gray-700/60 dark:bg-gray-900/80 dark:shadow-gray-600 dark:hover:shadow-gray-600/30"
              >
                {/* Animated border gradient */}
                <div className="from-primary/20 to-primary/20 absolute inset-0 rounded-lg bg-gradient-to-r via-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="absolute inset-[1px] rounded-lg bg-white dark:bg-gray-900" />

                {/* Content */}
                <div className="relative z-10">
                  <CardHeader className="pt-6 pb-4">
                    <div className="mb-4 flex justify-center">
                      <div className="relative">
                        <div className="from-primary/10 to-primary/5 ring-primary/20 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ring-1 transition-transform duration-300 group-hover:scale-110">
                          {/* Render salon logo if available and not failed, otherwise show Scissors icon */}
                          {s.salon_logo && !failedLogos[s.uid] ? (
                            <Image
                              src={s.salon_logo}
                              alt={`${s.name} logo`}
                              width={64}
                              height={64}
                              className="h-16 w-16 object-cover"
                              unoptimized
                              onError={() =>
                                setFailedLogos((prev) => ({
                                  ...prev,
                                  [s.uid]: true,
                                }))
                              }
                            />
                          ) : (
                            <Scissors className="text-primary group-hover:text-primary/80 h-8 w-8 transition-colors duration-300" />
                          )}
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-center text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                      {s.name}
                    </CardTitle>
                    <CardAction />
                  </CardHeader>

                  <CardContent className="px-6 pb-6">
                    <p className="text-muted-foreground text-center text-sm leading-6">
                      {s.description ||
                        `${s.city || "Location"} - ${s.salon_type || "Salon"}`}
                    </p>

                    {/* Stats or features */}
                    <div className="text-muted-foreground mt-4 flex items-center justify-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            s.status === "OPEN"
                              ? "animate-pulse bg-green-500"
                              : "bg-red-500"
                          }`}
                        ></div>
                        <span>{s.status || "Active"}</span>
                      </div>
                      {s.salon_type && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-medium">
                            {s.salon_type}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="px-6 pt-0 pb-6">
                    <Link
                      href={`/dashboard/client-panel/manage-salons/${s.uid}`}
                      className="group/btn block w-full"
                    >
                      <div className="border-primary/20 bg-primary/5 hover:bg-primary hover:shadow-primary/25 flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-all duration-300 hover:!text-white hover:shadow-lg">
                        <span className="text-primary transition-colors duration-300 group-hover/btn:!text-white">
                          Explore Salon
                        </span>
                        <ArrowRight className="text-primary h-4 w-4 transition-all duration-300 group-hover/btn:translate-x-1 group-hover/btn:!text-white" />
                      </div>
                    </Link>
                  </CardFooter>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-between p-2">
        <div>
          {salonListData && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total: {salonListData.count} salon
              {salonListData.count !== 1 ? "s" : ""}
            </div>
          )}
        </div>
        <div>
          {/* Pagination Controls */}
          {salonListData &&
            salonListData.count > salonListData.results.length && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={!salonListData.previous || isFetching}
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
                  disabled={!salonListData.next || isFetching}
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

export default ManageSalonsContainer;
