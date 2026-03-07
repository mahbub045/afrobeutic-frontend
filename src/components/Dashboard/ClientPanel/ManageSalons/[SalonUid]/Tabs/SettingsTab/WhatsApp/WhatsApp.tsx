"use client";
import { getWhatsAppStatusBadge } from "@/components/Dashboard/ClientPanel/CommonComponents/whatsapp-status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetWhatsAppOnboardDataQuery,
  useWhatsAppOnboardMutation,
} from "@/Redux/Reducers/ClientPanel/ManageSalons/WhatsApp/WhatsAppApi";
import { WhatsAppOnboardData } from "@/Types/ClientPanel/ManageSalonTypes/WhatsAppTypes/WhatsAppTypes";
import { Plus, Trash } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import DeleteWhatsAppDialog from "./Dialogs/DeleteWhatsAppDialog";

const WhatsApp: React.FC = () => {
  const { salonuid } = useParams();
  const [deleteWhatsAppDialogOpen, setDeleteWhatsAppDialogOpen] =
    useState(false);
  const [selectedWhatsAppData, setSelectedWhatsAppData] = useState<
    WhatsAppOnboardData | undefined
  >(undefined);
  const metaAuthCodeRef = useRef<string | null>(null);

  const {
    data: whatsAppOnboardData,
    isLoading,
    error: whatsAppError,
  } = useGetWhatsAppOnboardDataQuery({ salonUid: salonuid });
  const [metaConfig, { isLoading: isMetaConfigLoading }] =
    useWhatsAppOnboardMutation();

  const whatsappStatus = whatsAppOnboardData?.status?.toUpperCase() ?? null;

  // if the server returns 404, treat it as no sender registered so the
  // "connect" button is shown rather than the remove button
  const noSenderError = (whatsAppError as { status?: number })?.status === 404;

  // treat as connected only when we actually have a sender number and
  // there isn't a 'no sender' error.  sometimes the API returns an object
  // without a number which should behave like not-connected.
  const isConnected =
    !!whatsAppOnboardData?.whatsapp_sender_number && !noSenderError;

  const getStatusBadge = () => getWhatsAppStatusBadge(whatsappStatus);

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
  // Define session handler for Meta embedded signup
  useEffect(() => {
    const embeddedSignupInfoListener = (event: MessageEvent) => {
      if (!event.origin.endsWith("facebook.com")) return;
      try {
        const data = JSON.parse(event.data);
        console.log("Received data from Facebook:", data);

        if (data.type === "WA_EMBEDDED_SIGNUP") {
          console.log("Meta Embedded Signup Event:", data.event);
          console.log("Full data object:", JSON.stringify(data, null, 2));

          // if user finishes the Embedded Signup flow
          if (data.event === "FINISH" || data.event === "FINISH_ONLY_WABA") {
            const {
              phone_number_id,
              waba_id,
              business_id,
              page_ids,
              catalog_ids,
              dataset_ids,
              instagram_account_ids,
            } = data.data || {};

            console.log("=== Meta Business Account Setup Complete ===");
            console.log("WABA ID:", waba_id);
            console.log("Business ID:", business_id);
            console.log("Phone Number ID:", phone_number_id || "Not provided");
            console.log("Page IDs:", page_ids);
            console.log("Catalog IDs:", catalog_ids);
            console.log("Dataset IDs:", dataset_ids);
            console.log("Instagram Account IDs:", instagram_account_ids);

            const authCode = metaAuthCodeRef.current;

            // Send Meta config info to backend
            if (waba_id && business_id && phone_number_id && authCode) {
              metaConfig({
                waba_id,
                phone_number_id,
                code: authCode,
              })
                .unwrap()
                .then(() => {
                  toast.success("Meta account connected successfully!");
                  metaAuthCodeRef.current = null;
                })
                .catch((err: unknown) => {
                  console.error("Error sending Meta config info:", err);

                  // Normalize error structure similar to other dialogs
                  interface ApiErrorResponse {
                    data?: unknown;
                    message?: string;
                    status?: number;
                  }

                  const isApiError = (obj: unknown): obj is ApiErrorResponse =>
                    typeof obj === "object" &&
                    obj !== null &&
                    ("data" in (obj as object) || "message" in (obj as object));

                  const apiError: ApiErrorResponse = isApiError(err)
                    ? (err as ApiErrorResponse)
                    : { message: String(err) };

                  let message = "Failed to save Meta account information";

                  if (apiError.data) {
                    if (typeof apiError.data === "string") {
                      message = apiError.data;
                    } else if (Array.isArray(apiError.data)) {
                      message = apiError.data.map(String).join(" ");
                    } else if (
                      typeof apiError.data === "object" &&
                      apiError.data !== null
                    ) {
                      // If the object is simple with a single key, prefer its value.
                      const keys = Object.keys(apiError.data as object);
                      if (keys.length === 1) {
                        const dataObj = apiError.data as Record<
                          string,
                          unknown
                        >;
                        const maybeValue = dataObj[keys[0]];
                        if (typeof maybeValue === "string") {
                          message = maybeValue;
                        } else {
                          // try to dig for message property inside
                          let maybeMsg: unknown;
                          if ("message" in dataObj) {
                            // safe access when key exists
                            maybeMsg = (dataObj as { message?: unknown })
                              .message;
                          }
                          if (typeof maybeMsg === "string") {
                            message = maybeMsg;
                          } else {
                            // fallback to JSON
                            message = JSON.stringify(dataObj);
                          }
                        }
                      } else {
                        // try to dig for message property inside
                        let maybeMsg: unknown;
                        if ("message" in apiError.data) {
                          // safe access when key exists
                          maybeMsg = (apiError.data as { message?: unknown })
                            .message;
                        }
                        if (typeof maybeMsg === "string") {
                          message = maybeMsg;
                        } else {
                          // fallback to JSON
                          message = JSON.stringify(apiError.data);
                        }
                      }
                    }
                  } else if (apiError.message) {
                    message = apiError.message;
                  }

                  // remove any leading key labels like "error: " to keep messages clean
                  message = message.replace(/^\s*\w+:\s*/, "");

                  toast.error(`Failed: ${message}`);
                });
            } else {
              console.warn(
                "Cannot send Meta config info - missing required data (waba_id, business_id, phone_number_id, or code)",
              );
              toast.error(
                "Could not complete Meta connection. Missing phone number ID or auth code.",
              );
            }

            // if user cancels the Embedded Signup flow
          } else if (data.event === "CANCEL") {
            const { current_step } = data.data || {};
            console.warn("Cancel at ", current_step);

            // if user reports an error during the Embedded Signup flow
          } else if (data.event === "ERROR") {
            const { error_message } = data.data || {};
            console.error("error ", error_message);
            toast.error(`Meta connection error: ${error_message}`);
          }
        }
      } catch {
        console.log("Non JSON Responses", event.data);
      }
    };

    // Listen for Embedded Signup events
    window.addEventListener("message", embeddedSignupInfoListener);

    // When the component unmounts, remove the event listener
    return () => {
      window.removeEventListener("message", embeddedSignupInfoListener);
    };
  }, [metaConfig]);

  // Handle Meta Embedded Signup
  const launchEmbeddedSignup = () => {
    // Launch Facebook login
    if (typeof window !== "undefined" && window.FB) {
      window.FB.login(
        (response: FBLoginResponse) => {
          console.log("Meta signup response:", response);
          const authCode = response.authResponse?.code;

          if (authCode) {
            metaAuthCodeRef.current = authCode;
          }
        },
        {
          config_id: process.env.NEXT_PUBLIC_META_CONFIG_ID,
          auth_type: "rerequest", // Avoids 'user is already logged' in errors if users click the button again before refreshing the page
          response_type: "code",
          override_default_response_type: true,
          extras: {
            sessionInfoVersion: 3, // Required to get WABA ID
            setup: {
              solutionID: process.env.NEXT_PUBLIC_META_SOLUTION_ID, // This is the Partner Solution ID
            },
          },
        },
      );
    } else {
      console.error("Facebook SDK not loaded");
      toast.error("Facebook SDK not loaded. Please refresh the page.");
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
                      disabled={isLoading || isMetaConfigLoading}
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
                      disabled={isLoading || isMetaConfigLoading}
                      onClick={launchEmbeddedSignup}
                    >
                      <Plus />
                      Connect With Facebook
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
      <DeleteWhatsAppDialog
        isOpen={deleteWhatsAppDialogOpen}
        onClose={setDeleteWhatsAppDialogOpen}
        whatsappData={selectedWhatsAppData}
      />
    </Card>
  );
};

export default WhatsApp;
