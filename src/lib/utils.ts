import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date/time string (ISO or timestamp) into a readable localized string.
 * Returns "Not Found" when value is null/undefined or an empty string.
 * Returns "Invalid date" when the input cannot be parsed into a valid Date.
 */
export function formatDateTime(value?: string | null): string {
  if (value === undefined || value === null || value === "") return "Not Found";

  const date = new Date(value);
  if (isNaN(date.getTime())) return "Invalid date";

  // Use user's locale with medium date and short time style
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
      // Force 24-hour clock
      hour12: false,
    }).format(date);
  } catch (e) {
    // Fallback if Intl options are unsupported in environment
    try {
      return date.toLocaleString(undefined, { hour12: false });
    } catch (e) {
      return date.toLocaleString();
    }
  }
}
