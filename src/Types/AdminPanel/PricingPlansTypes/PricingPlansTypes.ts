export interface PricingPlanTypes {
  uid: string;
  account_category: string;
  name: string;
  price: string;
  salon_limit: number;
  whatsapp_chatbot_limit: number;
  whatsapp_messages_per_chatbot: number;
  has_broadcasting: boolean;
  broadcasting_message_limit: number;
  is_active: boolean;
  description: string;
}

export interface AddPricingPlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface EditPricingPlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pricingPlanData: PricingPlanTypes;
}
export interface DeletePricingPlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pricingPlanData: PricingPlanTypes;
}
