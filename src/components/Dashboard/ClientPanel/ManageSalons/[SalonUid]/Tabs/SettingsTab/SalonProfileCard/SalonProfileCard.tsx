import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil } from "lucide-react";

const SalonProfileCard: React.FC = () => {
  return (
    <Card className="border-0 bg-gradient-to-br from-slate-50 to-slate-100 shadow-md transition-shadow duration-300 hover:shadow-lg dark:from-slate-950 dark:to-slate-900 dark:shadow-gray-900">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-lg dark:border-slate-800 dark:shadow-gray-800">
                      <AvatarImage src="/images/common/salon-placeholder.jpg" />
                      <AvatarFallback className="text-xl font-bold">
                        S
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      Salon 1
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Your salon profile at a glance
                    </p>
                    <Badge variant="secondary" className="mt-2">
                      Male
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
              </div>
            </CardContent>
          </Card>
  );
};

export default SalonProfileCard;