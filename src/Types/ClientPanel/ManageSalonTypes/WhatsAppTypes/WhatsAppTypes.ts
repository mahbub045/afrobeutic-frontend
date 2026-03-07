export interface WhatsAppOnboardData {
  waba_id: string;
  chatbot_name: string;
  whatsapp_sender_number?: string;
  whatsapp_number?: string;
  status: string;
  sender_sid?: string;
  message?: string;
  salon?: string;
  created_by?: string;
  created_at?: string;
}

export interface ConnectWhatsAppDialogProps {
  isOpen: boolean;
  onClose: (isOpen: boolean) => void;
}

export interface DeleteWhatsAppDialogProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  whatsappData?: WhatsAppOnboardData;
  onDeleted?: () => unknown;
}
