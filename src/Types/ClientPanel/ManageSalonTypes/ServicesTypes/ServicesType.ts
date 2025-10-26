export interface ServiceProps {
  uid: string;
  name: string;
  category: string;
  price: string;
  description?: string;
  images?: string[];
  available_time_slots?: string[];
  service_duration?: string;
  cancellation_policy?: boolean;
  gender_specific?: boolean;
  discount_percentage?: number;
  assigned_employees?: string[];
  created_at: string;
  updated_at: string;
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
