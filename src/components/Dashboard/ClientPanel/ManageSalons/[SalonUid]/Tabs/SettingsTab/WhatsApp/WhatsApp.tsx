"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { loadMetaSdk } from "@/hooks/use-meta-sdk";
import type { SalonProps } from "@/Types/ClientPanel/ManageSalonTypes/SalonListType";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import React, { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";

type WhatsAppProps = {
  singleSalonData?: SalonProps;
  isLoading?: boolean;
};

const WhatsApp: React.FC<WhatsAppProps> = ({ singleSalonData, isLoading }) => {
  const { salonuid: salonUid } = useParams() as { salonuid?: string };
  const { data: session } = useSession();

  const [isConnecting, setIsConnecting] = useState(false);

  const whatsappStatus = useMemo(() => {
    const raw = (
      singleSalonData as (SalonProps & { whatsapp_status?: string }) | undefined
    )?.whatsapp_status;
    return raw?.toUpperCase?.() ?? null;
  }, [singleSalonData]);

  const isConnected = whatsappStatus === "CONNECTED";

  const startWhatsAppSignup = useCallback(async () => {
    try {
      if (!salonUid) {
        toast.error("Missing salon id");
        return;
      }

      const metaAppId = process.env.NEXT_PUBLIC_META_APP_ID;
      const metaConfigId = process.env.NEXT_PUBLIC_META_CONFIG_ID;

      if (!metaAppId || !metaConfigId) {
        toast.error(
          "Missing Meta configuration. Set NEXT_PUBLIC_META_APP_ID and NEXT_PUBLIC_META_CONFIG_ID.",
        );
        return;
      }

      setIsConnecting(true);

      await loadMetaSdk({ appId: metaAppId });

      if (!window.FB) {
        toast.error("Meta SDK failed to initialize");
        return;
      }

      window.FB.login(
        (response) => {
          void (async () => {
            try {
              const code = response?.authResponse?.code;
              if (!code) {
                toast.error("WhatsApp connection was cancelled or failed.");
                return;
              }

              const baseUrl = process.env.NEXT_PUBLIC_APIBASE_URL;
              if (!baseUrl) {
                throw new Error(
                  "Backend URL is missing (NEXT_PUBLIC_APIBASE_URL)",
                );
              }

              const path =
                process.env.NEXT_PUBLIC_WHATSAPP_ONBOARD_PATH ??
                "/whatsapp/onboard";

              const url = new URL(path, baseUrl).toString();

              const token =
                session?.user?.accessToken ??
                (typeof window !== "undefined"
                  ? localStorage.getItem("token")
                  : null);

              const accountId =
                typeof window !== "undefined"
                  ? localStorage.getItem("activeAccountId")
                  : null;

              if (!token) {
                throw new Error("You are not logged in.");
              }

              const res = await fetch(url, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                  ...(accountId ? { "X-ACCOUNT-ID": accountId } : {}),
                },
                body: JSON.stringify({
                  code,
                  salonUid,
                  salon_uid: salonUid,
                }),
              });

              if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Failed to send signup code");
              }

              toast.success("WhatsApp onboarding started successfully.");
            } catch (e) {
              console.error(e);
              toast.error(
                e instanceof Error ? e.message : "Failed to connect WhatsApp",
              );
            } finally {
              setIsConnecting(false);
            }
          })();
        },
        {
          config_id: metaConfigId,
          response_type: "code",
          override_default_response_type: true,
          extras: {
            setup: {},
          },
        },
      );
    } catch (e) {
      console.error(e);
      toast.error(
        e instanceof Error ? e.message : "Failed to connect WhatsApp",
      );
      setIsConnecting(false);
    }
  }, [salonUid, session?.user?.accessToken]);

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
            Connect WhatsApp to enable messaging features.
          </p>
        </div>

        <Button
          onClick={startWhatsAppSignup}
          disabled={isLoading || isConnecting}
        >
          {isConnecting ? "Connecting..." : "Connect WhatsApp"}
        </Button>
      </div>
    </Card>
  );
};

export default WhatsApp;
