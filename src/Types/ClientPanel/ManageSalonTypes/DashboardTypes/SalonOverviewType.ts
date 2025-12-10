interface SalonOverviewData {
  total_employees: number;
  total_services: number;
  total_products: number;
  total_chairs: number;
}

export interface SalonOverviewProps {
  isLoading: boolean;
  salonOverviewData: SalonOverviewData | null;
}
