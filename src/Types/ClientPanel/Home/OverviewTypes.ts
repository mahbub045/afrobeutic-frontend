export type OverviewStatsResponse = {
  card_1?: {
    total_bookings?: number;
    booking_completion_rate?: number;
  };
  card_2?: {
    total_income?: number;
  };
  card_3?: {
    client_requests?: number;
  };
  card_4?: {
    total_clients?: number;
  };
};
