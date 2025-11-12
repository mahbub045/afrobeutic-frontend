export interface BookingService {
  uid: string;
  name: string;
  category: string;
  price: string;
  discount_price: string;
  description: string;
  service_duration: string;
  available_time_slots: string[];
  gender_specific: "MALE" | "FEMALE" | "UNISEX";
  discount_percentage: string;
}

export interface BookingProduct {
  uid: string;
  name: string;
  category: string;
  price: string;
  description: string | null;
}

export interface BookingCustomer {
  uid: string;
  name: string;
  phone: string;
  created_at: string;
}

export interface BookingEmployee {
  uid: string;
  name: string;
}

export interface Booking {
  uid: string;
  booking_date: string;
  booking_time: string;
  booking_duration: string;
  completed_at: string | null;
  status: "PLACED" | "INPROGRESS" | "RESCHEDULED" | "COMPLETED";
  notes: string;
  customer: BookingCustomer;
  services: BookingService[];
  total_services: number;
  total_price: number;
  final_price: number;
  products: BookingProduct[];
  total_products: number;
  created_at: string;
  employee: BookingEmployee;
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
