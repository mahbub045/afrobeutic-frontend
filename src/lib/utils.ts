import { countries } from "@/data/countries";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(value?: string | null): string {
  if (value === undefined || value === null || value === "") return "-";

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

export const getCountryName = (code?: string | null) => {
  if (!code) return null;
  const found = countries.find(
    (c) => c.code === code || c.code.toLowerCase() === code.toLowerCase(),
  );
  return found?.name ?? code;
};

export const formatPrice = (price?: string) => {
  if (!price) return "-";

  const num = Number(price);
  if (Number.isNaN(num)) return price;

  return `$${new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)}`;
};

function convertToSubCurrency(amount: number, factor = 100) {
  return Math.round(amount * factor);
}
export default convertToSubCurrency;
