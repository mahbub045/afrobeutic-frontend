"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteCardMutation } from "@/Redux/Reducers/ClientPanel/Accounts/Billing/BillingApi";
import type { CardDeleteProps } from "@/Types/ClientPanel/Accounts/BillingTypes";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

export default function DeletePaymentMethodDialog({
  open,
  onOpenChange,
  card,
  onSuccess,
}: CardDeleteProps) {
  const [deleteCard, { isLoading }] = useDeleteCardMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setIsSubmitting(false);
    }
  }, [open]);

  const cardLabel = useMemo(() => {
    if (!card) return "this card";
    return `••••${card.last_four}`;
  }, [card]);

  const handleDelete = async () => {
    if (!card) {
      toast.error("No card selected.");
      return;
    }

    try {
      setIsSubmitting(true);
      await deleteCard({ card_uid: card.uid, payload: undefined }).unwrap();
      toast.success("Payment method deleted.");
      onOpenChange(false);
      onSuccess?.();
    } catch (e) {
      console.error(e);
      const message =
        (e as { data?: { message?: string } })?.data?.message ||
        "Failed to delete payment method. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-primary">
            Delete payment method
          </DialogTitle>
          <DialogDescription>
            This will remove{" "}
            <span className="text-danger font-bold">{cardLabel}</span> from your
            saved cards.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading || isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            disabled={!card || isLoading || isSubmitting}
            className="w-full sm:w-auto"
          >
            {isLoading || isSubmitting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
