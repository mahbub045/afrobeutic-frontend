"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetServicesDataQuery } from "@/Redux/Reducers/ClientPanel/Services/ServicesApi";
import { ServiceProps } from "@/Types/ClientPanel/ServicesTypes/ServicesType";
import { Cog, Scissors } from "lucide-react";
import { useParams } from "next/navigation";
import React from "react";

const ServicesCard: React.FC = () => {
  const { salonuid } = useParams();
  const salonUid = Array.isArray(salonuid) ? salonuid[0] : (salonuid ?? "");

  const {
    data: servicesData,
    isLoading,
    isFetching,
  } = useGetServicesDataQuery({
    salonUid: salonUid,
  });
  const extractedServices: ServiceProps[] = servicesData?.results ?? [];

  return (
    <Card className="shadow-md dark:shadow-gray-600">
      <CardHeader className="flex items-center justify-between px-6 py-1">
        <div>
          <CardTitle className="text-sm">Services</CardTitle>
          <CardDescription className="text-muted-foreground mt-1 text-xs">
            Overview of your salon services
          </CardDescription>
        </div>
        <CardAction>
          <Button
            variant="outline"
            size="sm"
            className="shadow-md dark:shadow-gray-600"
          >
            View all
          </Button>
        </CardAction>
      </CardHeader>

      <Separator />

      <CardContent className="px-4 pb-4">
        {/* Loading state */}
        {isLoading || isFetching ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-muted/10 flex items-center justify-between gap-12 rounded-xl px-4 py-3 shadow-md"
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />

                  <div className="min-w-0">
                    <Skeleton className="mb-2 h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>

                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        ) : /* No data message */ extractedServices.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center dark:border-gray-700 dark:bg-gray-900/50">
            <div className="space-y-2">
              <Scissors className="text-muted-foreground/50 mx-auto h-10 w-10" />
              <p className="text-muted-foreground text-sm">No services yet</p>
              <p className="text-muted-foreground text-xs">
                Click the Add button to create your first service
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {extractedServices.slice(0, 4).map((service) => (
              <div
                key={service.uid}
                className="bg-muted/10 flex items-center justify-between gap-12 rounded-xl px-4 py-3 shadow-md hover:shadow-lg dark:shadow-gray-600"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="bg-secondary/10 size-10">
                    <AvatarFallback>
                      <Cog className="text-primary size-6" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {service.name}
                    </p>
                    <p className="text-muted-foreground mt-1 truncate text-xs">
                      Category: {service.category}
                    </p>
                  </div>
                </div>

                <div className="text-muted-foreground text-sm font-medium">
                  ${service.price ? service.price : "0.0"}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServicesCard;
