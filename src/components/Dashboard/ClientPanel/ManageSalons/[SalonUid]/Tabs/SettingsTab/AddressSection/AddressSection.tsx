import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Pencil } from "lucide-react";

const AddressSection: React.FC = () => {
  return (
    <div>
      <Card className="border-0 shadow-md transition-shadow duration-300 hover:shadow-lg dark:shadow-gray-600">
        <CardContent className="p-4">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex gap-2 text-xl font-bold text-gray-900 dark:text-white">
              <MapPin /> Address
            </h2>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          </div>
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                Street
              </p>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                mjj, nknn
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                  City
                </p>
                <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                  hjh
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                  Postal Code
                </p>
                <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                  1204
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                Country
              </p>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                Bangladesh
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddressSection;
