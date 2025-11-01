export interface ChairProps  {
  id: string;
  name: string;
  uid?: string;
  status?: string;
  type?: string;
  created_at?: string;
  updated_at?: string;
};

export interface AddChairDialogsProps {
    isOpen: boolean;
    onClose: () => void;
}