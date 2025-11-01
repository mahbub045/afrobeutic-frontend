"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetChairsDataQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Chairs/ChairsApi";
import { Armchair, Edit, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import * as React from "react";

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
  // RTK Hooks
  const { data: chairsData, isLoading } = useGetChairsDataQuery({
    salonUid: salonUid,
  });
  const extractedChairs: ChairProps[] = chairsData?.results ?? [];

  // Helper function to get status color
  const getStatusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case "AVAILABLE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "OCCUPIED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "MAINTENANCE":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  // Helper function to get status indicator color (dot animation)
  const getStatusIndicatorColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case "AVAILABLE":
        return "bg-green-600";
      case "OCCUPIED":
        return "bg-blue-600";
      case "MAINTENANCE":
        return "bg-yellow-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold md:text-2xl">Chairs Management</h2>
        <Button variant="default">
          Add Chair
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(12)].map((_, idx) => (
            <Card
              key={`chair-skeleton-${idx}`}
              className="relative overflow-hidden border border-gray-200/60 bg-white/80 shadow-md dark:border-gray-700/60 dark:bg-gray-900/80"
            >
              <CardHeader className="pt-6 pb-4">
                <div className="mb-4 flex justify-center">
                  <Skeleton className="h-18 w-18 rounded-full" />
                </div>
                <Skeleton className="mx-auto h-6 w-3/4" />
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <div className="flex justify-center">
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <div className="flex justify-center pt-2">
                    <Skeleton className="h-6 w-32 rounded-full" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2 px-6 pt-0 pb-6">
                <Skeleton className="h-10 flex-1 rounded-lg" />
                <Skeleton className="h-10 flex-1 rounded-lg" />
              </CardFooter>
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
                <CardHeader className="pt-6 pb-4">
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
                    {/* Type Badge */}
                    {chair.type && (
                      <div className="flex justify-center">
                        <Badge
                          variant="secondary"
                          className="rounded-full px-3 py-1"
                        >
                          {chair.type}
                        </Badge>
                      </div>
                    )}

                    {/* Status Indicator with Animation */}
                    <div className="flex items-center justify-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <span
                            className={`absolute inline-flex h-3 w-3 rounded-full ${getStatusIndicatorColor(chair.status)} animate-ping opacity-75`}
                          />
                          <span
                            className={`relative inline-flex h-3 w-3 rounded-full ${getStatusIndicatorColor(chair.status)} border-2 border-white`}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {chair.status || "UNKNOWN"}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex justify-center pt-2">
                      <Badge
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(chair.status)}`}
                      >
                        {chair.status || "Unknown"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex gap-2 px-6 pt-0 pb-6">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </CardFooter>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChairsTab;
