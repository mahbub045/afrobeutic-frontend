export interface MemberProps {
  uid: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  status?: string;
  [key: string]: unknown;
}

export interface AddNewUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  // optional callback when invitation is sent
  onInvite?: (email: string, role: string) => void;
}

export interface FormValueProps {
  email: string;
  role: string;
}
