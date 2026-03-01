"use client";

import AddPaymentMethodDialog from "@/components/Dashboard/ClientPanel/Accounts/Billing/Components/Dialogs/AddPaymentMethodDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/lib/utils";
import {
  useAddPaymentMethodMutation,
  useCreateOrUpdateSubscriptionMutation,
  useGetAddCardListQuery,
} from "@/Redux/Reducers/ClientPanel/Accounts/Billing/BillingApi";
import { PricingPlanTypes } from "@/Types/AdminPanel/PricingPlansTypes/PricingPlansTypes";
import type { SavedCardItem } from "@/Types/ClientPanel/Accounts/BillingTypes";
import { skipToken } from "@reduxjs/toolkit/query";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
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

function extractCardUidFromAddCardResponse(response: unknown): string | null {
  if (!response || typeof response !== "object") return null;

  const obj = response as Record<string, unknown>;
  const directUid = obj.uid;
  if (
    typeof directUid === "string" &&
    directUid.trim() &&
    directUid.trim() !== "undefined"
  ) {
    return directUid.trim();
  }

  const card = obj.card;
  if (card && typeof card === "object") {
    const cardUid = (card as Record<string, unknown>).uid;
    if (
      typeof cardUid === "string" &&
      cardUid.trim() &&
      cardUid.trim() !== "undefined"
    ) {
      return cardUid.trim();
    }
  }

  const data = obj.data;
  if (data && typeof data === "object") {
    const dataUid = (data as Record<string, unknown>).uid;
    if (
      typeof dataUid === "string" &&
      dataUid.trim() &&
      dataUid.trim() !== "undefined"
    ) {
      return dataUid.trim();
    }
  }

  return null;
}

function normalizeCardUid(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  if (!cleaned || cleaned === "undefined") return null;
  return cleaned;
}

