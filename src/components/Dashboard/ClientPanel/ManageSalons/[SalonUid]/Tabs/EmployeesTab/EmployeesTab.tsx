"use client";
import * as React from "react";

type Employee = { id: string; name: string };

const EmployeesTab: React.FC<{ items?: Employee[] }> = ({ items = [] }) => {
  return (
    <div>
      <h2 className="text-lg font-semibold">Employees</h2>
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

export default EmployeesTab;
