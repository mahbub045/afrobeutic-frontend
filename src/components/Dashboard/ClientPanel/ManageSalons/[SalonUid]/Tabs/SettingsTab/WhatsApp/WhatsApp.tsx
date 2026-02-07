"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { SalonProps } from "@/Types/ClientPanel/ManageSalonTypes/SalonListType";
import { useEffect, useMemo } from "react";

type WhatsAppProps = {
  singleSalonData?: SalonProps;
  isLoading?: boolean;
};

const WhatsApp = ({ singleSalonData, isLoading }: WhatsAppProps) => {
  const whatsappStatus = useMemo(() => {
    const raw = (
      singleSalonData as (SalonProps & { whatsapp_status?: string }) | undefined
    )?.whatsapp_status;
    return raw?.toUpperCase?.() ?? null;
  }, [singleSalonData]);

  const isConnected = whatsappStatus === "CONNECTED";

  // Define session handler
  useEffect(() => {
    const embeddedSignupInfoListener = (event: MessageEvent) => {
      if (!event.origin.endsWith("facebook.com")) return;
      try {
        const data = JSON.parse(event.data);
        if (data.type === "WA_EMBEDDED_SIGNUP") {
          // if user finishes the Embedded Signup flow
          if (data.event === "FINISH" || data.event === "FINISH_ONLY_WABA") {
            const { phone_number_id, waba_id } = data.data;
            console.log(
              "Phone number ID ",
              phone_number_id,
              " WhatsApp business account ID ",
              waba_id,
            );

            // if user cancels the Embedded Signup flow
          } else if (data.event === "CANCEL") {
            const { current_step } = data.data;
            console.warn("Cancel at ", current_step);

            // if user reports an error during the Embedded Signup flow
          } else if (data.event === "ERROR") {
            const { error_message } = data.data;
            console.error("error ", error_message);
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
  }, []);

  // Handle WhatsApp Embedded Signup
  const launchEmbeddedSignup = () => {
    // Launch Facebook login
    if (typeof window !== "undefined" && window.FB) {
      window.FB.login(
        (response: FBLoginResponse) => {
          // Since you are using Twilio's APIs, you do not need to do anything with the response here.
          console.log("WhatsApp signup response:", response);
        },
        {
          config_id: process.env.NEXT_PUBLIC_META_CONFIG_ID,
          auth_type: "rerequest", // Avoids 'user is already logged' in errors if users click the button again before refreshing the page
          response_type: "code",
          override_default_response_type: true,
          extras: {
            sessionInfoVersion: 3, // Required to get WABA ID
          },
        },
      );
    } else {
      console.error("Facebook SDK not loaded");
    }
  };

  return (
    <Card className="border-0 shadow-md transition-shadow duration-300 hover:shadow-lg dark:shadow-gray-600">
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">WhatsApp</h3>
            {isConnected ? (
              <Badge className="bg-green-600 hover:bg-green-700">
                Connected
              </Badge>
            ) : (
              <Badge variant="secondary">Not connected</Badge>
            )}
          </div>
          <p className="text-muted-foreground text-xs">
            WhatsApp integration is being reworked; this layout represents the
            new styling without hooking into a Meta flow.
          </p>
        </div>

        <button
          onClick={launchEmbeddedSignup}
          style={{
            backgroundColor: "#1877f2",
            border: 0,
            borderRadius: "4px",
            color: "#fff",
            cursor: "pointer",
            fontFamily: "Helvetica, Arial, sans-serif",
            fontSize: "16px",
            fontWeight: "bold",
            height: "40px",
            padding: "0 24px",
          }}
        >
          Login with Facebook
        </button>
      </div>
    </Card>
  );
};

export default WhatsApp;
