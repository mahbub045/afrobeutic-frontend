export interface ChairProps {
  id: string;
  name: string;
  uid?: string;
  status?: string;
  type?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ChairDialogsProps {
  isOpen: boolean;
  onClose: () => void;
  selectedChairData?: ChairProps;
}

export interface ChairFormValues {
  name: string;
  type: string;
  status: string;
}
