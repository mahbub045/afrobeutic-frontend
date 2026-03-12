"use client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import {
  useGetPricingPlansQuery,
  useValidateSubscriptionMutation,
} from "@/Redux/Reducers/ClientPanel/Accounts/PricingPlans/PricingPlansApi";
import { PricingPlanTypes } from "@/Types/AdminPanel/PricingPlansTypes/PricingPlansTypes";
import { CircleAlert, LoaderPinwheel } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import SubscribeToPlanDialog from "./Dialogs/SubscribeToPlanDialog";

type ValidationResponse = {
  valid?: boolean;
  is_valid?: boolean;
  can_subscribe?: boolean;
  message?: string;
  detail?: string;
  errors?: string[];
};

function combineValidationMessages(parts: Array<string | undefined>): string {
  return Array.from(
    new Set(
      parts
        .map((part) => part?.trim())
        .filter((part): part is string => Boolean(part)),
    ),
  ).join(" ");
}

function getValidationErrorMessage(error: unknown): string {
  if (typeof error === "string" && error.trim()) {
    return error.trim();
  }

  if (typeof error === "object" && error !== null) {
    const errorObject = error as {
      data?: {
        message?: string;
        detail?: string;
        non_field_errors?: string[];
        errors?: string[];
      };
      message?: string;
    };

    const combinedMessage = combineValidationMessages([
      errorObject.data?.message,
      errorObject.data?.detail,
      errorObject.data?.non_field_errors?.join(" "),
      errorObject.data?.errors?.join(" "),
      errorObject.message,
    ]);

    if (combinedMessage) {
      return combinedMessage;
    }
  }

  return "Unable to validate this subscription right now. Please try again.";
}

const PricingPlanList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [selectedPricingPlan, setSelectedPricingPlan] =
    useState<PricingPlanTypes | null>(null);

  const {
    data: pricingPlanData,
    isLoading,
    isError,
    error,
    isFetching,
  } = useGetPricingPlansQuery({ page: currentPage });
  const [validateSubscription, { isLoading: isValidating }] =
    useValidateSubscriptionMutation();

  const pricingPlans = pricingPlanData?.results ?? [];

  const handleGetNow = async (plan: PricingPlanTypes) => {
    try {
      const response = (await validateSubscription({
        pricing_plan: plan.uid,
      }).unwrap()) as ValidationResponse;

      const isValid =
        response.valid ?? response.is_valid ?? response.can_subscribe ?? true;

      if (!isValid) {
        toast.error(
          combineValidationMessages([
            response.message,
            response.detail,
            response.errors?.join(" "),
            "This subscription cannot be started right now.",
          ]),
        );
        return;
      }

      setSelectedPricingPlan(plan);
      setSubscribeOpen(true);
    } catch (error) {
      toast.error(getValidationErrorMessage(error));
    }
  };

  return (
    <>
      <SubscribeToPlanDialog
        open={subscribeOpen}
        onOpenChange={(open) => {
          setSubscribeOpen(open);
          if (!open) setSelectedPricingPlan(null);
        }}
        plan={selectedPricingPlan}
      />

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold md:w-auto">Pricing Plans</h2>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center">
          <LoaderPinwheel size={30} className="text-primary animate-spin" />
        </div>
      ) : isError ? (
        <Alert
          variant="destructive"
          className="flex flex-col items-center text-center"
        >
          <CircleAlert className="mb-2 !h-10 !w-10" />
          <AlertDescription>
            {(error as { data?: { detail?: string } })?.data?.detail ??
              "Please try again. If the issue persists, contact support."}
          </AlertDescription>
        </Alert>
      ) : !pricingPlanData || pricingPlanData.results.length === 0 ? (
        <div className="text-muted-foreground text-center">
          No pricing plans available.
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pricingPlans.map((plan: PricingPlanTypes) => (
              <Card
                key={plan.uid}
                className="mb-2 shadow-md dark:shadow-gray-600"
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-primary text-2xl">{plan.name}</span>
                  </CardTitle>
                  <CardDescription>
                    {plan.description ? (
                      <span className="text-xs">{plan.description}</span>
                    ) : (
                      <small className="text-muted-foreground">
                        No description provided.
                      </small>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <h2 className="my-10 text-center text-4xl font-bold">
                      <span className="text-primary">
                        {formatPrice(plan.price)}
                      </span>
                      <small className="text-xs">/month</small>
                    </h2>
                  </div>
                  <ul className="marker:text-primary list-disc space-y-1 pl-6 text-sm">
                    <li>
                      <strong>Salon Limit -&gt;</strong> {plan.salon_limit}
                    </li>
                    <li>
                      <strong>Chatbot Limit -&gt;</strong>{" "}
                      {plan.whatsapp_chatbot_limit}
                    </li>
                    <li>
                      <strong>Chatbot Messages Limit -&gt;</strong>{" "}
                      {plan.whatsapp_messages_per_chatbot}
                    </li>
                    {/* <li>
                      <strong>Broadcasting -&gt;</strong>{" "}
                      {plan.has_broadcasting
                        ? `Yes (limit ${plan.broadcasting_message_limit})`
                        : "No"}
                    </li> */}
                  </ul>
                </CardContent>

                {plan.name.trim().toLowerCase() === "free" ? null : (
                  <CardFooter className="flex justify-center gap-2">
                    <Button
                      variant="default"
                      className="w-full shadow-md dark:shadow-gray-600"
                      onClick={() => handleGetNow(plan)}
                      disabled={plan.is_current_plan === true || isValidating}
                    >
                      {plan.is_current_plan === true
                        ? "Current Plan"
                        : isValidating
                          ? "Checking..."
                          : "Get Now"}
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>

          <div className="mt-4">
            <div className="text-muted-foreground mb-2 text-sm">
              Showing {pricingPlans.length} results
            </div>

            {pricingPlanData &&
              pricingPlanData.count >
                (pricingPlanData.results?.length ?? 0) && (
                <div className="flex items-center justify-center gap-4 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      pricingPlanData.previous &&
                      setCurrentPage((p) => Math.max(1, p - 1))
                    }
                    disabled={!pricingPlanData.previous || isFetching}
                    className="flex items-center gap-2"
                  >
                    Previous
                  </Button>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Page {currentPage} of{" "}
                      {pricingPlanData.count
                        ? Math.ceil(
                            pricingPlanData.count /
                              (pricingPlanData.results?.length || 1),
                          )
                        : 0}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      pricingPlanData.next && setCurrentPage((p) => p + 1)
                    }
                    disabled={!pricingPlanData.next || isFetching}
                    className="flex items-center gap-2"
                  >
                    Next
                  </Button>
                </div>
              )}
          </div>
        </>
      )}
    </>
  );
};

export default PricingPlanList;
