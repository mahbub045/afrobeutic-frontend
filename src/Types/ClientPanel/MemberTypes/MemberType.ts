export interface MemberProps {
  uid: string;
  name: string;
  email: string;
  avatar?: string | null;
  role?: string;
  status?: string;
  [key: string]: unknown;
}

export interface MembersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: MemberProps[];
}

export interface MembersQueryParams {
  page?: number;
  search?: string;
}

export interface AddNewMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  // optional callback when invitation is sent
  onInvite?: (email: string, role: string) => void;
}

export interface FormValueProps {
  email: string;
  role: string;
}

export interface EditFormValueProps {
  role: string | undefined;
  status: string | undefined;
}

export interface EditNewMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMember?: MemberProps;
}
export interface DeleteMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMember?: MemberProps;
}
