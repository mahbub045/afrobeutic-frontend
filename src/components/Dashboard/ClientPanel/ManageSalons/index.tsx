"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import Breadcrumbs from "../../CommonComponents/Breadcrumbs";

export interface SalonProps {
  id: string;
  name: string;
  description?: string;
}

const mockSalonsData: SalonProps[] = [
  { id: "1", name: "Test1 Salon", description: "lorem ipsum dolor sit amet" },
  { id: "2", name: "Test2 Salon", description: "lorem ipsum dolor sit amet" },
  { id: "3", name: "Test3 Salon", description: "lorem ipsum dolor sit amet" },
  { id: "4", name: "Test4 Salon", description: "lorem ipsum dolor sit amet" },
  { id: "5", name: "Test5 Salon", description: "lorem ipsum dolor sit amet" },
  { id: "6", name: "Test6 Salon", description: "lorem ipsum dolor sit amet" },
  // Add more mock items as needed
];

const ManageSalonsContainer: React.FC = () => {
  const salons = mockSalonsData;

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard/client-panel" },
          {
            label: "Manage Salons",
            href: "/dashboard/client-panel/manage-salons",
          },
        ]}
      />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Manage Salons</h1>
        <Button asChild variant="default" size="sm">
          <Link
            href="/dashboard/client-panel/manage-salons/new"
            className="inline-flex items-center gap-2 text-white"
          >
            <Plus className="h-4 w-4" />
            Add new Salon
          </Link>
        </Button>
      </div>

      <div className="mt-6">
        {salons.length === 0 ? (
          <div className="bg-muted rounded-md border p-6 text-center">
            <p className="text-muted-foreground">
              No salons yet. Click the button above to add your first salon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {salons.map((s) => (
              <Card
                key={s.id}
                className="relative shadow-md dark:shadow-gray-600"
              >
                <CardHeader>
                  <CardTitle className="text-center">{s.name}</CardTitle>
                  <CardAction />
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground text-center text-sm">
                    {s.description}
                  </div>
                </CardContent>
                <CardFooter>
                  <Link
                    href={`/dashboard/client-panel/manage-salons/${s.id}`}
                    className="text-primary group ml-auto inline-flex items-center gap-2 text-sm hover:underline"
                  >
                    Explore{" "}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageSalonsContainer;
