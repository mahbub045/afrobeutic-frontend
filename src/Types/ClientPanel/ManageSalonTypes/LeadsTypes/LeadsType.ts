export interface LeadProps {
  uid: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  source?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}
export interface LeadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  LeadData?: LeadProps | null;
}
