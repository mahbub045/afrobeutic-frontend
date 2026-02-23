"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteMetaConfigInfoMutation } from "@/Redux/Reducers/ClientPanel/Accounts/MetaConfiguration/MetaConfigurationApi";
import { DeleteMetaConfigurationDialogProps } from "@/Types/ClientPanel/Accounts/MetaConfigurationTypes";
import { Info, Link2Off, ShieldAlert, Trash2 } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

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
      <DialogContent className="max-w-md shadow-md dark:shadow-gray-600">
        <DialogHeader>
          {/* Icon + Title */}
          <div className="mb-2 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="absolute inset-0 animate-ping rounded-full bg-red-500/20" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-200 bg-red-100 dark:border-red-800 dark:bg-red-900/30">
                <ShieldAlert className="h-8 w-8 text-red-500" />
              </div>
            </div>

            <DialogTitle className="mb-1 text-xl font-bold text-gray-800 dark:text-gray-100">
              Remove Meta Configuration?
            </DialogTitle>

            {/* Irreversible badge */}
            <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold tracking-widest text-red-500 uppercase dark:border-red-800 dark:bg-red-900/20">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
              Irreversible Action
            </span>
          </div>

          {/* Description */}
          <div className="space-y-2 px-1 text-center text-sm leading-relaxed text-gray-500 dark:text-gray-400">
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
              To reconnect in the future, you&apos;ll need to go through the
              full setup process and reauthorize access to your{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                Meta Business Suite
              </span>
              .
            </p>
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-dashed border-gray-200 dark:border-gray-700" />

          {/* What will be affected */}
          <div className="mb-1 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left dark:border-amber-800/50 dark:bg-amber-900/10">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-400">
              Your historical data and reports will remain accessible, but live
              syncing and campaign management will be{" "}
              <span className="font-semibold">disabled immediately</span>.
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left dark:border-red-800/50 dark:bg-red-900/10">
            <Link2Off className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <p className="text-xs leading-relaxed text-red-700 dark:text-red-400">
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
              className="flex flex-1 items-center justify-center gap-2 text-white"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
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
