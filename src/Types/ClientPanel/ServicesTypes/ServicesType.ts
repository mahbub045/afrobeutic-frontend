export interface ServiceProps {
  uid: string;
  name: string;
  category: string;
  price: string;
  description?: string;
  images?: string[];
  created_at: string;
  updated_at: string;
  available_time_slots?: string[];
  booking_lead_time?: string;
  cancellation_policy?: boolean;
  gender_specific?: boolean;
  discount?: number;
  assigned_employee?: string;
}

export interface AddServiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
}
export interface ServiceFormValues {
  name: string;
  category: string;
  price: string;
  description: string;
  uploaded_images?: string;
}

export interface EditServiceBasicInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedService: ServiceProps;
  onEditSuccess?: () => void;
}
