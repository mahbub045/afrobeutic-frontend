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
  first_name: string;
  last_name: string;
  phone: string;
  created_at: string;
}

export interface BookingEmployee {
  uid: string;
  employee_id: string;
  name: string;
  phone: string;
  designation: string;
  image: string | null;
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
  total_services_price: number;
  services_discount_price: number;
  total_products_price: number;
  total_price: number;
  final_price: number;
  products: BookingProduct[];
  total_products: number;
  created_at: string;
  employee: BookingEmployee;
  tips_amount: number;
  payment_type: string;
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

export interface Employee {
  uid: string;
  name: string;
}

export interface Service {
  uid: string;
  name: string;
  price: string;
}

export interface Product {
  uid: string;
  name: string;
  price: string;
}

export interface EditBookingDialogProps {
  // Define any props needed for the dialog here
  isOpen: boolean;
  onClose: () => void;
  bookingData?: {
    uid: string;
    booking_date: string;
    booking_time: string;
    booking_duration: string;
    cancellation_reason?: string;
    status: string;
    notes: string;
    customer: BookingCustomer;
    employee: { uid: string };
    services: Array<{ uid: string }>;
    products: Array<{ uid: string }>;
    images?: string[];
  };
}

export interface EditBookingStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData?: {
    uid: string;
    status: string;
    cancellation_reason?: string;
    images?: string[];
  };
}

export interface Appointment {
  id: string;
  service: string;
  client: string;
  clientAvatar?: string;
  staff: string;
  startTime: string;
  endTime: string;
  status: "placed" | "in-progress" | "rescheduled" | "completed" | "cancelled";
  color: string;
  column: number;
  fullBookingData?: Booking;
}

export interface StaffMember {
  id: string;
  name: string;
  avatar?: string;
}

export interface CommonEditBookingDataProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  bookingData?: Booking | null;
}
