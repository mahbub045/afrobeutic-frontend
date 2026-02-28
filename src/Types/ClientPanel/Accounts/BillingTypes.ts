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

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface BillingHistoryItem {
  plan_name: string;
  transaction_status: string;
  amount: string;
  created_at: string;
  invoice_url?: string | null;
}

export interface SavedCardItem {
  uid: string;
  card_brand: string;
  last_four: string;
  expiry_month: number;
  expiry_year: number;
  is_default: boolean;
}

export type CardDeleteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: SavedCardItem | null;
  onSuccess?: () => void;
};
