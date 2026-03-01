import { Badge } from "@/components/ui/badge";

export const getWhatsAppStatusBadge = (status?: string | null) => {
  const normalized = status?.toUpperCase() ?? null;

  switch (normalized) {
    case "ONLINE":
      return (
        <Badge className="bg-green-600 text-white hover:bg-green-700">
          Online
        </Badge>
      );
    case "CREATING":
      return (
        <Badge className="bg-blue-600 text-white hover:bg-blue-700">
          Creating
        </Badge>
      );
    case "OFFLINE":
      return (
        <Badge className="bg-gray-600 text-white hover:bg-gray-700">
          Offline
        </Badge>
      );
    case "PENDING_VERIFICATION":
      return (
        <Badge className="bg-yellow-600 text-white hover:bg-yellow-700">
          Pending Verification
        </Badge>
      );
    case "VERIFYING":
      return (
        <Badge className="bg-yellow-600 text-white hover:bg-yellow-700">
          Verifying
        </Badge>
      );
    case "ONLINE_UPDATING":
      return (
        <Badge className="bg-blue-600 text-white hover:bg-blue-700">
          Updating
        </Badge>
      );
    case "TWILIO_REVIEW":
      return (
        <Badge className="bg-orange-600 text-white hover:bg-orange-700">
          Under Review
        </Badge>
      );
    case "DRAFT":
      return (
        <Badge className="bg-gray-500 text-white hover:bg-gray-600">
          Draft
        </Badge>
      );
    case "STUBBED":
      return (
        <Badge className="bg-purple-600 text-white hover:bg-purple-700">
          Stubbed
        </Badge>
      );
    default:
      return <Badge variant="secondary">Not Connected</Badge>;
  }
};
