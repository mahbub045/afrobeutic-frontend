"use client";
import * as React from "react";

type Chair = { id: string; name: string };

const ChairsTab: React.FC<{ items?: Chair[] }> = ({ items = [] }) => {
  return (
    <div>
      <h2 className="text-lg font-semibold">Chairs</h2>
      <ul className="mt-3 space-y-2">
        {items.map((it) => (
          <li key={it.id} className="rounded-md border px-3 py-2">
            {it.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChairsTab;
