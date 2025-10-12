import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Store } from "lucide-react";

// Demo data
const demoSalons = [
  {
    id: 1,
    name: "Beauty Haven",
    location: "Downtown, NY",
  },
  {
    id: 2,
    name: "Glamour Lounge",
    location: "Midtown, NY",
  },
  {
    id: 3,
    name: "Chic Cuts",
    location: "Uptown, NY",
  },
  {
    id: 4,
    name: "Urban Styles",
    location: "Brooklyn, NY",
  },
  {
    id: 5,
    name: "Elegance Salon",
    location: "Queens, NY",
  },
  {
    id: 6,
    name: "Trendy Tresses",
    location: "Harlem, NY",
  },
  {
    id: 7,
    name: "Classic Beauty",
    location: "Bronx, NY",
  },
];

const SalonsCard: React.FC = () => {
  const handleAddSalon = () => {
    // TODO: Implement add salon functionality
    console.log("Add Salon clicked");
  };

  return (
    <Card className="h-full shadow-md dark:shadow-gray-600">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold">My Salons</CardTitle>
        <Button onClick={handleAddSalon} size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </CardHeader>
      <CardContent>
        {demoSalons.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center dark:border-gray-700 dark:bg-gray-900/50">
            <div className="space-y-2">
              <Store className="text-muted-foreground/50 mx-auto h-10 w-10" />
              <p className="text-muted-foreground text-sm">No salons yet</p>
              <p className="text-muted-foreground text-xs">
                Click the Add button to create your first salon
              </p>
            </div>
          </div>
        ) : (
          <div className="max-h-[340px] space-y-3 overflow-y-auto pr-2">
            {demoSalons.map((salon) => (
              <div
                key={salon.id}
                className="bg-card hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-4 transition-colors shadow-md dark:shadow-gray-600"
              >
                <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                  <Store className="text-primary h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="text-sm leading-none font-medium">
                    {salon.name}
                  </h4>
                  <p className="text-muted-foreground text-xs">
                    {salon.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SalonsCard;
