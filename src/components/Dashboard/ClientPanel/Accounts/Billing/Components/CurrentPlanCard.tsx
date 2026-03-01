"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice, safe } from "@/lib/utils";
import { BillingSubscription } from "@/Types/ClientPanel/Accounts/BillingTypes";
import { BadgeCheck, CreditCard } from "lucide-react";
import Link from "next/link";

type PricingPlan = BillingSubscription["pricing_plan"] | undefined;

export default function CurrentPlanCard({
  plan,
  statusColorClass,
  statusLabel,
}: {
  plan: PricingPlan;
  statusColorClass: string;
  statusLabel: string;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" /> Current plan
          </span>
          <Badge className={statusColorClass}>
            <BadgeCheck className="h-3.5 w-3.5" /> {statusLabel}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <div className="text-primary text-2xl font-semibold">
              {safe(plan?.name)}
            </div>
            <div className="text-muted-foreground text-sm">
              {plan?.description
                ? plan.description
                : "No description provided."}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              {formatPrice(plan?.price)}
              <span className="text-muted-foreground ml-1 text-sm font-normal">
                /month
              </span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild className="sm:w-auto">
            <Link href="/dashboard/client-panel/accounts/pricing-plans">
              Change plan
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
