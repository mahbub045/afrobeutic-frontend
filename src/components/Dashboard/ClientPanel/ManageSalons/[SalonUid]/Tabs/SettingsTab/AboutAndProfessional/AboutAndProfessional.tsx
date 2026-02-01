"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardTabProps } from "@/Types/ClientPanel/ManageSalonTypes/SalonListType";
import { Info, Pencil } from "lucide-react";
import React, { useState } from "react";
import EditAboutSalonDialog from "../Dialogs/EditAboutSalonDialog";

const AboutAndProfessional: React.FC<DashboardTabProps> = ({
  singleSalonData,
  isLoading,
}) => {
  const [openAboutDialog, setOpenAboutDialog] = useState(false);

  return (
    <Card className="border-0 shadow-md transition-shadow duration-300 hover:shadow-lg dark:shadow-gray-600">
      <CardContent className="p-4">
        <div className="mb-6 flex items-center justify-between">
          {isLoading ? (
            <Skeleton className="h-6 w-40" />
          ) : (
            <h2 className="flex gap-2 text-xl font-bold text-gray-900 dark:text-white">
              <Info /> About Salon
            </h2>
          )}

          {isLoading ? (
            <Skeleton className="h-8 w-16 rounded" />
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenAboutDialog(true)}
            >
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <p className="leading-relaxed text-gray-700 dark:text-gray-300">
            {singleSalonData?.about_salon || "No about salon details provided."}
          </p>
        )}

        <EditAboutSalonDialog
          singleSalonData={singleSalonData}
          isOpen={openAboutDialog}
          onClose={() => setOpenAboutDialog(false)}
        />
      </CardContent>
    </Card>
  );
};

export default AboutAndProfessional;
