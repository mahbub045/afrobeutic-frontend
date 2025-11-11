export interface BookingData {
  uid: string;
  customer: {
    uid: string;
    name: string;
    phone: string;
    created_at: string;
    updated_at: string;
  };
  booking_id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  booking_duration: string;
  notes: string | null;
  services: Array<{
    uid: string;
    name: string;
    category: number;
    price: string;
    description: string | null;
    service_duration: string;
    created_at: string;
    updated_at: string;
  }>;
  products: Array<{
    uid: string;
    name: string;
    category: number;
    price: string;
    description: string;
    created_at: string;
    updated_at: string;
  }>;
  employee: {
    uid: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface BookingFormValues {
  customer: {
    name: string;
    phone: string;
  };
  booking_date: string;
  booking_time: string;
  notes: string;
  services: string[];
  products: string[];
  employee: string;
}

export interface EditChairBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedChairUid: string;
  selectedChairBookingData: BookingData | null;
}

export interface ViewBookingPanelProps {
  chairUid: string;
}
