export interface ServiceProps {
  uid: string;
  name: string;
  category: string;
  price: string;
  description?: string;
  images?: string[];
  created_at: string;
  updated_at: string;
}
