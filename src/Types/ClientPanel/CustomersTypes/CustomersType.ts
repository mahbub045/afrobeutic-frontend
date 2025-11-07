// export interface Booking {
//   booking_date: string;
//   booking_time: string;
//   status: string;
//   booking_id?: string;
// }

export interface Customer {
  uid: string;
  name: string;
  phone?: string | null;
  booking: Booking[];
}

export interface CustomersQueryParams {
  salon__uid?: string;
  page?: number;
  search?: string;
  created_at__gte?: string;
  created_at__lte?: string;
}

export interface Service {
  uid: string;
  name: string;
  category: string;
  price: string;
  description: string | null;
  service_duration: string;
  gender_specific: string;
  discount_percentage: string;
}

export interface Product {
  uid: string;
  name: string;
  category: string;
  price: string;
  description: string | null;
}

export interface Employee {
  uid: string;
  employee_id: string;
  name: string;
  phone: string;
  designation: string;
  image: string | null;
}

export interface Chair {
  uid: string;
  name: string;
  type: string;
}

export interface Salon {
  uid: string;
  name: string;
  salon_type: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  status: string;
}

export interface Booking {
  uid: string;
  booking_id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  notes: string | null;
  booking_duration: string;
  completed_at: string | null;
  cancellation_reason: string | null;
  cancelled_by: string | null;
  salon: Salon;
  chair: Chair;
  employee: Employee;
  services: Service[];
  products: Product[];
}

export interface CustomerDetailData {
  uid: string;
  name: string;
  phone: string | null;
  booking: Booking[];
  created_at: string;
  updated_at: string;
}

export interface CustomerDetailProps {
  uid: string;
}
