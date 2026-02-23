"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteMetaConfigInfoMutation } from "@/Redux/Reducers/ClientPanel/Accounts/MetaConfiguration/MetaConfigurationApi";
import { useTheme } from "next-themes";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

interface DeleteMetaConfigurationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeletingChange?: (deleting: boolean) => void;
}

const DeleteMetaConfigurationDialog: React.FC<
  DeleteMetaConfigurationDialogProps
> = ({ open, onOpenChange, onDeletingChange }) => {
  const { resolvedTheme } = useTheme();
  const [deleteMetaConfig, { isLoading }] = useDeleteMetaConfigInfoMutation();

  const handleDelete = async () => {
    onDeletingChange?.(true);
    try {
      await deleteMetaConfig(undefined).unwrap();
      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Deleted!",
        text: `Meta configuration has been removed.`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 2000,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete meta configuration:", error);
      toast.error("Failed to delete configuration. Please try again.");
    } finally {
      onDeletingChange?.(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="shadow-md dark:shadow-gray-600">
        <DialogHeader>
          <DialogTitle className="text-danger">
            Remove Meta Configuration
          </DialogTitle>
          <DialogDescription className="text-xs">
            Are you sure you want to remove your Meta Business Account
            configuration?
            <p className="text-muted-foreground mt-2 text-xs">
              This action cannot be undone.
            </p>
          </DialogDescription>

          <div className="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="text-white"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteMetaConfigurationDialog;
