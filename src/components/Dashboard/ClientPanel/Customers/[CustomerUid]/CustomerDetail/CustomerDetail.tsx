"use client";

import { useGetCustomerByIdQuery } from "@/Redux/Reducers/ClientPanel/Customers/CustomersApi";
import { CustomerProps } from "@/Types/ClientPanel/CustomersTypes/CustomersType";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  LoaderPinwheel,
  Phone,
  User,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React from "react";

const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case "PLACED":
      return "bg-blue-100 text-blue-800";
    case "INPROGRESS":
      return "bg-yellow-100 text-yellow-800";
    case "COMPLETED":
      return "bg-green-100 text-green-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    case "RESCHEDULED":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const CustomerDetail: React.FC = () => {
  const { customeruid } = useParams();
  const router = useRouter();
  const {
    data: customer,
    isLoading,
    error,
  } = useGetCustomerByIdQuery(customeruid as string);

  if (error) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2 shadow-md dark:shadow-gray-600"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load customer details. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoaderPinwheel className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2 shadow-md dark:shadow-gray-600"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Customer not found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const customerData: CustomerProps = customer;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2 shadow-md dark:shadow-gray-600"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Customer Details</h1>
        <div className="w-24" />
      </div>

      {/* Booking Summary Stats */}
      {(customerData.booking ?? []).length > 0 && (
        <Card className="shadow-md dark:shadow-gray-600">
          <CardHeader>
            <CardTitle>Booking Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-300">
                  Total Bookings
                </p>
                <p className="mt-2 text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {(customerData.booking ?? []).length}
                </p>
              </div>
              <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950">
                <p className="text-sm font-medium text-green-600 dark:text-green-300">
                  Completed
                </p>
                <p className="mt-2 text-2xl font-bold text-green-900 dark:text-green-100">
                  {
                    (customerData.booking ?? []).filter(
                      (b) => b.status === "COMPLETED",
                    ).length
                  }
                </p>
              </div>
              <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-950">
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-300">
                  Upcoming
                </p>
                <p className="mt-2 text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                  {
                    (customerData.booking ?? []).filter(
                      (b) =>
                        b.status === "PLACED" || b.status === "RESCHEDULED",
                    ).length
                  }
                </p>
              </div>
              <div className="rounded-lg bg-red-50 p-4 dark:bg-red-950">
                <p className="text-sm font-medium text-red-600 dark:text-red-300">
                  Cancelled
                </p>
                <p className="mt-2 text-2xl font-bold text-red-900 dark:text-red-100">
                  {
                    (customerData.booking ?? []).filter(
                      (b) => b.status === "CANCELLED",
                    ).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Info Card */}
      <Card className="shadow-md dark:shadow-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Name
              </label>
              <p className="mt-1 text-lg font-semibold">
                {customerData.first_name} {customerData.last_name}
              </p>
            </div>
            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Phone
              </label>
              <p className="mt-1 flex items-center gap-2 text-lg font-semibold">
                <Phone className="h-4 w-4" />
                {customerData.phone ?? "—"}
              </p>
            </div>
            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Customer ID
              </label>
              <p className="mt-1 font-mono text-sm">{customerData.uid}</p>
            </div>
            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Member Since
              </label>
              <p className="mt-1 text-sm">
                {new Date(customerData.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Section */}
      <Card className="shadow-md dark:shadow-gray-600">
        <CardHeader>
          <CardTitle>Bookings History</CardTitle>
          <CardDescription>
            {customerData.booking.length} booking
            {customerData.booking.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {customerData.booking.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              No bookings found
            </div>
          ) : (
            <div className="space-y-4">
              {(customerData.booking ?? []).map((booking) => {
                return (
                  <details
                    key={booking.uid}
                    className="group hover:bg-accent/50 rounded-lg border shadow-md dark:shadow-gray-600"
                  >
                    <summary className="flex cursor-pointer items-start justify-between gap-4 p-4">
                      <div className="flex flex-1 items-center gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">
                              {booking.booking_id}
                            </p>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-sm">
                            {new Date(
                              `${booking.booking_date}T${booking.booking_time}`,
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <ChevronRight className="h-4 w-4 transition-transform duration-200 group-open:rotate-90" />
                      </div>
                    </summary>

                    <div className="space-y-3 border-t p-4">
                      {/* Salon Info */}
                      <div className="space-y-2">
                        <div className="text-sm">
                          <label className="text-muted-foreground font-medium">
                            Salon
                          </label>
                          <p>{booking.salon?.name ?? "-"}</p>
                        </div>
                      </div>

                      {/* Employee & Chair Info */}
                      <div className="grid gap-3 text-sm md:grid-cols-2">
                        <div>
                          <label className="text-muted-foreground font-medium">
                            Employee
                          </label>
                          <p>{booking.employee?.name ?? "-"}</p>
                          <p className="text-muted-foreground text-xs">
                            {booking.employee?.designation ?? "-"}
                          </p>
                        </div>
                        <div>
                          <label className="text-muted-foreground font-medium">
                            Chair
                          </label>
                          <p>{booking.chair?.name ?? "-"}</p>
                          <p className="text-muted-foreground text-xs">
                            {booking.chair?.type ?? "-"}
                          </p>
                        </div>
                      </div>

                      {/* Services */}
                      {(booking.services ?? []).length > 0 && (
                        <div>
                          <label className="text-muted-foreground text-sm font-medium">
                            Services
                          </label>
                          <div className="mt-2 space-y-1">
                            {(booking.services ?? []).map((service) => (
                              <div
                                key={service.uid}
                                className="bg-primary/10 flex items-center justify-between rounded px-2 py-3 text-sm"
                              >
                                <span>{service.name}</span>
                                <span className="font-semibold">
                                  £{service.price}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Products */}
                      {(booking.products ?? []).length > 0 && (
                        <div>
                          <label className="text-muted-foreground text-sm font-medium">
                            Products
                          </label>
                          <div className="mt-2 space-y-1">
                            {(booking.products ?? []).map((product) => (
                              <div
                                key={product.uid}
                                className="bg-secondary/10 flex items-center justify-between rounded px-2 py-3 text-sm"
                              >
                                <span>{product.name}</span>
                                <span className="font-semibold">
                                  £{product.price}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {booking.notes && (
                        <div>
                          <label className="text-muted-foreground text-sm font-medium">
                            Notes
                          </label>
                          <p className="bg-secondary/30 mt-1 rounded p-2 text-sm">
                            {booking.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerDetail;
