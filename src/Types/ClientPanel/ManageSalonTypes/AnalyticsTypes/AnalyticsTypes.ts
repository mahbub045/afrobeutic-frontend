export interface RevenueProps {
  uid: string;
  booking_id: string;
  customer: {
    uid: string;
    first_name: string;
    last_name: string;
  };
  completed_at: string;
  final_price: number;
}

export interface ServiceCategoryRevenue {
  service_category?: string | null;
  revenue?: number | null;
}
export interface ProductCategoryRevenue {
  product_category?: string | null;
  revenue?: number | null;
}
export interface ServiceRevenue {
  service_name?: string | null;
  revenue?: number | null;
}
export interface ProductRevenue {
  product_name?: string | null;
  revenue?: number | null;
}
export interface CustomerAnalysisResp {
  total_bookings?: number;
  new_customer_booking_count?: number;
  repeated_customer_booking_count?: number;
  [key: string]: unknown;
}
export interface TopStaffPerformer {
  employee_id: string;
  name: string;
  total_revenue: number;
}
export interface TopService {
  name: string;
  total_revenue: number;
}
export interface TopProduct {
  name: string;
  total_revenue: number;
}