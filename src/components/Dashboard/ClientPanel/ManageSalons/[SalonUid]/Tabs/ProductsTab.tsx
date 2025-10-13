"use client";
import * as React from "react";

type Product = { id: string; name: string; stock: number };

const ProductsTab: React.FC<{ items?: Product[] }> = ({ items = [] }) => {
  return (
    <div>
      <h2 className="text-lg font-semibold">Products</h2>
      <ul className="mt-3 space-y-2">
        {items.map((it) => (
          <li
            key={it.id}
            className="flex items-center justify-between rounded-md border px-3 py-2"
          >
            <span>{it.name}</span>
            <span className="text-muted-foreground">{it.stock} in stock</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductsTab;
