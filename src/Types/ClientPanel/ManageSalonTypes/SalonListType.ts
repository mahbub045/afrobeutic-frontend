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
  hair_service_types?: string[];
  email?: string;
  phone_number_one?: string;
  phone_number_two?: string | null;
  facebook?: string;
  instagram?: string;
  youtube?: string | null;
  website?: string;
  formatted_address?: string;
  google_place_id?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
  opening_hours: OpeningHour[];
  professional_career_details?: string;
  about_salon?: string;
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
  salon_category: string;
  is_provide_hair_styles: boolean | null;
  is_provide_bridal_makeup_services: boolean | null;
  hair_service_types: string[];
  bridal_makeup_service_types: string[];
  additional_service_types: string[];
  name: string;
  salon_type: string;
  email: string;
  phone_number_one: string;
  phone_number_two?: string | null;
  country_dial_code?: string;
  country_dial_code_two?: string | null;
  website: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  formatted_address: string;
  google_place_id?: string;
  city: string;
  postal_code: string;
  country: string;
  latitude?: number;
  longitude?: number;
  opening_hours: OpeningHour[];
}

export interface DashboardTabProps {
  singleSalonData: SalonProps;
  isLoading: boolean;
  isError?: boolean;
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
  formatted_address: string;
  google_place_id?: string;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface ProfileInfoFormValues {
  logoFile: File | null;
  logoPreview: string;
  name: string;
  salon_type: string;
}

export interface AddressFormValues {
  formatted_address: string;
  google_place_id?: string;
  city: string;
  postal_code: string;
  country: string;
  latitude?: number;
  longitude?: number;
}
export interface ContactValues {
  phone_number_one: string;
  email: string;
  website: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
}

export interface ContactInfoFormValues {
  website: string;
  phone: string;
  email: string;
}
