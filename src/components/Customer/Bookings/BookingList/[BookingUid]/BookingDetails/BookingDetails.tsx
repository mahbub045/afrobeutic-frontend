"use client";

import { useGetCustomerBookingDetailsQuery } from "@/Redux/Api/CustomerBaseApi";
import { formatDateTime } from "@/lib/utils";
import { useParams } from "next/navigation";
import React from "react";

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
    return <div className="py-8 text-center">Loading booking...</div>;
  }

  if (isError || !booking) {
    return (
      <div className="py-8 text-center text-red-600">
        Unable to load booking details.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Booking {booking.booking_id}</h3>
      <p>
        <strong>Salon:</strong> {booking.salon?.name || "-"}
      </p>
      <p>
        <strong>Date/Time:</strong>{" "}
        {formatDateTime(`${booking.booking_date}T${booking.booking_time}`)}
      </p>
      <p>
        <strong>Status:</strong> {booking.status}
      </p>
      <p>
        <strong>Total:</strong> ${booking.total_price?.toFixed(2) || "0.00"}
      </p>
      <p>
        <strong>Final:</strong> ${booking.final_price?.toFixed(2) || "0.00"}
      </p>
      {/* additional details can be rendered here as needed */}
    </div>
  );
};

export default BookingDetails;
