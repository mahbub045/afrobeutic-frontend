import { Card } from "@/components/ui/card";
import { Package, Scissors } from "lucide-react";
import React from "react";

interface Item {
  uid: string;
  name: string;
  price: string;
}

interface Props {
  type: "services" | "products";
  items: Item[];
  count: number;
  price: number;
}

const ICON = {
  services: <Scissors className="h-4 w-4" />,
  products: <Package className="h-4 w-4" />,
};

const LABEL = {
  services: "Services",
  products: "Products",
};

const BookingItemsCard: React.FC<Props> = ({ type, items, count, price }) => {
  return (
    <Card className="space-y-4 rounded-xl border p-5 shadow-md dark:shadow-gray-600">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground flex items-center gap-2 text-sm font-semibold tracking-wider uppercase">
          {ICON[type]}
          {LABEL[type]}
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-muted-foreground text-xs">
            {count} item{count !== 1 ? "s" : ""}
          </span>
          <span className="text-foreground text-sm font-semibold">
            ${price.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Item list */}
      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li
              key={item.uid}
              className="flex items-center gap-3 rounded-lg border px-3 py-2 text-xs"
            >
              <span className="bg-muted text-foreground flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-medium">
                {idx + 1}
              </span>
              <div className="min-w-0 flex-1">
                <span className="block truncate font-medium">{item.name}</span>
              </div>
              <span className="text-muted-foreground text-xs">
                ${parseFloat(item.price).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground text-sm">
          No {LABEL[type].toLowerCase()} added.
        </p>
      )}
    </Card>
  );
};

export default BookingItemsCard;
