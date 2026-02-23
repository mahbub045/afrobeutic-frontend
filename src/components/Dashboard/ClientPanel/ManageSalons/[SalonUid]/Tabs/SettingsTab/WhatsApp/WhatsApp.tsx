"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetWhatsAppOnboardDataQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/WhatsApp/WhatsAppApi";
import { WhatsAppOnboardData } from "@/Types/ClientPanel/ManageSalonTypes/WhatsAppTypes/WhatsAppTypes";
import { Plus, Trash } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import ConnectWhatsAppDialog from "./Dialogs/ConnectWhatsAppDialog";
import DeleteWhatsAppDialog from "./Dialogs/DeleteWhatsAppDialog";

const WhatsApp: React.FC = () => {
  const { salonuid } = useParams();
  const [connectWhatsAppDialogOpen, setConnectWhatsAppDialogOpen] =
    useState(false);
  const [deleteWhatsAppDialogOpen, setDeleteWhatsAppDialogOpen] =
    useState(false);
  const [selectedWhatsAppData, setSelectedWhatsAppData] = useState<
    WhatsAppOnboardData | undefined
  >(undefined);

  const handleConnectWhatsApp = () => {
    setConnectWhatsAppDialogOpen(true);
  };

  const {
    data: whatsAppOnboardData,
    isLoading,
    error: whatsAppError,
  } = useGetWhatsAppOnboardDataQuery({ salonUid: salonuid });

  const whatsappStatus = whatsAppOnboardData?.status?.toUpperCase() ?? null;

  // if the server explicitly reports no sender registered we should treat
  // that the same as having no data so the "connect" button is shown rather
  // than the remove button
  const noSenderError =
    (whatsAppError as { data?: { detail?: string } })?.data?.detail ===
    "No WhatsApp sender registered for this salon";

  // treat as connected only when we actually have a sender number and
  // there isn't a 'no sender' error.  sometimes the API returns an object
  // without a number which should behave like not-connected.
  const isConnected =
    !!whatsAppOnboardData?.whatsapp_sender_number && !noSenderError;

  const getStatusBadge = () => {
    switch (whatsappStatus) {
      case "ONLINE":
        return (
          <Badge className="bg-green-600 hover:bg-green-700">Online</Badge>
        );
      case "CREATING":
        return (
          <Badge className="bg-blue-600 hover:bg-blue-700">Creating</Badge>
        );
      case "OFFLINE":
        return <Badge className="bg-gray-600 hover:bg-gray-700">Offline</Badge>;
      case "PENDING_VERIFICATION":
        return (
          <Badge className="bg-yellow-600 hover:bg-yellow-700">
            Pending Verification
          </Badge>
        );
      case "VERIFYING":
        return (
          <Badge className="bg-yellow-600 hover:bg-yellow-700">Verifying</Badge>
        );
      case "ONLINE_UPDATING":
        return (
          <Badge className="bg-blue-600 hover:bg-blue-700">Updating</Badge>
        );
      case "TWILIO_REVIEW":
        return (
          <Badge className="bg-orange-600 hover:bg-orange-700">
            Under Review
          </Badge>
        );
      case "DRAFT":
        return <Badge className="bg-gray-500 hover:bg-gray-600">Draft</Badge>;
      case "STUBBED":
        return (
          <Badge className="bg-purple-600 hover:bg-purple-700">Stubbed</Badge>
        );
      default:
        return <Badge variant="secondary">Not Connected</Badge>;
    }
  };

  const getStatusDescription = () => {
    switch (whatsappStatus) {
      case "ONLINE":
        return "WhatsApp Business is active and ready to receive messages.";
      case "CREATING":
        return "WhatsApp Business Account is being set up.";
      case "OFFLINE":
        return "WhatsApp Business is currently offline.";
      case "PENDING_VERIFICATION":
        return "Waiting for phone number verification to complete.";
      case "VERIFYING":
        return "Phone number verification in progress.";
      case "ONLINE_UPDATING":
        return "WhatsApp Business is online while updating configuration.";
      case "TWILIO_REVIEW":
        return "Account is under review by Twilio.";
      case "DRAFT":
        return "WhatsApp configuration is in draft mode.";
      case "STUBBED":
        return "WhatsApp Business Account is in stubbed state.";
      default:
        return "WhatsApp Business Account status for this salon.";
    }
  };

  return (
    <Card className="border-0 pb-3 shadow-md transition-shadow duration-300 hover:shadow-lg dark:shadow-gray-600">
      <div className="space-y-4 p-4">
        {isLoading ? (
          <>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-3 w-64" />

            <div className="space-y-3 border-t pt-4">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between space-y-1">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">WhatsApp</h3>
                  {getStatusBadge()}
                </div>
                <p className="text-muted-foreground text-xs">
                  {getStatusDescription()}
                </p>
              </div>
              <div>
                <div className="flex justify-end">
                  {isConnected ? (
                    <Button
                      disabled={isLoading}
                      variant="danger"
                      onClick={() => {
                        setSelectedWhatsAppData(whatsAppOnboardData);
                        setDeleteWhatsAppDialogOpen(true);
                      }}
                    >
                      <Trash />
                      Remove Chatbot
                    </Button>
                  ) : (
                    <Button
                      disabled={isLoading}
                      onClick={handleConnectWhatsApp}
                    >
                      <Plus />
                      Connect WhatsApp
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Chatbot Name
                </span>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {whatsAppOnboardData?.chatbot_name ?? "Not Available"}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  WhatsApp Number
                </span>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {whatsAppOnboardData?.whatsapp_sender_number ??
                    "Not Available"}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
      <ConnectWhatsAppDialog
        isOpen={connectWhatsAppDialogOpen}
        onClose={setConnectWhatsAppDialogOpen}
      />
      <DeleteWhatsAppDialog
        isOpen={deleteWhatsAppDialogOpen}
        onClose={setDeleteWhatsAppDialogOpen}
        whatsappData={selectedWhatsAppData}
      />
    </Card>
  );
};

export default WhatsApp;
