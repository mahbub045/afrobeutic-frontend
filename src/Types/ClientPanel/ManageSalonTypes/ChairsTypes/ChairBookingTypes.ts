export interface ChairBookingProps {
  uid: string;
  customer: {
    uid: string;
    first_name: string;
    last_name: string;
    phone: string;
    source: string | null;
    created_at: string;
    updated_at: string;
  };
  booking_id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  booking_duration: string | null;
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
    first_name: string;
    last_name: string;
    phone: string;
  };
  booking_date: string;
  booking_time: string;
  // Optional status for edit dialog; create flow may omit it
  status?:
    | "PLACED"
    | "INPROGRESS"
    | "COMPLETED"
    | "RESCHEDULED"
    | "CANCELLED"
    | "ABSENT";
  notes: string;
  services: string[];
  products: string[];
  employee: string;
}

export interface EditChairBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedChairUid: string;
  selectedChairBookingData: ChairBookingProps | null;
}

export interface ViewBookingPanelProps {
  chairUid: string;
}
