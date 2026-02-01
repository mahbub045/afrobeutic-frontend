
/** Pricing plan associated with a billing/subscription */
export interface PricingPlan {
  uid: string;
  name: string;
  price: string;
  salon_limit: number;
  whatsapp_chatbot_limit: number;
  whatsapp_messages_per_chatbot: number;
  has_broadcasting: boolean;
  broadcasting_message_limit: number;
  description?: string | null;
}

export interface BillingSubscription {
  status: string;
  start_date: string;
  end_date?: string | null;
  next_billing_date?: string | null;
  cancelled_at?: string | null;
  notes?: string | null;
  pricing_plan: PricingPlan;
  auto_renew: boolean;
}
