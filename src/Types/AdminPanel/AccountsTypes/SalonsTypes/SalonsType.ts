export interface SalonProps {
  uid: string;
  logo?: string | null;
  name?: string | null;
  salon_type?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  street?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country?: string | null;
  address?: string | null;
  status?: string | null;
  created_at?: string | null;
}
export interface SalonServicesProps {
  uid: string;
  name?: string | null;
  category?: string | null;
  price?: string | null;
  description?: string | null;
  service_duration?: string | null;
  available_time_slots?: string[] | null;
  gender_specific?: string | null;
  discount_percentage?: string | null;
  assign_employees?: string[] | null;
  created_at?: string | null;
}
