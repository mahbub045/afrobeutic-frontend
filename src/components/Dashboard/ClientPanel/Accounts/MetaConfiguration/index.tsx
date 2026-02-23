"use client";
import Breadcrumbs from "@/components/Dashboard/CommonComponents/Breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useGetMetaConfigInfoQuery,
  usePassMetaConfigInfoMutation,
} from "@/Redux/Reducers/ClientPanel/Accounts/MetaConfiguration/MetaConfigurationApi";
import { Eye, EyeOff, LoaderPinwheel } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import DeleteMetaConfigurationDialog from "./Dialogs/DeleteMetaConfigurationDialog";

const MetaConfigurationContainer: React.FC = () => {
  const { data: metaConfigInfo, isLoading: isMetaConfigInfoLoading } =
    useGetMetaConfigInfoQuery(undefined);

  // sometimes the API returns an object with a `detail` key when there is
  // no configuration; treat that as an empty result and show the connect
  // button instead.
  interface DetailResponse {
    detail: string;
  }

  const isDetailResponse = (obj: unknown): obj is DetailResponse =>
    typeof obj === "object" && obj !== null && "detail" in obj;

  const hasMetaConfig =
    metaConfigInfo &&
    !(
      isDetailResponse(metaConfigInfo) &&
      metaConfigInfo.detail === "Meta configuration not available."
    );
  const [metaConfig, { isLoading: isMetaConfigLoading }] =
    usePassMetaConfigInfoMutation();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showWaba, setShowWaba] = useState(false);
  const [showSid, setShowSid] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const mask = (val?: string) => {
    if (!val) return "-";
    return "*".repeat(val.length);
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

            // Send Meta config info to backend
            if (waba_id && business_id) {
              metaConfig({
                waba_id,
              })
                .unwrap()
                .then(() => {
                  toast.success("Meta account connected successfully!");
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
                "Cannot send Meta config info - missing required data (waba_id or business_id)",
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
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard/client-panel" },
          {
            label: "Meta Configuration",
            href: "/dashboard/client-panel/accounts/meta-configuration",
          },
        ]}
      />

      <div className="mx-auto w-full">
        <Card className="transition-shadow duration-300 hover:shadow-md">
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Meta Business Account</CardTitle>
              {isMetaConfigInfoLoading ? (
                <LoaderPinwheel className="text-secondary h-4 w-4 animate-spin" />
              ) : (
                <Badge variant={hasMetaConfig ? "secondary" : "outline"}>
                  {hasMetaConfig ? "Connected" : "Not connected"}
                </Badge>
              )}
            </div>
            <CardDescription>
              Connect your Meta Business Account to enable WhatsApp Business API
              integration across all your salons. This is a one-time setup for
              your entire account.
            </CardDescription>

            <CardAction>
              {isMetaConfigInfoLoading ? (
                <LoaderPinwheel className="text-primary h-6 w-6 animate-spin" />
              ) : hasMetaConfig ? (
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <span className="flex items-center gap-1">
                      <LoaderPinwheel className="h-4 w-4 animate-spin" />
                      Removing...
                    </span>
                  ) : (
                    "Remove Configuration"
                  )}
                </Button>
              ) : (
                <Button
                  onClick={launchEmbeddedSignup}
                  disabled={isMetaConfigInfoLoading || isMetaConfigLoading}
                >
                  {isMetaConfigLoading ? (
                    <span className="flex items-center gap-1">
                      <LoaderPinwheel className="h-4 w-4 animate-spin" />
                      Connecting...
                    </span>
                  ) : (
                    "Connect with Facebook"
                  )}
                </Button>
              )}
            </CardAction>
          </CardHeader>

          <CardContent className="space-y-3">
            {isMetaConfigInfoLoading ? (
              <p className="text-muted-foreground flex items-center justify-center gap-1">
                <LoaderPinwheel className="text-primary h-6 w-6 animate-spin" />
              </p>
            ) : hasMetaConfig ? (
              <dl className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <dt className="text-muted-foreground text-xs">WABA ID</dt>
                  <dd className="flex items-center gap-1 font-mono text-xs break-all">
                    {showWaba
                      ? metaConfigInfo?.waba_id || "-"
                      : mask(metaConfigInfo?.waba_id)}
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => setShowWaba((v) => !v)}
                    >
                      {showWaba ? (
                        <EyeOff className="text-warning h-4 w-4" />
                      ) : (
                        <Eye className="text-warning h-4 w-4" />
                      )}
                    </button>
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-muted-foreground text-xs">Account SID</dt>
                  <dd className="flex items-center gap-1 font-mono text-xs break-all">
                    {showSid
                      ? metaConfigInfo?.account_sid || "-"
                      : mask(metaConfigInfo?.account_sid)}
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => setShowSid((v) => !v)}
                    >
                      {showSid ? (
                        <EyeOff className="text-warning h-4 w-4" />
                      ) : (
                        <Eye className="text-warning h-4 w-4" />
                      )}
                    </button>
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-muted-foreground text-xs">Auth Token</dt>
                  <dd className="flex items-center gap-1 font-mono text-xs break-all">
                    {showToken
                      ? metaConfigInfo?.auth_token || "-"
                      : mask(metaConfigInfo?.auth_token)}
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => setShowToken((v) => !v)}
                    >
                      {showToken ? (
                        <EyeOff className="text-warning h-4 w-4" />
                      ) : (
                        <Eye className="text-warning h-4 w-4" />
                      )}
                    </button>
                  </dd>
                </div>
              </dl>
            ) : metaConfigInfo && isDetailResponse(metaConfigInfo) ? (
              <p className="text-muted-foreground text-sm">
                {metaConfigInfo.detail}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <DeleteMetaConfigurationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDeletingChange={setIsDeleting}
      />
    </div>
  );
};

export default MetaConfigurationContainer;
