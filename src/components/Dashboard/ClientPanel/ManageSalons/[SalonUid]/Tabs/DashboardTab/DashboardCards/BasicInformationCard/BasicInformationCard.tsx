import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { countries } from "@/data/countries";
import { useEffectiveRole } from "@/hooks/use-effective-role";
import { formatChoiceFieldValue } from "@/lib/utils";
import { DashboardTabProps } from "@/Types/ClientPanel/ManageSalonTypes/SalonListType";
import { MapPin, PenSquare, Scissors } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import EditBasicInfoDialog from "./Dialogs/EditBasicInfoDialog";

const BasicInformationCard: React.FC<DashboardTabProps> = ({
  singleSalonData,
  isLoading,
}) => {
  const { data: session } = useSession();
  const { canManageClientAccount } = useEffectiveRole(session);
  const [openBasicInfoEditDialog, setOpenBasicInfoEditDialog] = useState(false);

  const handleOpenBasicInfoEditDialog = () => {
    setOpenBasicInfoEditDialog(true);
  };

  return (
    <Card className="shadow-md dark:shadow-gray-600">
      <CardHeader className="flex items-start justify-between gap-4 px-6">
        {isLoading ? (
          <>
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />

              <div>
                <Skeleton className="h-4 w-36" />
                <Skeleton className="mt-2 h-3 w-48" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-16 rounded" />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <Avatar className="size-12">
                <AvatarImage src={singleSalonData?.logo || ""} alt="avatar" />
                <AvatarFallback>
                  <Scissors className="size-6" />
                </AvatarFallback>
              </Avatar>

              <div>
                <CardTitle className="text-base">
                  {singleSalonData?.name}
                </CardTitle>
                <CardDescription className="mt-1 text-sm">
                  Your salon profile at a glance
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="secondary">
                {singleSalonData?.salon_type
                  ? formatChoiceFieldValue(singleSalonData.salon_type)
                  : "Not Specified"}
              </Badge>
              {canManageClientAccount && (
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Edit basic information"
                  className="shadow-md dark:shadow-gray-600"
                  onClick={handleOpenBasicInfoEditDialog}
                >
                  <PenSquare className="size-3" />
                  Edit
                </Button>
              )}
            </div>
          </>
        )}
      </CardHeader>

      <Separator />

      <CardContent className="grid grid-cols-1 gap-4 px-6 sm:grid-cols-2">
        {/* Address details span full width on small screens; stays in grid on larger */}
        <div className="col-span-1 mt-2 sm:col-span-2">
          {isLoading ? (
            <Skeleton className="h-4 w-26" />
          ) : (
            <p className="text-muted-foreground flex items-center gap-1 text-xs font-semibold tracking-wide uppercase">
              <MapPin className="text-muted-foreground size-4" />
              Address
            </p>
          )}

          {isLoading ? (
            <div className="mt-2 grid grid-cols-2 gap-6">
              <div className="flex flex-col">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-2 h-4 w-full" />
              </div>

              <div className="flex flex-col">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="mt-2 h-4 w-full" />
              </div>

              <div className="flex flex-col">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="mt-2 h-4 w-full" />
              </div>

              <div className="flex flex-col">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="mt-2 h-4 w-full" />
              </div>

              <div className="flex flex-col">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="mt-2 h-4 w-full" />
              </div>

              <div className="flex flex-col">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="mt-2 h-4 w-full" />
              </div>
            </div>
          ) : (
            <>
              <div className="mt-2 grid grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <p className="text-muted-foreground text-xs uppercase">
                    Address
                  </p>
                  <p className="text-foreground mt-1 text-sm">
                    {singleSalonData?.formatted_address || "Not Specified"}
                  </p>
                </div>

                <div className="flex flex-col">
                  <p className="text-muted-foreground text-xs uppercase">
                    City
                  </p>
                  <p className="text-foreground mt-1 text-sm">
                    {singleSalonData?.city}
                  </p>
                </div>

                <div className="flex flex-col">
                  <p className="text-muted-foreground text-xs uppercase">
                    Postal Code
                  </p>
                  <p className="text-foreground mt-1 text-sm">
                    {singleSalonData?.postal_code}
                  </p>
                </div>

                <div className="flex flex-col">
                  <p className="text-muted-foreground text-xs uppercase">
                    Country
                  </p>
                  <p className="text-foreground mt-1 text-sm">
                    {(() => {
                      // salon may store a 2-letter country code or full name
                      const stored = singleSalonData?.country;
                      if (!stored) return "-";

                      // If stored looks like a 2-letter code, try to resolve
                      const code =
                        typeof stored === "string" && stored.length === 2
                          ? stored.toUpperCase()
                          : null;
                      if (code) {
                        const found = countries.find((c) => c.code === code);
                        if (found) return found.name;
                      }

                      // Otherwise return the stored value (possibly full name)
                      return stored;
                    })()}
                  </p>
                </div>
              </div>
              {/* <div className="mt-6">
                <div className="flex justify-between">
                  <p className="text-muted-foreground text-xs uppercase">
                    Google Location Link
                  </p>
                  <div className="ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyLocation}
                      aria-label="Copy location link"
                      disabled={!singleSalonData?.address}
                      className="flex items-center gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="size-4 text-green-500" />
                        </>
                      ) : (
                        <>
                          <Copy className="size-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <p className="text-foreground -mt-4 text-sm">
                  {singleSalonData?.address || "-"}
                </p>
              </div> */}
            </>
          )}
        </div>
      </CardContent>
      <EditBasicInfoDialog
        singleSalonData={singleSalonData}
        isOpen={openBasicInfoEditDialog}
        onClose={() => setOpenBasicInfoEditDialog(false)}
      />
    </Card>
  );
};

export default BasicInformationCard;
