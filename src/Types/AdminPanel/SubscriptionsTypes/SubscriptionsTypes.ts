export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "CANCELLED" | "EXPIRED";

export interface PricingPlan {
  uid: string;
  account_category: string;
  name: string;
  price: number;
  salon_limit: number;
  whatsapp_chatbot_limit: number;
  whatsapp_messages_per_chatbot: number;
  has_broadcasting: boolean;
  broadcasting_message_limit: number;
  is_active: boolean;
  description: string;
}

export interface Account {
  uid: string;
  name: string;
  owner_name: string;
  owner_email: string;
  role: string | null;
}

export interface SubscriptionTypes {
  uid: string;
  status: SubscriptionStatus;
  start_date: string;
  end_date: string;
  next_billing_date: string;
  auto_renew: boolean;
  cancelled_at: string | null;
  notes: string | null;
  pricing_plan: PricingPlan;
  account: Account;
  created_at: string;
}