export default function SubscribeToPlanDialog({
  open,
  onOpenChange,
  plan,
  onSuccess,
}: Props) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const { data: session } = useSession();
  const { resolvedTheme } = useTheme();

  const [createOrUpdateSubscription, { isLoading }] =
    useCreateOrUpdateSubscriptionMutation();
  const [addPaymentMethod] = useAddPaymentMethodMutation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCardUid, setSelectedCardUid] = useState<string>("new");
  const [addCardOpen, setAddCardOpen] = useState(false);

  const {
    data: cardListData,
    isFetching: isFetchingCards,
    refetch: refetchCards,
  } = useGetAddCardListQuery(open ? { page: 1 } : skipToken);

  const savedCards: SavedCardItem[] = useMemo(() => {
    const raw =
      (cardListData as { results?: unknown[] } | undefined)?.results ?? [];

    // Normalize uid across possible backend shapes: { uid } or { card_uid }.
    const normalized = raw
      .map((card, index) => {
        const obj = card as Record<string, unknown>;
        const uid = normalizeCardUid(obj.uid ?? obj.card_uid);
        if (!uid) return null;
        return {
          card: { ...obj, uid } as unknown as SavedCardItem,
          index,
        };
      })
      .filter(Boolean) as Array<{ card: SavedCardItem; index: number }>;

    // Ensure default card is always listed first.
    normalized.sort((a, b) => {
      const aDefault = a.card.is_default ? 1 : 0;
      const bDefault = b.card.is_default ? 1 : 0;
      if (aDefault !== bDefault) return bDefault - aDefault;
      return a.index - b.index;
    });

    return normalized.map((x) => x.card);
  }, [cardListData]);

  const defaultCard = useMemo(
    () => savedCards.find((card) => card.is_default) ?? null,
    [savedCards],
  );

  const selectedSavedCard = useMemo(() => {
    if (selectedCardUid === "new") return null;
    return savedCards.find((card) => card.uid === selectedCardUid) ?? null;
  }, [savedCards, selectedCardUid]);

  useEffect(() => {
    if (!open) {
      setIsSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    if (savedCards.length === 0) {
      setSelectedCardUid("new");
      return;
    }

    // Default behavior: when opening from "Get Now", use the default saved card.
    const nextSelected = defaultCard?.uid ?? savedCards[0]?.uid;
    if (nextSelected) setSelectedCardUid(nextSelected);
  }, [open, savedCards, defaultCard?.uid]);

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

    try {
      setIsSubmitting(true);

      let paymentMethodId: string | undefined;
      let cardUidToUse: string | undefined;

      if (selectedSavedCard) {
        cardUidToUse = normalizeCardUid(selectedSavedCard.uid) ?? undefined;
        if (!cardUidToUse) {
          toast.error(
            "Selected saved card is missing a valid UID. Please re-select a card or add a new one.",
          );
          return;
        }
      } else {
        // "New card" flow
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

        const pmResult = await stripe.createPaymentMethod({
          type: "card",
          card,
          billing_details: {
            email: session?.user?.email ?? undefined,
            name:
              (session?.user as { name?: string } | undefined)?.name ??
              undefined,
          },
        });

        if (pmResult.error) {
          toast.error(
            pmResult.error.message || "Failed to create payment method.",
          );
          return;
        }

        paymentMethodId = pmResult.paymentMethod?.id;
        if (!paymentMethodId) {
          toast.error("Payment method ID is missing. Please try again.");
          return;
        }

        // Save the payment method on the backend so we can reference it by card UID.
        const addCardResponse = await addPaymentMethod({
          payment_method_id: paymentMethodId,
        }).unwrap();

        const responseUid = extractCardUidFromAddCardResponse(addCardResponse);

        if (responseUid) {
          cardUidToUse = responseUid;
        } else {
          // Fallback: refetch saved cards and try to locate the newly added one.
          const refetched = await refetchCards();
          const refetchedData = (refetched as unknown as { data?: unknown })
            .data as
            | { results?: SavedCardItem[] }
            | { data?: { results?: SavedCardItem[] } }
            | undefined;
          const refetchedCards =
            (refetchedData as { results?: SavedCardItem[] } | undefined)
              ?.results ??
            (
              refetchedData as
                | { data?: { results?: SavedCardItem[] } }
                | undefined
            )?.data?.results ??
            [];

          const pmCard = pmResult.paymentMethod?.card;
          const last4 = pmCard?.last4 ?? undefined;
          const brand = pmCard?.brand ?? undefined;
          const expMonth = pmCard?.exp_month ?? undefined;
          const expYear = pmCard?.exp_year ?? undefined;

          const matched = refetchedCards.find((c) => {
            const brandMatches =
              brand &&
              String(c.card_brand).toLowerCase() ===
                String(brand).toLowerCase();
            const last4Matches = last4 && c.last_four === last4;
            const expMatches =
              (typeof expMonth === "number"
                ? c.expiry_month === expMonth
                : true) &&
              (typeof expYear === "number" ? c.expiry_year === expYear : true);
            return Boolean(brandMatches && last4Matches && expMatches);
          });

          const matchedUid = normalizeCardUid(
            (matched as unknown as Record<string, unknown> | undefined)?.uid ??
              (matched as unknown as Record<string, unknown> | undefined)
                ?.card_uid,
          );
          if (matchedUid) {
            cardUidToUse = matchedUid;
          }
        }

        if (!cardUidToUse) {
          toast.error(
            "Could not determine the saved card UID. Please add the card, then select it from the list and try again.",
          );
          return;
        }
      }

      const response = await createOrUpdateSubscription(
        cardUidToUse
          ? {
              pricing_plan: plan.uid,
              payment_card: cardUidToUse,
            }
          : { pricing_plan: plan.uid },
      ).unwrap();

      const clientSecret = extractClientSecret(response);
      if (clientSecret) {
        // If backend uses `payment_behavior=default_incomplete`, it should return
        // the invoice PaymentIntent client_secret for SCA/3DS confirmation.
        if (!stripe) {
          toast.error(
            "Stripe is not ready for payment confirmation. Please refresh and try again.",
          );
          return;
        }

        const confirm = paymentMethodId
          ? await stripe.confirmCardPayment(clientSecret, {
              payment_method: paymentMethodId,
            })
          : await stripe.confirmCardPayment(clientSecret);

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
      router.push("/dashboard/client-panel/accounts/billing");
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
          <div className="text-sm font-medium">Payment method</div>
          {savedCards.length > 0 ? (
            <Select value={selectedCardUid} onValueChange={setSelectedCardUid}>
              <SelectTrigger>
                <SelectValue placeholder="Select a card" />
              </SelectTrigger>
              <SelectContent>
                {savedCards.map((card) => (
                  <SelectItem key={card.uid} value={card.uid}>
                    {String(card.card_brand).toUpperCase()} ••••{card.last_four}
                  </SelectItem>
                ))}
                <SelectItem value="new">Use a new card</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="text-muted-foreground text-sm">
              No saved cards yet. Use a new card below.
            </div>
          )}
          <Button
            type="button"
            variant="link"
            className="h-auto w-fit p-0"
            onClick={() => setAddCardOpen(true)}
            disabled={isFetchingCards}
          >
            + Add payment method
          </Button>
        </div>

        <AddPaymentMethodDialog
          open={addCardOpen}
          onOpenChange={setAddCardOpen}
          onSuccess={() => {
            refetchCards();
          }}
        />

        {selectedCardUid === "new" ? (
          <div className="space-y-2">
            <div className="text-sm font-medium">Card details</div>
            <div className="rounded-md border p-3">
              <CardElement options={cardOptions} />
            </div>
            <p className="text-muted-foreground text-xs">
              Your card details are securely processed by Stripe.
            </p>
          </div>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            onClick={handleSubscribe}
            disabled={
              !plan ||
              isLoading ||
              isSubmitting ||
              (selectedCardUid === "new" && (!stripe || !elements))
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
