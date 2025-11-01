import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export function formatDateTime(value?: string | null): string {
  if (value === undefined || value === null || value === "") return "Not Found";

  const date = new Date(value);
  if (isNaN(date.getTime())) return "Invalid date";

  // Use user's locale with medium date and short time style
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
      hour12: false,
    }).format(date);
  } catch {
    // Fallback if Intl options are unsupported in environment
    try {
      return date.toLocaleString(undefined, { hour12: false });
    } catch {
      return date.toLocaleString();
    }
  }
}

export const safe = (v: unknown): string => {
  if (v === undefined || v === null || v === "") return "-";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
};

export const formatChoiceFieldValue = (v: unknown): string => {
  if (typeof v !== "string") return safe(v);
  return v
    .split("_")
    .map((part) =>
      part
        .split("")
        .map((char: string, idx: number) =>
          idx === 0 ? char.toUpperCase() : char.toLowerCase(),
        )
        .join(""),
    )
    .join(" ");
};
