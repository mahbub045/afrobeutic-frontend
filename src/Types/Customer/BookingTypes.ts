export interface CustomerSalon {
  uid: string;
  name: string;
}

export interface BookingService {
  uid: string;
  name: string;
  category: number;
  price: string;
  description: string;
  service_duration?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingProduct {
  uid: string;
  name: string;
  category: number;
  price: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerBooking {
  uid: string;
  salon: CustomerSalon;
  booking_id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  booking_duration?: string | null;
  cancellation_reason?: string | null;
  completed_at?: string | null;
  notes?: string | null;
  services?: BookingService[];
  products?: BookingProduct[];
  total_services?: number;
  total_services_price?: number;
  total_products?: number;
  total_products_price?: number;
  services_discount_price?: number;
  total_price?: number;
  final_price?: number;
  tips_amount?: string;
  payment_type?: string;
  created_at: string;
  updated_at?: string;
}

/** Alias – single booking detail response has the same shape */
export type CustomerBookingDetail = CustomerBooking;

export interface CustomerBookingsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CustomerBooking[];
}
