"use client";
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
import { useGetPricingPlansQuery } from "@/Redux/Reducers/AdminPanel/PricingPlans/PricingPlansApi";
import { Edit, Plus } from "lucide-react";

const PricingPlanList: React.FC = () => {
  const { data: pricingPlanData, isLoading } =
    useGetPricingPlansQuery(undefined);

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold md:w-auto">Pricing Plans</h2>
        <Button variant="default">
          <Plus /> Add Plan
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-md dark:shadow-gray-600">
          <CardHeader>
            <CardTitle>Package Name</CardTitle>
            <CardDescription>
              Premium plan for growing salons with WhatsApp automation and
              broadcasting support.
            </CardDescription>
            <CardAction>
              <Button
                variant="ghost"
                size="sm"
                className="shadow-md dark:shadow-gray-600"
              >
                <Edit />
                Edit Plan
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p>Card Content</p>
          </CardContent>
          <CardFooter>
            <Button variant="danger" className="w-full">
              Delete Plan
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default PricingPlanList;
