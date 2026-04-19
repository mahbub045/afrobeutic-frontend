"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatChoiceFieldValue,
  formatDateTime,
  getCurrencySymbol,
} from "@/lib/utils";
import { useGetSubscriptionDetailsQuery } from "@/Redux/Reducers/AdminPanel/Subscriptions/SubscriptionsApi";
import { CalendarDays, CreditCard, Settings, User } from "lucide-react";
import { useParams } from "next/navigation";

const SubscriptionDetails: React.FC = () => {
  const { subscriptionuid } = useParams();
  const { data: subscriptionDetailsData, isLoading } =
    useGetSubscriptionDetailsQuery({
      subscriptionUid: subscriptionuid,
    });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/4 rounded bg-gray-200"></div>
          <div className="h-64 rounded bg-gray-200"></div>
          <div className="h-48 rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  if (!subscriptionDetailsData) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Subscription not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const subscription = subscriptionDetailsData;

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "default";
      case "trial":
        return "secondary";
      case "cancelled":
        return "destructive";
      case "expired":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Subscription Details
          </h1>
          <p className="text-muted-foreground">ID: {subscription.uid}</p>
        </div>
        <Badge
          variant={getStatusBadgeVariant(subscription.status)}
          className="px-6 py-1 text-lg"
        >
          {formatChoiceFieldValue(subscription.status)}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Subscription Overview */}
        <Card className="shadow-md dark:shadow-gray-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Subscription Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm font-medium">
                  Status
                </span>
                <Badge variant={getStatusBadgeVariant(subscription.status)}>
                  {formatChoiceFieldValue(subscription.status)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm font-medium">
                  Auto Renew
                </span>
                <Badge variant={subscription.auto_renew ? "default" : "danger"}>
                  {subscription.auto_renew ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              {subscription.cancelled_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm font-medium">
                    Cancelled At
                  </span>
                  <span className="text-sm">
                    {formatDateTime(subscription.cancelled_at)}
                  </span>
                </div>
              )}
              {subscription.notes ? (
                <div>
                  <span className="text-muted-foreground text-sm font-medium">
                    Notes
                  </span>
                  <p className="bg-muted mt-1 rounded p-2 text-sm">
                    {subscription.notes}
                  </p>
                </div>
              ) : (
                <div>
                  <span className="text-muted-foreground text-sm font-medium">
                    Notes
                  </span>
                  <p className="mt-1 text-sm">No notes available.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Billing Information */}
        <Card className="shadow-md dark:shadow-gray-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Billing Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm font-medium">
                  Start Date
                </span>
                <span className="text-sm">
                  {formatDateTime(subscription.start_date)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm font-medium">
                  End Date
                </span>
                <span className="text-sm">
                  {formatDateTime(subscription.end_date)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm font-medium">
                  Next Billing
                </span>
                <span className="text-sm">
                  {formatDateTime(subscription.next_billing_date)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm font-medium">
                  Created At
                </span>
                <span className="text-sm">
                  {formatDateTime(subscription.created_at)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Plan Details */}
      <Card className="shadow-md dark:shadow-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Pricing Plan Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">
                  {subscription.pricing_plan.name}
                </h3>
                <p className="text-primary text-2xl font-bold">
                  {getCurrencySymbol()}
                  {subscription.pricing_plan.price}
                  <span className="text-muted-foreground text-sm font-normal">
                    /month
                  </span>
                </p>
                <Badge
                  variant={
                    subscription.pricing_plan.is_active
                      ? "default"
                      : "secondary"
                  }
                >
                  {subscription.pricing_plan.is_active
                    ? "Active Plan"
                    : "Inactive Plan"}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground text-sm font-medium">
                  Account Category
                </span>
                <p className="mt-1 text-sm">
                  <span className="bg-primary/50 rounded px-2 py-1 font-medium text-white">
                    {formatChoiceFieldValue(
                      subscription.pricing_plan.account_category,
                    )}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm font-medium">
                  Description
                </span>
                <p className="mt-1 text-sm">
                  {subscription.pricing_plan.description}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Plan Features</h4>
              <div className="grid gap-2">
                <div className="bg-muted flex justify-between rounded p-3">
                  <span className="text-sm">Salon Limit</span>
                  <span className="text-sm font-medium">
                    {subscription.pricing_plan.salon_limit}
                  </span>
                </div>
                <div className="bg-muted flex justify-between rounded p-3">
                  <span className="text-sm">WhatsApp Chatbot Limit</span>
                  <span className="text-sm font-medium">
                    {subscription.pricing_plan.whatsapp_chatbot_limit}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card className="shadow-md dark:shadow-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div>
                <span className="text-muted-foreground text-sm font-medium">
                  Account Name
                </span>
                <p className="mt-1 text-sm font-medium">
                  {subscription.account.name}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm font-medium">
                  Account ID
                </span>
                <p className="text-muted-foreground mt-1 font-mono text-sm">
                  {subscription.account.uid}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-muted-foreground text-sm font-medium">
                  Owner Name
                </span>
                <p className="mt-1 text-sm">
                  {subscription.account.owner_name}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm font-medium">
                  Owner Email
                </span>
                <p className="mt-1 text-sm">
                  {subscription.account.owner_email}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionDetails;
