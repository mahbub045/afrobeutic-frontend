import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteManagementMutation } from "@/Redux/Reducers/AdminPanel/Managements/ManagementsApi";
import { ManagementsListDialogsProps } from "@/Types/AdminPanel/ManagementsTypes/ManagementsType";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import Swal from "sweetalert2";

const DeleteManagementUserDialog: React.FC<ManagementsListDialogsProps> = ({
  isOpen,
  onClose,
  managementUser,
}) => {
  const { resolvedTheme } = useTheme();
  const [deleteManagementUser, { isLoading }] = useDeleteManagementMutation();

  const handleDelete = async () => {
    if (!managementUser?.uid) {
      toast.error("No management user selected to delete");
      return;
    }

    try {
      await deleteManagementUser(managementUser.uid).unwrap();

      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Deleted",
        html: `Management user <span class="text-danger">${managementUser?.email || managementUser?.first_name || "user"}</span> deleted successfully.`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 3000,
      });

      onClose();
    } catch (error: unknown) {
      console.error("Delete management user failed:", error);
      const err = error as { data?: unknown; response?: { data?: unknown } };
      const data = err?.data || err?.response?.data;

      if (data && typeof data === "object") {
        const messages: string[] = [];
        const obj = data as Record<string, unknown>;
        Object.keys(obj).forEach((k) => {
          const v = obj[k];
          if (Array.isArray(v))
            messages.push(`${k}: ${(v as unknown[]).join(", ")}`);
          else if (typeof v === "string") messages.push(`${k}: ${v}`);
        });
        if (messages.length) messages.forEach((m) => toast.error(m));
        else toast.error("Failed to delete management user");
      } else {
        toast.error("Failed to delete management user");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-md">
        <DialogHeader>
          <DialogTitle className="text-danger">
            Delete Management User
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <strong className="text-danger">
              {managementUser?.first_name || managementUser?.last_name
                ? `${managementUser?.first_name ?? ""}${managementUser?.last_name ? ` ${managementUser.last_name}` : ""}`
                : managementUser?.email || "this user"}
            </strong>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleDelete} disabled={isLoading} variant="danger">
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteManagementUserDialog;
