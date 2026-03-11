export interface ServiceProps {
  uid: string;
  name: string;
  category: string;
  sub_category: string;
  price: string;
  description?: string;
  images?: string[];
  available_time_slots?: string[];
  service_duration?: string;
  cancellation_policy?: boolean;
  gender_specific?:
    | "BARBERSHOP"
    | "UNISEX_SALON"
    | "LADIES_SALON"
    | boolean
    | null;
  discount_percentage?: number;
  assign_employees?: Employee[] | string[];
  assigned_employees?: Employee[] | string[];
  created_at: string;
  updated_at: string;
}

export interface Employee {
  uid?: string;
  employee_id?: string;
  name?: string;
  phone?: string;
  designation?: string;
  image?: string;
}

export interface AddServiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
}
export interface ServiceFormValues {
  name: string;
  category: string;
  sub_category: string;
  price: string;
  description: string;
  uploaded_images?: string;
}

export interface ServiceCategory {
  uid: string;
  name: string;
}

export interface EditServiceBasicInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedService: ServiceProps;
  onEditSuccess?: () => void;
}

export interface DeleteServiceDialogProps {
  selectedService: ServiceProps;
  isOpen: boolean;
  onClose: () => void;
}

export interface ViewServicePanelProps {
  selectedService: ServiceProps;
  onClose?: () => void;
}

export interface FullScreenImageViewerProps {
  isOpen: boolean;
  images: string[];
  currentImageIndex: number;
  onClose: () => void;
  onImageChange: (index: number) => void;
  serviceName?: string;
}
