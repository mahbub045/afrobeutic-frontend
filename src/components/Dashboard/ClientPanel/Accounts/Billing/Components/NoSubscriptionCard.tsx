"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import Link from "next/link";

export default function NoSubscriptionCard() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-4 w-4" /> No subscription found
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-muted-foreground text-sm">
          We couldn’t find an active subscription for this account.
        </p>
        <Button asChild>
          <Link href="/dashboard/client-panel/accounts/pricing-plans">
            View pricing plans
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
