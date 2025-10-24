"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetServicesDataQuery } from "@/Redux/Reducers/ClientPanel/Services/ServicesApi";
import { ServiceProps } from "@/Types/ClientPanel/ServicesTypes/ServicesType";
import { Eye, Search, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import * as React from "react";

const ServicesTab: React.FC = () => {
  const { salonuid } = useParams();
  // RTK Hook
  const { data: servicesData, isLoading } = useGetServicesDataQuery({
    salonUid: salonuid,
  });
  const extractedServices: ServiceProps[] = servicesData?.results ?? [];

  const formatPrice = (p?: string) => {
    if (!p) return "—";
    const n = Number(p);
    if (!Number.isFinite(n)) return p;
    // Format as US Dollar
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(n);
    } catch (e) {
      // Fallback to a simple dollar format
      return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  return (
    <>
      <div className="flex justify-between">
        <h2 className="mb-4 text-lg font-semibold">Services</h2>
        <div className="relative">
          <Search
            size={18}
            className="text-muted-foreground pointer-events-none absolute top-[10px] left-2"
          />
          <Input
            className="focus:!border-primary pl-7 focus:!ring-0"
            placeholder="Search services..."
          />
        </div>
        <Button size="sm" variant="default">
          Add New Service
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Updated At</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-muted-foreground py-6 text-center text-sm"
              >
                Loading services...
              </TableCell>
            </TableRow>
          ) : extractedServices.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-muted-foreground py-6 text-center text-sm"
              >
                No services found.
              </TableCell>
            </TableRow>
          ) : (
            extractedServices.map((service: ServiceProps) => (
              <TableRow key={service.uid}>
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell>{service.category}</TableCell>
                <TableCell>{formatPrice(service.price)}</TableCell>
                <TableCell>
                  {new Date(service?.created_at ?? "").toLocaleString()}
                </TableCell>
                <TableCell>
                  {new Date(service.updated_at ?? "").toLocaleString()}
                </TableCell>

                <TableCell className="flex justify-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-primary/80 hover:text-primary dark:shadow-gray-600"
                  >
                    <Eye />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-danger/80 hover:text-danger dark:shadow-gray-600"
                    color="red"
                  >
                    <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div className="flex justify-between px-2 py-4">
        <div>Total: {extractedServices.length} services</div>
        <div>dfd</div>
      </div>
    </>
  );
};

export default ServicesTab;
