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
