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
  opening_time: string;
  closing_time: string;
  is_closed: boolean;
}

export interface SalonProps {
  uid: string;
  name: string;
  salon_category?: string;
  is_provide_hair_styles?: boolean;
  is_provide_bridal_makeup_services?: boolean;
  description?: string;
  logo?: string;
  salon_type?: string;
  salon_service_types?: string[];
  address_one?: string;
  address_two?: string | null;
  email?: string;
  phone_number_one?: string;
  phone_number_two?: string | null;
  facebook?: string;
  instagram?: string;
  youtube?: string | null;
  website?: string;
  street?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
  address?: string;
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
  phone_number_one: string;
  country_dial_code?: string;
  website: string;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  address?: string;
  opening_hours: OpeningHour[];
}

export interface DashboardTabProps {
  singleSalonData: SalonProps;
  isLoading: boolean;
  isError: boolean;
}

export interface EditDashboardProps {
  // Define any props if needed
  singleSalonData: SalonProps | null;
  isOpen: boolean;
  onClose: () => void;
}

export interface BasicInfoFormValues {
  logoFile: File | null;
  logoPreview: string;
  name: string;
  salon_type: string;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  address: string;
}

export interface ContactInfoFormValues {
  website: string;
  phone: string;
  email: string;
}
