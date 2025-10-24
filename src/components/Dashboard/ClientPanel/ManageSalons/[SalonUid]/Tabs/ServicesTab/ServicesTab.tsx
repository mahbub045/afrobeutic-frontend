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
import { PenBox, Search, Trash2 } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import * as React from "react";

export interface ServiceProps {
  uid: string;
  name: string;
  category: string;
  price: string;
  description?: string;
  images?: string[];
}

const sampleServices: ServiceProps[] = [
  {
    uid: "svc_1",
    name: "Classic Haircut",
    category: "Hair",
    price: "₦3,500",
    description: "A classic men's haircut with clipper and scissor finish.",
    images: ["/images/common/loader/placeholder.png"],
  },
  {
    uid: "svc_2",
    name: "Deep Conditioning",
    category: "Treatment",
    price: "₦2,000",
    description:
      "Intensive conditioning treatment to restore moisture and shine.",
  },
];

const ServicesTab: React.FC = () => {
  const { salonuid } = useParams();
  // RTK Hook
  const { data: servicesData, isLoading } = useGetServicesDataQuery({
    salonUid: salonuid,
  });

  // The API returns a paginated object: { count, next, previous, results: Service[] }
  // Normalize the response into an array of ServiceProps where images is an array of string URLs
  type ApiImage = {
    uid: string;
    image: string;
    order: number;
    is_primary: boolean;
  };

  type ApiService = Omit<ServiceProps, "images"> & { images?: ApiImage[] };

  const rawServices: ApiService[] = servicesData?.results ?? [];

  const services: ServiceProps[] = rawServices.map((s) => ({
    uid: s.uid,
    name: s.name,
    category: s.category,
    price: s.price,
    description: s.description,
    images: s.images?.map((img) => img.image) ?? [],
  }));

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
            <TableHead className="max-w-[36rem]">Description</TableHead>
            <TableHead>Images</TableHead>
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
          ) : services.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-muted-foreground py-6 text-center text-sm"
              >
                No services found.
              </TableCell>
            </TableRow>
          ) : (
            services.map((service: ServiceProps) => (
              <TableRow key={service.uid}>
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell>{service.category}</TableCell>
                <TableCell>{formatPrice(service.price)}</TableCell>
                <TableCell className="max-w-sm truncate">
                  {service.description ?? "—"}
                </TableCell>
                <TableCell>
                  {service.images && service.images.length > 0 ? (
                    <div className="flex items-center -space-x-2">
                      {service.images.slice(0, 3).map((src, i) => (
                        <Image
                          key={i}
                          src={src}
                          alt={`${service.name}-${i}`}
                          width={32}
                          height={24}
                          className="ring-muted/30 rounded-md object-cover ring-1"
                        />
                      ))}
                      {service.images.length > 3 && (
                        <span className="ml-2 text-sm">
                          +{service.images.length - 3}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="flex justify-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-primary/80 hover:text-primary dark:shadow-gray-600"
                  >
                    <PenBox />
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
        <div>{services.length} services</div>
        <div>dfd</div>
      </div>
    </>
  );
};

export default ServicesTab;
