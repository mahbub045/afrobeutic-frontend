"use client";
import { useGetCustomerBookingDetailsQuery } from "@/Redux/Api/CustomerBaseApi";
import { LoaderPinwheel } from "lucide-react";
import { useParams } from "next/navigation";
import React from "react";
import BookingDateTime from "./Components/BookingDateTime";
import BookingHeader from "./Components/BookingHeader";
import BookingItemsCard from "./Components/BookingItemsCard";
import BookingNotes from "./Components/BookingNotes";
import BookingPricingSummary from "./Components/BookingPricingSummary";

const BookingDetails: React.FC = () => {
  const params = useParams();
  const bookingUid = params?.bookingUid as string;

  const {
    data: booking,
    isLoading,
    isError,
  } = useGetCustomerBookingDetailsQuery(bookingUid, {
    skip: !bookingUid,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoaderPinwheel className="text-primary h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="border-destructive/40 bg-destructive/5 text-destructive rounded-xl border py-10 text-center text-sm">
        Unable to load booking details. Please try again.
      </div>
    );
  }

  const services = (booking.services ?? []) as string[];
  const products = (booking.products ?? []) as string[];

  return (
    <div className="space-y-4">
      {/* 1 – Overview header row */}
      <BookingHeader booking={booking} />

      {/* 2 – Date & Time info */}
      <BookingDateTime booking={booking} />

      {/* 3 – Services & Products side-by-side on wider screens */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BookingItemsCard
          type="services"
          items={services}
          count={booking.total_services ?? 0}
          price={booking.total_services_price ?? 0}
        />
        <BookingItemsCard
          type="products"
          items={products}
          count={booking.total_products ?? 0}
          price={booking.total_products_price ?? 0}
        />
      </div>

      {/* 4 – Pricing summary */}
      <BookingPricingSummary booking={booking} />

      {/* 5 – Notes / Cancellation reason (rendered only when present) */}
      <BookingNotes booking={booking} />
    </div>
  );
};

export default BookingDetails;
