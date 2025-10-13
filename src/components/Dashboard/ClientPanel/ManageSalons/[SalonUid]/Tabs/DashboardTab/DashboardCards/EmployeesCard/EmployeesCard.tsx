import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User } from "lucide-react";
import React from "react";

const EmployeesCard: React.FC = () => {
  // sample data - replace with real data
  const employees = [
    {
      id: "EMP001",
      name: "John Smith",
      phone: "+1 234-567-8900",
      designation: "Senior Stylist",
    },
    {
      id: "EMP002",
      name: "Sarah Johnson",
      phone: "+1 234-567-8901",
      designation: "Nail Technician",
    },
    {
      id: "EMP003",
      name: "Michael Brown",
      phone: "+1 234-567-8902",
      designation: "Hair Stylist",
    },
    {
      id: "EMP004",
      name: "Emily Davis",
      phone: "+1 234-567-8903",
      designation: "Makeup Artist",
    },
    {
      id: "EMP005",
      name: "David Wilson",
      phone: "+1 234-567-8904",
      designation: "Barber",
    },
    {
      id: "EMP006",
      name: "Jessica Martinez",
      phone: "+1 234-567-8905",
      designation: "Receptionist",
    },
  ];

  return (
    <Card className="shadow-md dark:shadow-gray-600">
      <CardHeader className="flex items-center justify-between px-6 py-4">
        <CardTitle className="text-sm">Employees</CardTitle>
        <CardAction>
          <Button variant="outline" size="sm">
            View all
          </Button>
        </CardAction>
      </CardHeader>

      <Separator />

      <CardContent className="px-4 pb-4">
        <div className="space-y-4">
          {employees.slice(0, 4).map((employee) => (
            <div
              key={employee.id}
              className="bg-muted/10 flex items-center justify-between gap-12 rounded-xl px-4 py-3 shadow-md hover:shadow-lg dark:shadow-gray-600"
            >
              <div className="flex items-center gap-4">
                <Avatar className="bg-secondary/10 size-10">
                  <AvatarFallback>
                    <User className="text-primary size-6" />
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {employee.name}
                  </p>
                  <p className="text-muted-foreground mt-1 truncate text-xs">
                    {employee.designation}
                  </p>
                </div>
              </div>

              <div className="text-muted-foreground flex flex-col items-end gap-1">
                <p className="text-xs font-medium">ID: {employee.id}</p>
                <p className="text-xs">{employee.phone}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeesCard;
