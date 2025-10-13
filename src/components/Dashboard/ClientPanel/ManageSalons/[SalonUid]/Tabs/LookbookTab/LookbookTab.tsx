"use client";
import * as React from "react";

type LookBook = { id: string; title: string };

const LookbookTab: React.FC<{ items?: LookBook[] }> = ({ items = [] }) => {
  return (
    <div>
      <h2 className="text-lg font-semibold">LookBook</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {items.map((it) => (
          <div key={it.id} className="rounded-md border p-3">
            {it.title}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LookbookTab;
