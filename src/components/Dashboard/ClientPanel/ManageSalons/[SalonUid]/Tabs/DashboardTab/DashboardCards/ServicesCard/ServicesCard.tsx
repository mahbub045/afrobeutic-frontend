import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Cog } from "lucide-react";
import React from "react";

const ServicesCard: React.FC = () => {
  // sample data - replace with real data
  const services = [
    { id: 1, name: "Haircut", category: "Hair", price: 50 },
    { id: 2, name: "Glamour Lounge", category: "Nails", price: 10 },
    { id: 3, name: "Chic Cuts", category: "Hair", price: 0 },
    { id: 4, name: "Classic Shave", category: "Hair", price: 15 },
    { id: 5, name: "Spa Pedicure", category: "Nails", price: 25 },
    { id: 6, name: "Color Treatment", category: "Hair", price: 40 },
  ];

  return (
    <Card className="shadow-md dark:shadow-gray-600">
      <CardHeader className="flex items-center justify-between px-6 py-4">
        <CardTitle className="text-sm">Services</CardTitle>
        <CardAction>
          <Button variant="outline" size="sm">
            View all
          </Button>
        </CardAction>
      </CardHeader>

      <Separator />

      <CardContent className="px-4 pb-4">
        <div className="space-y-4">
          {services.slice(0, 4).map((service) => (
            <div
              key={service.id}
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
                ${service.price ? service.price.toFixed(1) : "0.0"}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServicesCard;
