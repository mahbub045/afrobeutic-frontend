import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BriefcaseBusiness, Pencil } from "lucide-react";

const ProfessionalCareer: React.FC = () => {
  return (
    <Card className="border-0 shadow-md transition-shadow duration-300 hover:shadow-lg dark:shadow-gray-600">
      <CardContent className="p-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex gap-2 text-xl font-bold text-gray-900 dark:text-white">
            <BriefcaseBusiness /> Professional Career
          </h2>
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4" /> Edit
          </Button>
        </div>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300">
          Suspendisse potenti. Curabitur at lacus in dui ultricies feugiat.
          Donec nec nunc bibendum, convallis libero vitae, commodo sem. Integer
          at nunc eget arcu tempor vulputate ac non nisl.
        </p>
      </CardContent>
    </Card>
  );
};

export default ProfessionalCareer;
