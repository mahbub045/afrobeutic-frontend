import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Info, Pencil } from "lucide-react";

const AboutAndProfessional: React.FC = () => {
  return (
    <Card className="border-0 shadow-md transition-shadow duration-300 hover:shadow-lg dark:shadow-gray-600">
      <CardContent className="p-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex gap-2 text-xl font-bold text-gray-900 dark:text-white">
            <Info /> About Salon
          </h2>
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4" /> Edit
          </Button>
        </div>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque sed
          magna euismod, sodales lorem at, porttitor est. Vestibulum ante ipsum
          primis in faucibus orci luctus et ultrices posuere cubilia curae;
        </p>
      </CardContent>
    </Card>
  );
};

export default AboutAndProfessional;
