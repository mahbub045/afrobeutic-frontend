export type IndBookingApiStatus =
  | "PLACED"
  | "INPROGRESS"
  | "COMPLETED"
  | "RESCHEDULED"
  | "CANCELLED";

export type IndBookingUiStatus =
  | "placed"
  | "in-progress"
  | "rescheduled"
  | "completed"
  | "cancelled";

export interface IndAppointment {
  id: string;
  service: string;
  client: string;
  startTime: string;
  status: IndBookingUiStatus;
  color: string;
  bookingDate?: string;
  bookingDuration?: string | null;
  services?: IndividualBookingApi["services"];
  products?: IndividualBookingApi["products"];
  notes?: string | null;
  // Pricing fields used in the details panel
  total_services?: number;
  total_services_price?: number;
  services_discount_price?: number;
  total_products?: number;
  total_products_price?: number;
  total_price?: number;
  final_price?: number;
  tips_amount?: number;
  finalPrice?: number;
  tipsAmount?: number;
  paymentType?: string;
}

// Shape of a single booking item returned from the API
export interface IndividualBookingApi {
  uid?: string;
  booking_id: string;
  booking_date: string; // YYYY-MM-DD
  booking_time: string; // HH:MM:SS
  booking_duration?: string | null; // HH:MM:SS
  status: IndBookingApiStatus;
  cancellation_reason?: string;
  customer?: {
    first_name?: string | null;
    last_name?: string | null;
    phone?: string | null;
  } | null;
  services?: {
    uid?: string;
    name: string;
    price?: string;
    service_duration?: string;
  }[];
  products?: {
    uid?: string;
    name: string;
    price?: string;
  }[];
  notes?: string | null;
  // Pricing summary fields coming from the API
  total_services?: number;
  total_services_price?: number;
  services_discount_price?: number;
  total_products?: number;
  total_products_price?: number;
  total_price?: number;
  final_price?: number;
  tips_amount?: number;
  payment_type?: string;
}

export interface IndividualAppointment {
  id: string;
  service: string;
  client: string;
  startTime: string;
  status: IndBookingUiStatus;
  bookingDate?: string;
  bookingDuration?: string | null;
  services?: {
    uid?: string;
    name: string;
    price?: string;
    service_duration?: string;
  }[];
  products?: {
    uid?: string;
    name: string;
    price?: string;
  }[];
  notes?: string | null;
  finalPrice?: number;
  tipsAmount?: number;
  paymentType?: string;
  // Optional totals coming from the API (support both snake_case and camelCase)
  total_services?: number;
  total_services_price?: number;
  totalServicesPrice?: number;
  total_products?: number;
  total_products_price?: number;
  totalProductsPrice?: number;
  services_discount_price?: number;
  servicesDiscountPrice?: number;
  total_price?: number;
  total_rice?: number;
  final_price?: number;
  tips_amount?: number | string;
}

export interface IndividualAppointmentDetailsPanelProps {
  selectedAppointment: IndividualAppointment | null;
  /** Formatted date label, e.g. "Tuesday, January 17" */
  dateLabel: string;
  /** Controls the mobile sheet */
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isCancelled?: boolean;
  cancellationReason?: string;
  onStatusUpdated?: (status: string) => void;
  onDateTimeUpdated?: (data: {
    booking_date: string;
    booking_time: string;
    notes?: string;
  }) => void;
  onServicesUpdated?: (
    services: {
      uid: string;
      name: string;
      price: string;
      service_duration?: string;
    }[],
  ) => void;
  onProductsUpdated?: (
    products: { uid: string; name: string; price: string }[],
  ) => void;
  onCheckoutUpdated?: (data: {
    tips_amount: number;
    payment_type: string;
  }) => void;
}

export interface AddIndividualBookingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface AddLookBookImageDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  bookingUid?: string;
  onSuccess?: () => void;
}
