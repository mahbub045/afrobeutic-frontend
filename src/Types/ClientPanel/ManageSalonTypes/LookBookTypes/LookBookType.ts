export interface LookBookProps {
  uid: string;
  booking_id: string;
  customer: {
    uid: string;
    name: string;
    email: string;
    phone: string;
  };
  completed_at: string;
  created_at: string;
  updated_at: string;
  images: string[];
}

export interface ViewLookBookPanelProps {
  selectedLookBook: LookBookProps;
  onClose: () => void;
}
