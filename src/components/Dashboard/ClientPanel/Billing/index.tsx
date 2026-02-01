"use client";
import {
  useGetBillingInfoQuery,
  useUpdateSubscriptionAutoRenewMutation,
} from "@/Redux/Reducers/ClientPanel/Billing/BillingApi";
import { BillingSubscription } from "@/Types/ClientPanel/Billing/BillingTypes";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatChoiceFieldValue,
  formatDateTime,
  formatPrice,
  safe,
} from "@/lib/utils";
import {
  BadgeCheck,
  Calendar,
  CircleAlert,
  CreditCard,
  Info,
  RefreshCcw,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Breadcrumbs from "../../CommonComponents/Breadcrumbs";

const BillingContainer: React.FC = () => {
  const {
    data: billingData,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useGetBillingInfoQuery(undefined);

  const subscription = billingData as BillingSubscription | undefined;
  const plan = subscription?.pricing_plan;

  const status = subscription?.status;
  const statusLabel = status ? formatChoiceFieldValue(status) : "Unknown";

  const statusColorClass = (() => {
    const normalized = (status ?? "").toUpperCase();
    if (normalized === "ACTIVE") return "bg-emerald-600 text-white";
    if (normalized === "TRIAL" || normalized === "TRIALING")
      return "bg-blue-600 text-white";
    if (normalized === "PAST_DUE") return "bg-warning text-black";
    if (normalized === "CANCELLED" || normalized === "CANCELED")
      return "bg-danger text-white";
    if (normalized === "EXPIRED") return "bg-zinc-700 text-white";
    return "bg-secondary text-white";
  })();

  function AutoRenewControl({
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

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard/client-panel" },
          {
            label: "Billing",
            href: "/dashboard/client-panel/accounts/billing",
          },
        ]}
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
          <p className="text-muted-foreground text-sm">
            View your subscription status, plan details, and limits.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="outline">
            <Link href="/dashboard/client-panel/accounts/pricing-plans">
              <Sparkles className="mr-2 h-4 w-4" /> Pricing plans
            </Link>
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            {isFetching ? "Refreshing…" : "Refresh"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-4 w-96" />
                <Skeleton className="h-4 w-80" />
                <Separator />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-44" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-10/12" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-44" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-10/12" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-28" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : isError ? (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>Couldn’t load billing information</AlertTitle>
          <AlertDescription>
            <p>Please try again. If the issue persists, contact support.</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="destructive"
                onClick={() => refetch()}
              >
                Retry
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/client-panel">Back to dashboard</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : !subscription ? (
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
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
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
                  {/* <Button
                    type="button"
                    variant="outline"
                    className="sm:w-auto"
                    disabled
                    title="Coming soon"
                  >
                    Manage payment method
                  </Button> */}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Plan limits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Feature</TableHead>
                        <TableHead className="text-right">Limit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Salon limit</TableCell>
                        <TableCell className="text-right">
                          {safe(plan?.salon_limit)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>WhatsApp chatbot limit</TableCell>
                        <TableCell className="text-right">
                          {safe(plan?.whatsapp_chatbot_limit)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Messages per chatbot</TableCell>
                        <TableCell className="text-right">
                          {safe(plan?.whatsapp_messages_per_chatbot)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Broadcasting</TableCell>
                        <TableCell className="text-right">
                          {plan?.has_broadcasting
                            ? `Yes (limit ${safe(plan?.broadcasting_message_limit)})`
                            : "No"}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {subscription?.cancelled_at ? (
              <Alert className="border-warning/40 bg-warning/10">
                <CircleAlert className="text-warning" />
                <AlertTitle>Cancellation scheduled</AlertTitle>
                <AlertDescription>
                  <p>
                    Your subscription is set to cancel on{" "}
                    <span className="font-medium">
                      {formatDateTime(subscription.cancelled_at)}
                    </span>
                    .
                  </p>
                </AlertDescription>
              </Alert>
            ) : null}

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
                  <span className="text-muted-foreground text-sm">
                    Auto renew
                  </span>

                  {/* Editable auto-renew control */}
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

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  {subscription.notes ? subscription.notes : "No notes."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingContainer;
