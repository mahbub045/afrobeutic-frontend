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

      const postCodeToBackend = async (code: string) => {
        const baseUrl = process.env.NEXT_PUBLIC_APIBASE_URL;
        if (!baseUrl) {
          throw new Error("Backend URL is missing (NEXT_PUBLIC_APIBASE_URL)");
        }

        const path =
          process.env.NEXT_PUBLIC_WHATSAPP_ONBOARD_PATH ?? "/whatsapp/onboard";

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
      };

      const metaLoginMode = (
        process.env.NEXT_PUBLIC_META_LOGIN_MODE ?? "redirect"
      ).toLowerCase();

      setIsConnecting(true);

      if (metaLoginMode === "jssdk") {
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
                  toast.error(
                    "WhatsApp connection was cancelled or failed. If you see a 'JSSDK option is not toggled' message, enable 'Log in with JavaScript SDK' in your Meta app settings.",
                  );
                  return;
                }

                await postCodeToBackend(code);
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
        return;
      }

      // Redirect-based OAuth flow (avoids needing the Facebook JS SDK login toggle)
      const state =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}_${Math.random().toString(16).slice(2)}`;

      // IMPORTANT: This redirect URI must be allowed in Meta:
      // - App Domains (Settings -> Basic)
      // - Valid OAuth Redirect URIs (Facebook Login -> Settings)
      const redirectUriEnv = process.env.NEXT_PUBLIC_META_REDIRECT_URI?.trim();
      let redirectUri: string;
      try {
        if (redirectUriEnv) {
          const url = new URL(redirectUriEnv);
          if (url.pathname === "/" || url.pathname === "") {
            url.pathname = "/meta/oauth/callback";
          }
          redirectUri = url.toString();
        } else {
          redirectUri = new URL(
            "/meta/oauth/callback",
            window.location.origin,
          ).toString();
        }
      } catch {
        toast.error(
          "Invalid NEXT_PUBLIC_META_REDIRECT_URI. Use a full URL like https://yourdomain.com/meta/oauth/callback",
        );
        setIsConnecting(false);
        return;
      }

      // This flow relies on same-origin postMessage back to the opener.
      // If you set NEXT_PUBLIC_META_REDIRECT_URI to a different origin, the popup can't safely message this page.
      if (new URL(redirectUri).origin !== window.location.origin) {
        toast.error(
          `Meta redirect URI must use this site's origin (${window.location.origin}). Current: ${redirectUri}`,
        );
        setIsConnecting(false);
        return;
      }

      if (process.env.NODE_ENV === "development") {
        toast.info(`Meta redirect_uri: ${redirectUri}`, {
          autoClose: 6000,
        });
      }

      const oauthUrl = new URL("https://www.facebook.com/v18.0/dialog/oauth");
      oauthUrl.searchParams.set("client_id", metaAppId);
      oauthUrl.searchParams.set("redirect_uri", redirectUri);
      oauthUrl.searchParams.set("state", state);
      oauthUrl.searchParams.set("response_type", "code");
      oauthUrl.searchParams.set("config_id", metaConfigId);

      if (process.env.NODE_ENV === "development") {
        console.info("[Meta OAuth] redirect_uri:", redirectUri);
        console.info("[Meta OAuth] oauth_url:", oauthUrl.toString());
      }

      const width = 600;
      const height = 800;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(
        oauthUrl.toString(),
        "meta_oauth",
        `popup=yes,width=${width},height=${height},left=${left},top=${top}`,
      );

      if (!popup) {
        toast.error("Popup was blocked. Please allow popups and try again.");
        setIsConnecting(false);
        return;
      }

      let cleanedUp = false;
      let pollTimer: number | null = null;
      let hardTimeout: number | null = null;

      const cleanup = () => {
        if (cleanedUp) return;
        cleanedUp = true;
        window.removeEventListener("message", onMessage);
        if (pollTimer !== null) window.clearInterval(pollTimer);
        if (hardTimeout !== null) window.clearTimeout(hardTimeout);
      };

      const onMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        const data = event.data as
          | {
              type?: string;
              code?: string | null;
              state?: string | null;
              error?: string | null;
              errorDescription?: string | null;
            }
          | undefined;

        if (!data || data.type !== "META_OAUTH_CODE") return;
        if (!data.state || data.state !== state) return;

        void (async () => {
          try {
            if (data.error) {
              throw new Error(
                data.errorDescription || data.error || "Meta login failed",
              );
            }

            if (!data.code) {
              throw new Error("No code returned from Meta login");
            }

            await postCodeToBackend(data.code);
            toast.success("WhatsApp onboarding started successfully.");
          } catch (e) {
            console.error(e);
            toast.error(
              e instanceof Error ? e.message : "Failed to connect WhatsApp",
            );
          } finally {
            cleanup();
            try {
              popup.close();
            } catch {
              // ignore
            }
            setIsConnecting(false);
          }
        })();
      };

      window.addEventListener("message", onMessage);

      pollTimer = window.setInterval(() => {
        if (popup.closed) {
          cleanup();
          toast.error("Login window was closed before completing.");
          setIsConnecting(false);
        }
      }, 400);

      hardTimeout = window.setTimeout(
        () => {
          cleanup();
          toast.error("Login timed out. Please try again.");
          try {
            popup.close();
          } catch {
            // ignore
          }
          setIsConnecting(false);
        },
        2 * 60 * 1000,
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
            <h3 className="text-sm font-semibold">WhatsApp 2</h3>
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
