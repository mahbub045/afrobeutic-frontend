"use client";
import * as React from "react";

type Service = { id: string; name: string; price: string };

const ServicesTab: React.FC<{ items?: Service[] }> = ({ items = [] }) => {
  return (
    <div>
      <h2 className="text-lg font-semibold">Services</h2>
      <ul className="mt-3 space-y-2">
        {items.map((it) => (
          <li
            key={it.id}
            className="flex items-center justify-between rounded-md border px-3 py-2"
          >
            <span>{it.name}</span>
            <span className="text-muted-foreground">{it.price}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ServicesTab;
