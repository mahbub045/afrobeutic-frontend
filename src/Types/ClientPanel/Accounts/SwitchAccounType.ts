export interface Account {
  uid: string;
  name: string;
  owner_name: string;
  owner_email: string;
  role: string;
}

export interface AccountAccesserResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Account[];
}

export interface AccountAccesserQueryParams {
  page?: number;
  search?: string;
}
