export const ENQUIRY_TYPES: { value: string; label: string }[] = [
  { value: "EMERGENCY", label: "Emergency" },
  { value: "CALLBACK_REQUEST", label: "Callback Request" },
  { value: "COMPLAINT", label: "Complaint" },
  { value: "GENERAL_INQUIRY", label: "General Inquiry" },
  { value: "SPECIAL_REQUEST", label: "Special Request" },
];

export const getEnquiryLabel = (value?: string | null) => {
  if (!value) return "";
  const found = ENQUIRY_TYPES.find((t) => t.value === value);
  return found ? found.label : value;
};
