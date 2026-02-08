"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { ConnectWhatsAppDialogProps } from "@/Types/ClientPanel/ManageSalonTypes/WhatsAppTypes/WhatsAppTypes";
import { Formik } from "formik";

const ConnectWhatsAppDialog: React.FC<ConnectWhatsAppDialogProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <h2 className="text-lg font-semibold">Connect WhatsApp</h2>
        </DialogHeader>
        <DialogDescription>
          Connect your WhatsApp account to start sending and receiving messages.
        </DialogDescription>
      </DialogContent>
      <Formik></Formik>
    </Dialog>
  );
};

export default ConnectWhatsAppDialog;
