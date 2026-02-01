import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatChoiceFieldValue } from "@/lib/utils";
import { DashboardTabProps } from "@/Types/ClientPanel/ManageSalonTypes/SalonListType";
import { Pencil, Scissors } from "lucide-react";
import React, { useState } from "react";
import EditProfileDialog from "../Dialogs/EditProfileDialog";

const SalonProfileCard: React.FC<DashboardTabProps> = ({
  singleSalonData,
  isLoading,
}) => {
  const [openEditProfileDialog, setOpenEditProfileDialog] = useState(false);

  return (
    <Card className="border-0 bg-gradient-to-br from-slate-50 to-slate-100 shadow-md transition-shadow duration-300 hover:shadow-lg dark:from-slate-950 dark:to-slate-900 dark:shadow-gray-900">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-5">
            <div className="relative">
              {isLoading ? (
                <Skeleton className="h-24 w-24 rounded-full border-4 border-white shadow-lg dark:border-slate-800 dark:shadow-gray-800" />
              ) : (
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg dark:border-slate-800 dark:shadow-gray-800">
                  <AvatarImage src={singleSalonData?.logo || ""} alt="avatar" />
                  <AvatarFallback>
                    <Scissors className="size-6" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
            <div>
              {isLoading ? (
                <>
                  <Skeleton className="mb-2 h-6 w-48" />
                  <Skeleton className="mb-2 h-4 w-36" />
                  <Skeleton className="mt-2 h-6 w-24 rounded-full" />
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {singleSalonData?.name || "Salon 1"}
                  </h1>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Your salon profile at a glance
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    {formatChoiceFieldValue(singleSalonData?.salon_type) ||
                      "Not Specified"}
                  </Badge>
                </>
              )}
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-20 rounded-md" />
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenEditProfileDialog(true)}
            >
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          )}
        </div>
      </CardContent>

      <EditProfileDialog
        singleSalonData={singleSalonData}
        isOpen={openEditProfileDialog}
        onClose={() => setOpenEditProfileDialog(false)}
      />
    </Card>
  );
};

export default SalonProfileCard;
