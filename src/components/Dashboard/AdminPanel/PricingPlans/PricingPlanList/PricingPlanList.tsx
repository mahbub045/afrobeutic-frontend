"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatChoiceFieldValue, formatPrice } from "@/lib/utils";
import { useGetPricingPlansQuery } from "@/Redux/Reducers/AdminPanel/PricingPlans/PricingPlansApi";
import { PricingPlanTypes } from "@/Types/AdminPanel/PricingPlansTypes/PricingPlansTypes";
import { Edit, LoaderPinwheel, Plus, Trash } from "lucide-react";
import { useState } from "react";
import AddPricingPlanDialog from "./Dialogs/AddPricingPlanDialog";

const PricingPlanList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);

  const handleAddDialogOpen = () => setIsAddDialogOpen(true);

  const {
    data: pricingPlanData,
    isLoading,
    isFetching,
  } = useGetPricingPlansQuery({ page: currentPage });

  const pricingPlans = pricingPlanData?.results ?? [];

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
          <LoaderPinwheel size={30} className="animate-spin" />
        </div>
      ) : !pricingPlanData || pricingPlanData.results.length === 0 ? (
        <div>No pricing plans available.</div>
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
                  <CardDescription>{plan.description}</CardDescription>
                  <CardAction>
                    <Badge variant={getStausColorMap(plan.is_active)}>
                      {plan.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </CardAction>
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
                      <strong>Category -&gt; </strong>{" "}
                      {formatChoiceFieldValue(plan.account_category)}
                    </li>
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
                    <li>
                      <strong>Broadcasting -&gt;</strong>{" "}
                      {plan.has_broadcasting
                        ? `Yes (limit ${plan.broadcasting_message_limit})`
                        : "No"}
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="flex justify-center gap-2">
                  <Button
                    variant="danger"
                    className="w-1/2 shadow-md dark:shadow-gray-600"
                  >
                    <Trash />
                    Delete Plan
                  </Button>
                  <Button
                    variant="default"
                    className="w-1/2 shadow-md dark:shadow-gray-600"
                  >
                    <Edit />
                    Edit Plan
                  </Button>
                </CardFooter>
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
      {/* Modals */}
      <AddPricingPlanDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
      />
    </>
  );
};

export default PricingPlanList;
