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
import { ArrowRight, Plus, Scissors } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import Breadcrumbs from "../../CommonComponents/Breadcrumbs";

export interface SalonProps {
  uid: string;
  name: string;
  description?: string;
}

const mockSalonsData: SalonProps[] = [
  { uid: "1", name: "Test1 Salon", description: "lorem ipsum dolor sit amet" },
  { uid: "2", name: "Test2 Salon", description: "lorem ipsum dolor sit amet" },
  { uid: "3", name: "Test3 Salon", description: "lorem ipsum dolor sit amet" },
  { uid: "4", name: "Test4 Salon", description: "lorem ipsum dolor sit amet" },
  { uid: "5", name: "Test5 Salon", description: "lorem ipsum dolor sit amet" },
  { uid: "6", name: "Test6 Salon", description: "lorem ipsum dolor sit amet" },
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
                key={s.uid}
                className="group hover:shadow-primary/10 relative overflow-hidden border border-gray-200/60 bg-white/80 shadow-md backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:border-gray-700/60 dark:bg-gray-900/80 dark:shadow-gray-600 dark:hover:shadow-gray-600/30"
              >
                {/* Animated border gradient */}
                <div className="from-primary/20 to-primary/20 absolute inset-0 rounded-lg bg-gradient-to-r via-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="absolute inset-[1px] rounded-lg bg-white dark:bg-gray-900" />

                {/* Content */}
                <div className="relative z-10">
                  <CardHeader className="pt-6 pb-4">
                    <div className="mb-4 flex justify-center">
                      <div className="relative">
                        <div className="from-primary/10 to-primary/5 ring-primary/20 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ring-1 transition-transform duration-300 group-hover:scale-110">
                          <Scissors className="text-primary group-hover:text-primary/80 h-8 w-8 transition-colors duration-300" />
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-center text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                      {s.name}
                    </CardTitle>
                    <CardAction />
                  </CardHeader>

                  <CardContent className="px-6 pb-6">
                    <p className="text-muted-foreground text-center text-sm leading-6">
                      {s.description}
                    </p>

                    {/* Stats or features */}
                    <div className="text-muted-foreground mt-4 flex items-center justify-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                        <span>Active</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="px-6 pt-0 pb-6">
                    <Link
                      href={`/dashboard/client-panel/manage-salons/${s.uid}`}
                      className="group/btn block w-full"
                    >
                      <div className="border-primary/20 bg-primary/5 hover:bg-primary hover:shadow-primary/25 flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-all duration-300 hover:!text-white hover:shadow-lg">
                        <span className="text-primary transition-colors duration-300 group-hover/btn:!text-white">
                          Explore Salon
                        </span>
                        <ArrowRight className="text-primary h-4 w-4 transition-all duration-300 group-hover/btn:translate-x-1 group-hover/btn:!text-white" />
                      </div>
                    </Link>
                  </CardFooter>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageSalonsContainer;
