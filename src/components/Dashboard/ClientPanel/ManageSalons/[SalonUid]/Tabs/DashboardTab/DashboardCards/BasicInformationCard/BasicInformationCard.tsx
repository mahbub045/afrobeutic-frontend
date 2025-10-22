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
import { DashboardTabProps } from "@/Types/ClientPanel/ManageSalonTypes/SalonListType";
import { MapPin, PenSquare, Scissors } from "lucide-react";
import React from "react";

const BasicInformationCard: React.FC<DashboardTabProps> = ({
  singleSalonData,
  isLoading,
  isError,
}) => {
  // Sample data - replace with props or data fetching as needed
  const salonName = "Afrobeutic Salon";
  const salonType = "Unisex";
  const street = "12 Example Street";
  const city = "Lagos";
  const zip = "100001";
  const country = "Nigeria";

  return (
    <Card className="shadow-md dark:shadow-gray-600">
      <CardHeader className="flex items-start justify-between gap-4 px-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-12">
            <AvatarImage src={singleSalonData?.logo || ""} alt="salon avatar" />
            <AvatarFallback>
              <Scissors className="size-6" />
            </AvatarFallback>
          </Avatar>

          <div>
            <CardTitle className="text-base">{singleSalonData?.name}</CardTitle>
            <CardDescription className="mt-1 text-sm">
              Your salon profile at a glance
            </CardDescription>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-white">
            {salonType}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            aria-label="Edit basic information"
          >
            <PenSquare className="size-4" />
            Edit
          </Button>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="grid grid-cols-1 gap-4 px-6 pb-6 sm:grid-cols-2">
        {/* Address details span full width on small screens; stays in grid on larger */}
        <div className="col-span-1 mt-2 sm:col-span-2">
          <p className="text-muted-foreground flex items-center gap-1 text-xs font-semibold tracking-wide">
            <MapPin className="text-muted-foreground size-4" />
            ADDRESS
          </p>
          <div className="mt-2 grid grid-cols-2 gap-6">
            <div className="flex flex-col">
              <p className="text-muted-foreground text-xs uppercase">Street</p>
              <p className="text-foreground mt-1 text-sm">
                {singleSalonData?.street}
              </p>
            </div>

            <div className="flex flex-col">
              <p className="text-muted-foreground text-xs uppercase">City</p>
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
              <p className="text-muted-foreground text-xs uppercase">Country</p>
              <p className="text-foreground mt-1 text-sm">{singleSalonData?.country}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicInformationCard;
