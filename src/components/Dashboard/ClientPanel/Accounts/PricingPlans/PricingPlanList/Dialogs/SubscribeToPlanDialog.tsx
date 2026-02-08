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
import { formatPrice } from "@/lib/utils";
import { useCreateOrUpdateSubscriptionMutation } from "@/Redux/Reducers/ClientPanel/Accounts/Billing/BillingApi";
import { PricingPlanTypes } from "@/Types/AdminPanel/PricingPlansTypes/PricingPlansTypes";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: PricingPlanTypes | null;
  onSuccess?: () => void;
};

type MaybeSubscriptionResponse = {
  client_secret?: string;
  payment_intent_client_secret?: string;
  setup_intent_client_secret?: string;
  message?: string;
};

function extractClientSecret(response: unknown): string | null {
  const anyResponse = response as Record<string, unknown> | null;
  if (!anyResponse) return null;

  const direct = anyResponse as MaybeSubscriptionResponse;
  const clientSecret =
    direct.client_secret ||
    direct.payment_intent_client_secret ||
    direct.setup_intent_client_secret;

  return clientSecret ?? null;
}

export default function SubscribeToPlanDialog({
  open,
  onOpenChange,
  plan,
  onSuccess,
}: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const { data: session } = useSession();
  const { resolvedTheme } = useTheme();

  const [createOrUpdateSubscription, { isLoading }] =
    useCreateOrUpdateSubscriptionMutation();

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

  const handleSubscribe = async () => {
    if (!plan) return;

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
      console.log("paymentMethodId:::", paymentMethodId);
      console.log("paymentResult:::", pmResult);
      if (!paymentMethodId) {
        toast.error("Payment method ID is missing. Please try again.");
        return;
      }

      const response = await createOrUpdateSubscription({
        pricing_plan: plan.uid,
        payment_method_id: paymentMethodId,
      }).unwrap();

      const clientSecret = extractClientSecret(response);
      if (clientSecret) {
        // If backend uses `payment_behavior=default_incomplete`, it should return
        // the invoice PaymentIntent client_secret for SCA/3DS confirmation.
        const confirm = await stripe.confirmCardPayment(clientSecret, {
          payment_method: paymentMethodId,
        });

        if (confirm.error) {
          toast.error(confirm.error.message || "Payment confirmation failed.");
          return;
        }

        const status = confirm.paymentIntent?.status;
        if (status && status !== "succeeded" && status !== "processing") {
          toast.error(`Payment status: ${status}`);
          return;
        }
      }

      toast.success("Subscription created successfully.");
      onOpenChange(false);
      onSuccess?.();
    } catch (e) {
      console.error(e);
      const message =
        (e as { data?: { message?: string } })?.data?.message ||
        "Failed to create subscription. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-primary">Subscribe</DialogTitle>
          <DialogDescription>
            {plan
              ? `Subscribe to ${plan.name} (${formatPrice(plan.price)}/month)`
              : "Select a plan to continue."}
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
            onClick={handleSubscribe}
            disabled={
              !plan || !stripe || !elements || isLoading || isSubmitting
            }
            className="w-full"
          >
            {isLoading || isSubmitting
              ? "Processing..."
              : "Confirm subscription"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
