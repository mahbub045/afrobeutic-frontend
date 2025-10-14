import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, Scissors, Users } from "lucide-react";
import React from "react";

const SalonOverview: React.FC = () => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Employees Card */}
      <Card className="shadow-md dark:shadow-gray-600">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            Total Employees
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
            <Users className="text-primary h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1</div>
        </CardContent>
      </Card>

      {/* Services Card */}
      <Card className="shadow-md dark:shadow-gray-600">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            Total Services
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
            <Scissors className="text-primary h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1</div>
        </CardContent>
      </Card>

      {/* Products Card */}
      <Card className="shadow-md dark:shadow-gray-600">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            Total Products
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
            <DollarSign className="text-primary h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">8</div>
        </CardContent>
      </Card>

      {/* Chairs Card */}
      <Card className="shadow-md dark:shadow-gray-600">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            Total Chairs
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
            <Calendar className="text-primary h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">5</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalonOverview;
