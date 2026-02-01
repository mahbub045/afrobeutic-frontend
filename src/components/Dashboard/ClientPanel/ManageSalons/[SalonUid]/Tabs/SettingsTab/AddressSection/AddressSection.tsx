import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { countries } from "@/data/countries";
import { DashboardTabProps } from "@/Types/ClientPanel/ManageSalonTypes/SalonListType";
import { MapPin, Pencil } from "lucide-react";

const AddressSection: React.FC<DashboardTabProps> = ({
  singleSalonData,
  isLoading,
}) => {
  return (
    <div>
      <Card className="border-0 shadow-md transition-shadow duration-300 hover:shadow-lg dark:shadow-gray-600">
        <CardContent className="p-4">
          <div className="mb-6 flex items-center justify-between">
            {isLoading ? (
              <Skeleton className="h-6 w-32" />
            ) : (
              <h2 className="flex gap-2 text-xl font-bold text-gray-900 dark:text-white">
                <MapPin /> Address
              </h2>
            )}

            {isLoading ? (
              <Skeleton className="h-8 w-16 rounded" />
            ) : (
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4" /> Edit
              </Button>
            )}
          </div>

          <div className="space-y-5">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-48" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                    Street
                  </p>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                    {[
                      singleSalonData?.address_one,
                      singleSalonData?.address_two,
                    ]
                      .filter(Boolean)
                      .join(", ") || "Not Specified"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                      City
                    </p>
                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                      {singleSalonData?.city || "Not Specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                      Postal Code
                    </p>
                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                      {singleSalonData?.postal_code || "Not Specified"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                    Country
                  </p>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                    {(() => {
                      const stored = singleSalonData?.country;
                      if (!stored) return "Not Specified";

                      const code =
                        typeof stored === "string" && stored.length === 2
                          ? stored.toUpperCase()
                          : null;
                      if (code) {
                        const found = countries.find((c) => c.code === code);
                        if (found) return found.name;
                      }

                      return stored;
                    })()}
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddressSection;
