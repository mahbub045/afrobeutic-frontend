export interface MessageCustomer {
  uid: string;
  first_name: string;
  last_name: string;
  email: string | null;
  source: string;
  phone: string;
  created_at: string;
}

export type MessageRole = "CUSTOMER" | "BOT";

export interface Message {
  message: string;
  media_url: string | null;
  sent_at: string;
  role: MessageRole;
  customer: MessageCustomer;
}
