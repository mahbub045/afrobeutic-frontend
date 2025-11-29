export interface AccountListProps {
  uid: string;
  name: string;
  users:
    | {
        uid: string;
        avatar: string | null;
        first_name: string | null;
        last_name: string | null;
        email: string | null;
        role: string | null;
        country: string | null;
      }[]
    | null;
  created_at: string | null;
}
export interface AccountDetailsProps {
  accountDetails: AccountListProps | undefined;
  isLoading: boolean;
}
