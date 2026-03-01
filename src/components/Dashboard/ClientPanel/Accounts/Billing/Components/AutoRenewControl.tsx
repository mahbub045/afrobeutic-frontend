"use client";

import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useUpdateSubscriptionAutoRenewMutation } from "@/Redux/Reducers/ClientPanel/Accounts/Billing/BillingApi";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function AutoRenewControl({
  subscriptionAutoRenew,
}: {
  subscriptionAutoRenew: boolean;
}) {
  const [value, setValue] = useState<boolean>(subscriptionAutoRenew);

  useEffect(() => {
    setValue(subscriptionAutoRenew);
  }, [subscriptionAutoRenew]);

  const [updateAutoRenew, { isLoading }] =
    useUpdateSubscriptionAutoRenewMutation();

  const handleToggle = async (checked: boolean | undefined) => {
    const newValue = !!checked;
    const prev = value;
    setValue(newValue);

    try {
      await updateAutoRenew({ auto_renew: newValue }).unwrap();
      toast.success("Auto-renew updated.");
    } catch (e) {
      console.error(e);
      setValue(prev);
      const message =
        (e as { data?: { message?: string } })?.data?.message ||
        "Failed to update auto-renew. Please try again.";
      toast.error(message);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant={value ? "default" : "danger"}>
        {value ? "Enabled" : "Disabled"}
      </Badge>

      <Switch
        checked={value}
        onCheckedChange={handleToggle}
        disabled={isLoading}
      />
    </div>
  );
}
