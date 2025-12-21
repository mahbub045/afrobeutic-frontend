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

export interface SalonCustomersProps {
  uid: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  source?: string | null;
  phone?: string | null;
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

export interface SalonProductsProps {
  uid: string;
  name?: string | null;
  category?: string | null;
  price?: string | null;
  description?: string | null;
  created_at?: string | null;
}

export interface BookingImageProps {
  uid: string;
  image: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface SalonEmployeesProps {
  uid: string;
  employee_id?: string | null;
  name?: string | null;
  phone?: string | null;
  designation?: string | null;
  image?: string | null;
  created_at?: string | null;
}

export interface SalonBookingsProps {
  uid: string;
  booking_id?: string | null;
  booking_date?: string | null;
  booking_time?: string | null;
  status?: string | null;
  notes?: string | null;
  booking_duration?: string | null;
  cancellation_reason?: string | null;
  cancelled_by?: string | null;
  completed_at?: string | null;
  customer?: {
    uid: string;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    source?: string | null;
    phone?: string | null;
    created_at?: string | null;
  } | null;
  chair?: {
    uid: string;
    name?: string | null;
    type?: string | null;
  } | null;
  employee?: SalonEmployeesProps | null;
  services?: Array<{
    uid: string;
    name?: string | null;
    discount_percentage?: string | null;
    price?: string | null;
    discount_price?: string | null;
    category?: string | null;
    description?: string | null;
    service_duration?: string | null;
    available_time_slots?: string[] | null;
    gender_specific?: string | null;
  }> | null;
  products?: SalonProductsProps[] | null;
  images?: BookingImageProps[] | null;
  total_amount?: string | null;
  created_at?: string | null;
}
