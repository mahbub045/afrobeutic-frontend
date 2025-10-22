export type WeekDay =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY"
  | string;

export interface OpeningHour {
  id?: number;
  uid?: string;
  day: WeekDay;
  opening_start_time: string;
  opening_end_time: string;
  break_start_time?: string;
  break_end_time?: string;
  is_closed: boolean;
}

export interface SalonProps {
  uid: string;
  name: string;
  description?: string;
  logo?: string;
  salon_type?: string;
  email?: string;
  phone?: string;
  website?: string;
  street?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
  opening_hours: OpeningHour[];
}
export interface SalonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SalonProps[];
}

export interface SalonListQueryParams {
  page?: number;
  search?: string;
}

export interface AddSalonDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface FormValues {
  name: string;
  salon_type: string;
  email: string;
  phone: string;
  country_dial_code?: string;
  website: string;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  latitude: number | string;
  longitude: number | string;
  status: string;
  opening_hours: OpeningHour[];
}
