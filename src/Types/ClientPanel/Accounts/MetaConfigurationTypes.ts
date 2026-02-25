export interface DeleteMetaConfigurationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeletingChange?: (deleting: boolean) => void;
}
export interface DetailResponse {
  detail: string;
}
