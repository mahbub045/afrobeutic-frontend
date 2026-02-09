export interface EditCustomerProfileInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export interface CustomerProfileFormValues {
  first_name: string;
  last_name: string;
  email: string;
}
