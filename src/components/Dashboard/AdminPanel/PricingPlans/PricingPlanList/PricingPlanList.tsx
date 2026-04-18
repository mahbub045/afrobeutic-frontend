"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { formatChoiceFieldValue, formatPrice } from "@/lib/utils";
import { useGetPricingPlansQuery } from "@/Redux/Reducers/AdminPanel/PricingPlans/PricingPlansApi";
import { PricingPlanTypes } from "@/Types/AdminPanel/PricingPlansTypes/PricingPlansTypes";
import { Check, Edit, LoaderPinwheel, Plus, Trash } from "lucide-react";
import { useState } from "react";
import AddPricingPlanDialog from "./Dialogs/AddPricingPlanDialog";
import DeletePricingPlanDialog from "./Dialogs/DeletePricingPlanDialog";
import EditPricingPlanDialog from "./Dialogs/EditPricingPlanDialog";

const PricingPlanList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [selectedPricingPlan, setSelectedPricingPlan] =
    useState<PricingPlanTypes | null>(null);

  const handleAddDialogOpen = () => setIsAddDialogOpen(true);
  const handleEditDialogOpen = (plan: PricingPlanTypes) => {
    setSelectedPricingPlan(plan);
    setIsEditDialogOpen(true);
  };
  const handleDeleteDialogOpen = (plan: PricingPlanTypes) => {
    setSelectedPricingPlan(plan);
    setIsDeleteDialogOpen(true);
  };

  const {
    data: pricingPlanData,
    isLoading,
    isFetching,
  } = useGetPricingPlansQuery({ page: currentPage });

  const pricingPlans = pricingPlanData?.results ?? [];

  const categoryOrder = ["SALON_SHOP", "INDIVIDUAL_STYLIST"];
  const pricingPlansByCategory = pricingPlans.reduce(
    (acc: Record<string, PricingPlanTypes[]>, plan: PricingPlanTypes) => {
      const category = plan.account_category ?? "OTHER";
      if (!acc[category]) acc[category] = [];
      acc[category].push(plan);
      return acc;
    },
    {} as Record<string, PricingPlanTypes[]>,
  );

  const sortedCategories = Object.keys(pricingPlansByCategory).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    if (indexA !== -1 || indexB !== -1) {
      return (
        (indexA === -1 ? Infinity : indexA) -
        (indexB === -1 ? Infinity : indexB)
      );
    }
    return a.localeCompare(b);
  });

  const getStausColorMap = (is_status: boolean) => {
    switch (is_status) {
      case true:
        return "secondary";
      case false:
        return "danger";
      default:
        return "outline";
    }
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold md:w-auto">Pricing Plans</h2>
        <Button variant="default" onClick={handleAddDialogOpen}>
          <Plus /> Add New Plan
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center">
          <LoaderPinwheel size={30} className="text-primary animate-spin" />
        </div>
      ) : !pricingPlanData || pricingPlanData.results.length === 0 ? (
        <div className="text-muted-foreground text-center">
          No pricing plans available.
        </div>
      ) : (
        <>
          <div className="space-y-10">
            {sortedCategories.map((category) => (
              <section key={category}>
                <h3 className="mb-4 text-lg font-semibold text-slate-950 dark:text-slate-50">
                  {formatChoiceFieldValue(category)}
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pricingPlansByCategory[category].map(
                    (plan: PricingPlanTypes) => (
                      <Card
                        key={plan.uid}
                        className="hover:border-primary hover:ring-primary/20 flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.25)] hover:ring-2 dark:border-slate-800 dark:bg-slate-950"
                      >
                        <div className="space-y-4 border-b border-slate-200 px-6 py-6 dark:border-slate-800">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <CardTitle className="text-2xl font-semibold text-slate-950 dark:text-slate-50">
                                {plan.name}
                              </CardTitle>
                              <CardDescription className="text-primary mt-3 text-sm">
                                {plan.description ||
                                  "A great plan for your business needs."}
                              </CardDescription>
                            </div>
                            <CardAction>
                              <Badge variant={getStausColorMap(plan.is_active)}>
                                {plan.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </CardAction>
                          </div>
                        </div>

                        <CardContent className="flex-1 px-6 py-8">
                          <div className="text-center">
                            <div className="text-5xl font-bold tracking-tight text-slate-950 dark:text-white">
                              {formatPrice(plan.price)}
                            </div>
                            <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                              / month{" "}
                              <span className="text-slate-400">+ VAT</span>
                            </div>
                          </div>

                          <div className="text-primary mt-6 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-center text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-sky-300">
                            {plan.salon_limit} Salon
                            {plan.salon_limit === 1 ? "" : "s"} •{" "}
                            {plan.whatsapp_chatbot_limit} Chatbot
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

                        <CardFooter className="mt-auto px-6 pt-2 pb-6">
                          <div className="grid w-full grid-cols-1 gap-3 lg:grid-cols-2">
                            <Button
                              variant="danger"
                              className="shadow-md dark:shadow-gray-600"
                              onClick={() => handleDeleteDialogOpen(plan)}
                            >
                              <Trash />
                              Delete Plan
                            </Button>
                            <Button
                              variant="default"
                              className="shadow-md dark:shadow-gray-600"
                              onClick={() => handleEditDialogOpen(plan)}
                            >
                              <Edit />
                              Edit Plan
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ),
                  )}
                </div>
              </section>
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
      {/* Modals */}
      <AddPricingPlanDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
      />
      {selectedPricingPlan && (
        <EditPricingPlanDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          pricingPlanData={selectedPricingPlan}
        />
      )}
      {selectedPricingPlan && (
        <DeletePricingPlanDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          pricingPlanData={selectedPricingPlan}
        />
      )}
    </>
  );
};

export default PricingPlanList;
