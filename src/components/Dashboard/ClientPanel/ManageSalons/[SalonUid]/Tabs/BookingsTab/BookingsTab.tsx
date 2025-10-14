"use client";
import * as React from "react";

type Booking = { id: string; customer: string };

const BookingsTab: React.FC<{ items?: Booking[] }> = ({ items = [] }) => {
  return (
    <div>
      <h2 className="text-lg font-semibold">Bookings</h2>
      <ul className="mt-3 space-y-2">
        {items.map((it) => (
          <li key={it.id} className="rounded-md border px-3 py-2">
            {it.customer}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BookingsTab;
