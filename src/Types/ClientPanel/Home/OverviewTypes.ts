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

export type DashboardFilterValue =
  | "last_7_days"
  | "last_30_days"
  | "this_month"
  | "this_year"
  | "all_time";

export type OverviewStatsQueryParams = {
  bookings_filter?: DashboardFilterValue;
  income_filter?: DashboardFilterValue;
  requests_filter?: DashboardFilterValue;
  clients_filter?: DashboardFilterValue;
};
