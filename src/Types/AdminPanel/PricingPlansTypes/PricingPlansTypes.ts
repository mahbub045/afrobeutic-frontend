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
