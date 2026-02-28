"use client";
import {
  useGetbillingHistoryQuery,
  useGetBillingInfoQuery,
} from "@/Redux/Reducers/ClientPanel/Accounts/Billing/BillingApi";
import { BillingSubscription } from "@/Types/ClientPanel/Accounts/BillingTypes";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { formatChoiceFieldValue, formatDateTime } from "@/lib/utils";
import { CircleAlert, RefreshCcw, Sparkles } from "lucide-react";
import Link from "next/link";
import React from "react";
import Breadcrumbs from "../../../CommonComponents/Breadcrumbs";
import BillingErrorAlert from "./Components/BillingErrorAlert";
import BillingHistoryCard from "./Components/BillingHistoryCard";
import BillingLoadingSkeleton from "./Components/BillingLoadingSkeleton";
import CurrentPlanCard from "./Components/CurrentPlanCard";
import NoSubscriptionCard from "./Components/NoSubscriptionCard";
import NotesCard from "./Components/NotesCard";
import PlanLimitsCard from "./Components/PlanLimitsCard";
import SubscriptionDetailsCard from "./Components/SubscriptionDetailsCard";

const BillingContainer: React.FC = () => {
  const [billingHistoryPage, setBillingHistoryPage] = React.useState(1);

  const {
    data: billingData,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useGetBillingInfoQuery(undefined);

  const billingHistoryParams = React.useMemo(
    () => ({ page: billingHistoryPage }),
    [billingHistoryPage],
  );

  const {
    data: billingHistoryData,
    isLoading: isBillingHistoryLoading,
    isError: isBillingHistoryError,
    refetch: refetchBillingHistory,
  } = useGetbillingHistoryQuery(billingHistoryParams);

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
        <BillingLoadingSkeleton />
      ) : isError ? (
        <BillingErrorAlert onRetry={() => refetch()} />
      ) : !subscription ? (
        <NoSubscriptionCard />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <CurrentPlanCard
              plan={plan}
              statusColorClass={statusColorClass}
              statusLabel={statusLabel}
            />

            <PlanLimitsCard plan={plan} />
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

            <SubscriptionDetailsCard
              subscription={subscription}
              statusColorClass={statusColorClass}
              statusLabel={statusLabel}
            />

            <NotesCard notes={subscription.notes} />
          </div>
        </div>
      )}
      {isBillingHistoryLoading ? (
        <BillingLoadingSkeleton />
      ) : isBillingHistoryError ? (
        <BillingErrorAlert onRetry={() => refetchBillingHistory()} />
      ) : billingHistoryData ? (
        <div>
          <BillingHistoryCard
            data={billingHistoryData}
            page={billingHistoryPage}
            onPageChange={setBillingHistoryPage}
          />
        </div>
      ) : null}
    </div>
  );
};

export default BillingContainer;
