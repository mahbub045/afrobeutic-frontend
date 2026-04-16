"use client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import {
  useGetPricingPlansQuery,
  useValidateSubscriptionMutation,
} from "@/Redux/Reducers/ClientPanel/Accounts/PricingPlans/PricingPlansApi";
import { PricingPlanTypes } from "@/Types/AdminPanel/PricingPlansTypes/PricingPlansTypes";
import { Check, CircleAlert, LoaderPinwheel } from "lucide-react";
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
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="space-y-4 border-b border-slate-200 px-6 py-6 dark:border-slate-800">
                  <div>
                    <CardTitle className="text-2xl font-semibold text-slate-950 dark:text-slate-50">
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="text-primary mt-3 text-sm">
                      {plan.description ||
                        "A great plan for your business needs."}
                    </CardDescription>
                  </div>
                </div>

                <CardContent className="px-6 py-8">
                  <div className="text-center">
                    <div className="text-5xl font-bold tracking-tight text-slate-950 dark:text-white">
                      {formatPrice(plan.price)}
                    </div>
                    <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      / month <span className="text-slate-400">+ VAT</span>
                    </div>
                  </div>

                  <div className="text-primary mt-6 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-center text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-sky-300">
                    {plan.salon_limit} Salon{plan.salon_limit === 1 ? "" : "s"}{" "}
                    • {plan.whatsapp_chatbot_limit} Chatbot
                    {plan.whatsapp_chatbot_limit === 1 ? "" : "s"}
                  </div>

                  <div className="mt-8 space-y-4 text-sm text-slate-700 dark:text-slate-300">
                    {(plan.features && plan.features.length > 0
                      ? plan.features
                      : ["No additional features listed for this plan."]
                    )?.map((feature, index) => (
                      <div
                        key={`${plan.uid}-feature-${index}`}
                        className="flex items-start gap-3"
                      >
                        <Check className="text-primary mt-1 h-4 w-4 shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                {plan.name.trim().toLowerCase() === "free" ? null : (
                  <CardFooter className="px-6 pt-2 pb-6">
                    <Button
                      variant="default"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-950 py-3 text-base font-semibold text-white shadow-sm hover:bg-slate-800 dark:border-slate-800 dark:bg-slate-50 dark:text-slate-950 dark:hover:bg-slate-100"
                      onClick={() => handleGetNow(plan)}
                      disabled={plan.is_current_plan === true || isValidating}
                    >
                      {plan.is_current_plan === true
                        ? "Current plan"
                        : isValidating
                          ? "Checking..."
                          : "Get Started"}
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
