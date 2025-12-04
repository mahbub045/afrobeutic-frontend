export interface UserProps {
  uid: string;
  avatar: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string;
  country: string | null;
  accounts: AccountProps[] | null;
}
export interface AccountProps {
  uid: string;
  name: string;
  owner_name: string;
  owner_email: string;
  role: string;
}
