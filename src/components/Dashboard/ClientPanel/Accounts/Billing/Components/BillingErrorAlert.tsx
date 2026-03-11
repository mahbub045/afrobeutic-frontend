"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { CircleAlert } from "lucide-react";

export default function BillingErrorAlert({
  onRetry,
  errorMessage,
}: {
  onRetry: () => void;
  errorMessage?: string;
}) {
  return (
    <Alert
      variant="destructive"
      className="flex flex-col items-center text-center"
    >
      <CircleAlert className="mb-2 !h-10 !w-10" />
      <AlertDescription>
        <p>
          {errorMessage ??
            "Please try again. If the issue persists, contact support."}
        </p>
      </AlertDescription>
    </Alert>
  );
}
