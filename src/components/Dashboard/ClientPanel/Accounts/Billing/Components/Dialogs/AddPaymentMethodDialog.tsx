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
import { useAddPaymentMethodMutation } from "@/Redux/Reducers/ClientPanel/Accounts/Billing/BillingApi";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export default function AddPaymentMethodDialog({
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const { data: session } = useSession();
  const { resolvedTheme } = useTheme();

  const [addPaymentMethod, { isLoading }] = useAddPaymentMethodMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setIsSubmitting(false);
    }
  }, [open]);

  const cardOptions = useMemo(
    () => ({
      hidePostalCode: true,
      style: {
        base: {
          fontFamily: "inherit",
          fontSize: "16px",
          color: resolvedTheme === "dark" ? "#e6eef0" : "#111827",
          "::placeholder": {
            color: resolvedTheme === "dark" ? "#94a3b8" : "#6b7280",
          },
        },
        invalid: {
          color: "#ef4444",
        },
      },
    }),
    [resolvedTheme],
  );

  const handleAddPaymentMethod = async () => {
    if (!stripe || !elements) {
      toast.error(
        "Stripe is not ready. Please refresh and try again (or configure Stripe publishable key).",
      );
      return;
    }

    const card = elements.getElement(CardElement);
    if (!card) {
      toast.error("Card input not ready. Please try again.");
      return;
    }

    try {
      setIsSubmitting(true);

      const pmResult = await stripe.createPaymentMethod({
        type: "card",
        card,
        billing_details: {
          email: session?.user?.email ?? undefined,
          name:
            (session?.user as { name?: string } | undefined)?.name ?? undefined,
        },
      });

      if (pmResult.error) {
        toast.error(
          pmResult.error.message || "Failed to create payment method.",
        );
        return;
      }

      const paymentMethodId = pmResult.paymentMethod?.id;
      if (!paymentMethodId) {
        toast.error("Payment method ID is missing. Please try again.");
        return;
      }

      await addPaymentMethod({ payment_method_id: paymentMethodId }).unwrap();

      toast.success("Payment method added successfully.");
      onOpenChange(false);
      onSuccess?.();
    } catch (e) {
      console.error(e);
      const message =
        (e as { data?: { message?: string } })?.data?.message ||
        "Failed to add payment method. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-primary">Add payment method</DialogTitle>
          <DialogDescription>
            Add a new card to your account for subscriptions and invoices.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <div className="text-sm font-medium">Card details</div>
          <div className="rounded-md border p-3">
            <CardElement options={cardOptions} />
          </div>
          <p className="text-muted-foreground text-xs">
            Your card details are securely processed by Stripe.
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={handleAddPaymentMethod}
            disabled={!stripe || !elements || isLoading || isSubmitting}
            className="w-full"
          >
            {isLoading || isSubmitting ? "Adding..." : "Add card"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
