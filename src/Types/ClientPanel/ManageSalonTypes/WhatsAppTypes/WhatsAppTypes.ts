export interface WhatsAppOnboardData {
  waba_id: string;
  chatbot_name: string;
  whatsapp_sender_number?: string;
  status: string;
  sender_sid?: string;
}

export interface ConnectWhatsAppDialogProps {
  isOpen: boolean;
  onClose: (isOpen: boolean) => void;
}