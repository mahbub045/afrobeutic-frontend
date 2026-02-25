import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteWhatsAppOnboardMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/WhatsApp/WhatsAppApi";
import { DeleteWhatsAppDialogProps } from "@/Types/ClientPanel/ManageSalonTypes/WhatsAppTypes/WhatsAppTypes";
import { BotOff, Info, Link2Off, ShieldAlert, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import React from "react";
import { toast } from "react-toastify";

const DeleteWhatsAppDialog: React.FC<DeleteWhatsAppDialogProps> = ({
  isOpen,
  onClose,
  whatsappData,
}) => {
  const { salonuid } = useParams();
  const [deleteWhatsApp, { isLoading }] = useDeleteWhatsAppOnboardMutation();

  const handleDelete = async () => {
    try {
      await deleteWhatsApp(salonuid as string).unwrap();
      toast.success("WhatsApp connection removed.");
      onClose(false);
    } catch (err) {
      console.error("Failed to delete WhatsApp onboard:", err);
      const msg =
        ((err as { data?: { message?: string } })?.data?.message as
          | string
          | undefined) ||
        (typeof err === "string" ? err : "Failed to remove WhatsApp.");
      toast.error(msg);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md shadow-md dark:shadow-gray-600">
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
              Remove WhatsApp Connection?
            </DialogTitle>

            {/* Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-200 dark:border-red-800 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              Irreversible Action
            </span>
          </div>

          {/* Description */}
          <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 text-center leading-relaxed px-1">
            {whatsappData?.chatbot_name ? (
              <p>
                You&apos;re about to permanently delete the chatbot{" "}
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  {whatsappData.chatbot_name}
                </span>{" "}
                and disconnect your WhatsApp integration from this salon. This
                action cannot be undone.
              </p>
            ) : (
              <p>
                You&apos;re about to permanently remove your{" "}
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  WhatsApp connection
                </span>{" "}
                from this salon. This action cannot be undone.
              </p>
            )}
            <p>
              All automated messages, conversation flows, and client
              interactions managed through this WhatsApp integration will be{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                immediately stopped
              </span>
              .
            </p>
            <p>
              To reconnect, you&apos;ll need to go through the full WhatsApp
              onboarding process and{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                reauthorize your account
              </span>{" "}
              again.
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-4" />

          {/* Warning Cards */}
          <div className="space-y-2">
            <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-xl px-4 py-3 text-left">
              <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                Your chat history and client data will remain accessible, but
                live messaging and automated replies will be{" "}
                <span className="font-semibold">disabled immediately</span>.
              </p>
            </div>

            <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-xl px-4 py-3 text-left">
              <BotOff className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed">
                {whatsappData?.chatbot_name ? (
                  <>
                    The chatbot{" "}
                    <span className="font-semibold">
                      {whatsappData.chatbot_name}
                    </span>{" "}
                    will stop responding to all client messages right away.
                  </>
                ) : (
                  <>
                    Any active chatbot or automated workflow linked to this
                    WhatsApp number will{" "}
                    <span className="font-semibold">stop functioning</span>{" "}
                    right away.
                  </>
                )}
              </p>
            </div>

            <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-left">
              <Link2Off className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Scheduled appointment reminders and follow-up messages via
                WhatsApp will no longer be delivered to your{" "}
                <span className="font-semibold">clients</span>.
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Actions */}
        <div className="mt-2 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onClose(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={isLoading}
            className="flex-1 text-white flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Removing...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Yes, Remove
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteWhatsAppDialog;