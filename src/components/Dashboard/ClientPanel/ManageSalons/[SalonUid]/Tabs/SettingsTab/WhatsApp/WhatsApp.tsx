"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { SalonProps } from "@/Types/ClientPanel/ManageSalonTypes/SalonListType";
import { useMemo } from "react";

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
            WhatsApp integration is being reworked; this layout represents the new
            styling without hooking into a Meta flow.
          </p>
        </div>

        <Button disabled className="cursor-not-allowed">
          {isLoading ? "Loading…" : isConnected ? "Connected" : "Connect WhatsApp"}
        </Button>
      </div>
    </Card>
  );
};

export default WhatsApp;
