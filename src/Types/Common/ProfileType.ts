export interface ProfileDataProps {
  avatar?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  country?: string | null;
  role?: string | null;
  created_at?: string | null;
}

export interface ChangePasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export type ChangePasswordPayload = {
  old_password: string;
  new_password: string;
  confirm_password: string;
};

export type ChangePasswordErrors = Partial<
  Record<keyof ChangePasswordPayload, string>
>;
