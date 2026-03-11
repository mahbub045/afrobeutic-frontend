export const ENQUIRY_STATUSES: { value: string; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "RESOLVED", label: "Resolved" },
];

export const getEnquiryStatusLabel = (value?: string | null) => {
  if (!value) return "";
  const found = ENQUIRY_STATUSES.find((s) => s.value === value);
  return found ? found.label : value;
};
