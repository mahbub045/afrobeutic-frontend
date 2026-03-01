"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CircleAlert } from "lucide-react";
import Link from "next/link";

export default function BillingErrorAlert({
  onRetry,
}: {
  onRetry: () => void;
}) {
  return (
    <Alert variant="destructive">
      <CircleAlert />
      <AlertTitle>Couldn’t load billing information</AlertTitle>
      <AlertDescription>
        <p>Please try again. If the issue persists, contact support.</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Button type="button" variant="destructive" onClick={onRetry}>
            Retry
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/client-panel">Back to dashboard</Link>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
