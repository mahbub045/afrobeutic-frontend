export interface TicketProps {
  uid: string;
  level: string;
  topic: string;
  subject: string;
  queries: string;
  status: string;
  images?: SupportTicketImage[];
  created_at?: string;
  updated_at?: string;
}

export interface SupportTicketImage {
  uid: string;
  image: string;
  created_at?: string;
  updated_at?: string;
}
