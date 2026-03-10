export interface LookBookProps {
  uid: string;
  booking_id: string;
  customer: {
    uid: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  completed_at: string;
  created_at: string;
  updated_at: string;
  images: string[];
}

export interface ViewLookBookPanelProps {
  selectedLookBook: LookBookProps;
  onClose: () => void;
}

export interface EditLookBookImageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLookBook: LookBookProps | null;
  onEditSuccess: () => void;
}

export interface DeleteLookbookDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLookBook: LookBookProps | null;
  onDeleted?: () => void;
}
