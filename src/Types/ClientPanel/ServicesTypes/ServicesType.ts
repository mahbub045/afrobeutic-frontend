export interface ServiceProps {
  uid: string;
  name: string;
  category: string;
  price: string;
  description?: string;
  images?: string[];
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
