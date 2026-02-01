import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardTabProps } from "@/Types/ClientPanel/ManageSalonTypes/SalonListType";
import { BriefcaseBusiness, Pencil } from "lucide-react";

const ProfessionalCareer: React.FC<DashboardTabProps> = ({
  singleSalonData,
  isLoading,
}) => {
  return (
    <Card className="border-0 shadow-md transition-shadow duration-300 hover:shadow-lg dark:shadow-gray-600">
      <CardContent className="p-4">
        <div className="mb-6 flex items-center justify-between">
          {isLoading ? (
            <Skeleton className="h-6 w-56" />
          ) : (
            <h2 className="flex gap-2 text-xl font-bold text-gray-900 dark:text-white">
              <BriefcaseBusiness /> Professional Career
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

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <p className="leading-relaxed text-gray-700 dark:text-gray-300">
            {singleSalonData?.professional_career_details ||
              "No professional career details provided."}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfessionalCareer;
