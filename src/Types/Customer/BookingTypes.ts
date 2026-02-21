export interface CustomerSalon {
  uid: string;
  name: string;
}

export interface CustomerBooking {
  uid: string;
  salon: CustomerSalon;
  booking_id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  booking_duration?: string;
  cancellation_reason?: string | null;
  completed_at?: string | null;
  notes?: string | null;
  services?: unknown[];
  products?: unknown[];
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

export interface CustomerBookingsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CustomerBooking[];
}
