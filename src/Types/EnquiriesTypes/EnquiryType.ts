export interface EnquiryProps {
  uid?: string;
  type?: string | null;
  summary?: string | null;
  status?: string | null;
  lead?: {
    first_name?: string | null;
    last_name?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    email?: string | null;
  } | null;
  customer?: {
    name?: string | null;
    phone?: string | null;
    email?: string | null;
  } | null;
  created_at?: string | null;
  salon?: { uid?: string; name?: string | null } | null;
}

export interface FormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  whatsapp: string;
  source: string;
  country_dial_code: string;
  summary: string;
  status: string;
  type: string;
  salon: string;
}

export interface EnquiryDialogsProps {
  isOpen: boolean;
  onClose: () => void;
  enquiryData?: EnquiryProps | null;
}
