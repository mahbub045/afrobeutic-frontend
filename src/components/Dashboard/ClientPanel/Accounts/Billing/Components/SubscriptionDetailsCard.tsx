"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDateTime } from "@/lib/utils";
import { BillingSubscription } from "@/Types/ClientPanel/Accounts/BillingTypes";
import { Calendar } from "lucide-react";
import AutoRenewControl from "./AutoRenewControl";

export default function SubscriptionDetailsCard({
  subscription,
  statusColorClass,
  statusLabel,
}: {
  subscription: BillingSubscription;
  statusColorClass: string;
  statusLabel: string;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" /> Subscription details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground text-sm">Status</span>
          <Badge className={statusColorClass}>{statusLabel}</Badge>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground text-sm">Auto renew</span>

          <AutoRenewControl
            subscriptionAutoRenew={!!subscription?.auto_renew}
          />
        </div>

        <Separator />
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Start date</span>
            <span className="font-medium">
              {formatDateTime(subscription.start_date)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">End date</span>
            <span className="font-medium">
              {formatDateTime(subscription.end_date)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Next billing</span>
            <span className="font-medium">
              {formatDateTime(subscription.next_billing_date)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
