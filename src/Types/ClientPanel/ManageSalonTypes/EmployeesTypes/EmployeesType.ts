export interface EmployeeProps {
  uid: string;
  employee_id: string;
  name: string;
  phone?: string;
  designation?: string;
  image?: string;
  created_at: string;
  updated_at: string;
}

export interface AddEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}
export interface EmployeeFormValues {
  employee_id: string;
  name: string;
  phone?: string;
  designation?: string;
  image?: string;
}

export interface EditEmployeeBasicInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEmployee: EmployeeProps;
  onEditSuccess?: () => void;
}

export interface DeleteEmployeeDialogProps {
  selectedEmployee: EmployeeProps;
  isOpen: boolean;
  onClose: () => void;
}

export interface ViewEmployeePanelProps {
  selectedEmployee: EmployeeProps;
  onClose?: () => void;
}
