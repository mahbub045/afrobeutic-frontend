"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteMetaConfigInfoMutation } from "@/Redux/Reducers/ClientPanel/Accounts/MetaConfiguration/MetaConfigurationApi";
import { useTheme } from "next-themes";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  AlertTriangle,
  Info,
  Link2Off,
  ShieldAlert,
  Trash2,
} from "lucide-react";

interface DeleteMetaConfigurationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeletingChange?: (deleting: boolean) => void;
}

const DeleteMetaConfigurationDialog: React.FC<DeleteMetaConfigurationDialogProps> = ({
  open,
  onOpenChange,
  onDeletingChange,
}) => {
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
      <DialogContent className="shadow-md dark:shadow-gray-600 max-w-md">
        <DialogHeader>
          {/* Icon + Title */}
          <div className="flex flex-col items-center text-center mb-2">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
              <div className="relative flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full border-2 border-red-200 dark:border-red-800">
                <ShieldAlert className="w-8 h-8 text-red-500" />
              </div>
            </div>

            <DialogTitle className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">
              Remove Meta Configuration?
            </DialogTitle>

            {/* Irreversible badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-200 dark:border-red-800 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              Irreversible Action
            </span>
          </div>

          {/* Description */}
          <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 text-center leading-relaxed px-1">
            <p>
              You&apos;re about to permanently remove your{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                Meta Business Account
              </span>{" "}
              configuration from this workspace. This action cannot be undone.
            </p>
            <p>
              All linked{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                Facebook, and Whatsapp accounts
              </span>{" "}
              associated with this integration will be disconnected immediately.
            </p>
            <p>
              To reconnect in the future, you&apos;ll need to go through the full
              setup process and reauthorize access to your{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                Meta Business Suite
              </span>
              .
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-4" />

          {/* What will be affected */}
          <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-xl px-4 py-3 text-left mb-1">
            <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              Your historical data and reports will remain accessible, but live
              syncing and campaign management will be{" "}
              <span className="font-semibold">disabled immediately</span>.
            </p>
          </div>

          <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-xl px-4 py-3 text-left">
            <Link2Off className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed">
              Any active automations or workflows relying on this Meta
              integration will{" "}
              <span className="font-semibold">stop functioning</span> right
              away.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-5 flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1 text-white flex items-center justify-center gap-2"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Yes, Remove Account
                </>
              )}
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteMetaConfigurationDialog;