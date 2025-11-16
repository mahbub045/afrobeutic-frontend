export interface LeadProps {
  uid: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  salon?: {
    uid: string;
    name: string;
    salon_type: string;
    email: string;
    phone: string;
    city: string;
    country: string;
    status: string;
  } | null;
  source?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}
export interface LeadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  LeadData?: LeadProps | null;
}
