export interface BookingService {
  uid: string;
  name: string;
  category: string;
  price: string;
  description: string;
  service_duration: string;
  available_time_slots: string[];
  gender_specific: "MALE" | "FEMALE" | "UNISEX";
  discount_percentage: string;
}

export interface BookingCustomer {
  uid: string;
  name: string;
  phone: string;
  created_at: string;
}

export interface Booking {
  uid: string;
  booking_date: string;
  booking_time: string;
  completed_at: string | null;
  booking_duration: string;
  status: "PLACED" | "INPROGRESS" | "RESCHEDULED" | "COMPLETED";
  services: BookingService[];
  customer: BookingCustomer;
  created_at: string;
}

export interface StaffMemberWithBookings {
  uid: string;
  image: string | null;
  name: string;
  bookings: Booking[];
}

export interface BookingsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: StaffMemberWithBookings[];
}
