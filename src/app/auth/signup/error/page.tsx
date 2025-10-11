"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertTriangle,
  LoaderPinwheel,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function VerifyErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState("Something went wrong.");
  const [errorType, setErrorType] = useState("default");

  useEffect(() => {
    const error = searchParams.get("error");

    if (error === "invalid_link") {
      setErrorMessage("The verification link is invalid or malformed.");
      setErrorType("invalid");
    } else if (error === "expired_or_invalid") {
      setErrorMessage(
        "The verification link has expired or is no longer valid.",
      );
      setErrorType("expired");
    } else {
      setErrorMessage("An unexpected error occurred during verification.");
      setErrorType("default");
    }
  }, [searchParams]);

  const getIcon = () => {
    switch (errorType) {
      case "invalid":
        return <XCircle className="text-destructive mx-auto mb-4 h-16 w-16" />;
      case "expired":
        return (
          <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-amber-500" />
        );
      default:
        return <XCircle className="text-destructive mx-auto mb-4 h-16 w-16" />;
    }
  };

  const handleRetry = () => {
    router.push("/auth/signup");
  };

  return (
    <div className="from-background to-muted/20 flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
      <div className="w-full max-w-md">
        <Card className="border-2 shadow-lg">
          <CardHeader className="space-y-4 text-center">
            {getIcon()}
            <CardTitle className="text-foreground text-2xl font-bold">
              Email Verification Failed
            </CardTitle>
            <CardDescription className="text-base">
              We couldn&apos;t verify your email address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert
              variant={errorType === "expired" ? "default" : "destructive"}
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm font-medium">
                {errorMessage}
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button onClick={handleRetry} className="w-full" size="lg">
                <RotateCcw className="mr-2 h-4 w-4" />
                Try Again
              </Button>

              <div className="text-center">
                <p className="text-muted-foreground text-sm">
                  Need help?{" "}
                  <Button
                    variant="link"
                    className="text-primary h-auto p-0 text-sm font-medium hover:underline"
                    onClick={() => router.push("/contact")}
                  >
                    Contact Support
                  </Button>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-xs">
            If you continue to experience issues, please check your email for
            the latest verification link.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center">
          <LoaderPinwheel className="h-10 w-10 animate-spin" />
        </div>
      }
    >
      <VerifyErrorContent />
    </Suspense>
  );
}
