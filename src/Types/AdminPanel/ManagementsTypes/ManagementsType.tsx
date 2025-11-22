export interface ManagementsProps {
  uid: string;
  avatar?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  country?: string | null;
  role?: string | null;
  last_login?: string | null;
}

export interface ManagementsListDialogsProps {
  isOpen: boolean;
  onClose: () => void;
  managementUser?: ManagementsProps | null;
}
