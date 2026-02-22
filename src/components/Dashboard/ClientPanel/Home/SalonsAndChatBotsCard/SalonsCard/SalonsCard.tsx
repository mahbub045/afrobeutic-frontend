"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetSalonListQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/SalonApi";
import { AlertCircle, Plus, Scissors } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import AddSalonDialog from "../../../ManageSalons/Dialogs/AddSalonDialog";

const SalonsCard: React.FC = () => {
  const { data: session } = useSession();
  const { data: salonsData, isLoading, isError } = useGetSalonListQuery();
  const [isAddSalonDialogOpen, setIsAddSalonDialogOpen] = useState(false);

  const handleOpenAddSalonDialog = () => {
    setIsAddSalonDialogOpen(true);
  };

  return (
    <Card className="h-full shadow-md dark:shadow-gray-600">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold">My Salons</CardTitle>
        {(session?.user?.role === "OWNER" || session?.user?.role === "ADMIN") &&
          (session?.user?.account_type !== "INDIVIDUAL_STYLIST" ||
            (salonsData?.count || 0) < 1) && (
            <Button
              variant="default"
              size="sm"
              className="text-white"
              onClick={handleOpenAddSalonDialog}
            >
              <Plus className="h-4 w-4" />
              Add new Salon
            </Button>
          )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-lg border p-4"
              >
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-red-300 bg-red-50/50 p-8 text-center dark:border-red-700 dark:bg-red-900/50">
            <div className="space-y-2">
              <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
              <p className="text-sm text-red-600 dark:text-red-400">
                Failed to load salons
              </p>
            </div>
          </div>
        ) : !salonsData?.results || salonsData.results.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center dark:border-gray-700 dark:bg-gray-900/50">
            <div className="space-y-2">
              <Scissors className="text-muted-foreground/50 mx-auto h-10 w-10" />
              <p className="text-muted-foreground text-sm">No salons yet</p>
              <p className="text-muted-foreground text-xs">
                Click the Add button to create your first salon
              </p>
            </div>
          </div>
        ) : (
          <div className="max-h-[340px] space-y-3 overflow-y-auto pr-2">
            {salonsData.results.slice(0, 7).map((salon) => (
              <Link
                key={salon.uid}
                href={`/dashboard/client-panel/manage-salons/${salon.uid}`}
              >
                <div className="bg-card hover:bg-accent/50 mb-3 flex items-start gap-3 rounded-lg border p-4 shadow-md transition-colors dark:shadow-gray-600">
                  <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                    {salon?.logo ? (
                      <Image
                        src={salon.logo}
                        alt={salon.name}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <Scissors className="text-primary h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-sm leading-none font-medium">
                      {salon.name}
                    </h4>
                    <p className="text-muted-foreground text-xs">
                      {salon.city || "No location"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
            {salonsData.count > 7 && (
              <Link href="/dashboard/client-panel/manage-salons">
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  View All Salons ({salonsData.count})
                </Button>
              </Link>
            )}
          </div>
        )}
      </CardContent>
      {/* Dialogs */}
      <AddSalonDialog
        isOpen={isAddSalonDialogOpen}
        onClose={() => setIsAddSalonDialogOpen(false)}
      />
    </Card>
  );
};

export default SalonsCard;
