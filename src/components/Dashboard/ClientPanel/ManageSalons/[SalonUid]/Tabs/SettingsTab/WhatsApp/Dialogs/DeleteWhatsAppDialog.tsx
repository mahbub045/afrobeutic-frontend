import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteWhatsAppOnboardMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/WhatsApp/WhatsAppApi";
import { WhatsAppOnboardData } from "@/Types/ClientPanel/ManageSalonTypes/WhatsAppTypes/WhatsAppTypes";
import { useParams } from "next/navigation";
import React from "react";
import { toast } from "react-toastify";

interface DeleteWhatsAppDialogProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  whatsappData?: WhatsAppOnboardData;
}

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
          <DialogTitle className="text-primary">Remove Chatbot</DialogTitle>
          <DialogDescription className="text-xs">
            {whatsappData?.chatbot_name
              ? `Delete chatbot "${whatsappData.chatbot_name}" and disconnect WhatsApp?`
              : "Are you sure you want to remove the WhatsApp connection?"}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onClose(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={isLoading}
            className="w-32"
          >
            {isLoading ? "Removing..." : "Remove"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteWhatsAppDialog;
