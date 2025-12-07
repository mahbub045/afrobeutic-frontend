"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAccountSwitch } from "@/hooks/use-account-switch";
import { useGetAccountAccesserQuery } from "@/Redux/Reducers/ClientPanel/SwitchAccount/SwitchAccountApi";
import { LoaderPinwheel } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useMemo } from "react";

const WelcomeMessage: React.FC = () => {
  const { data: session, status } = useSession();
  const { activeAccountId } = useAccountSwitch();
  const { data: accountsData } = useGetAccountAccesserQuery();

  const isViewingDifferentAccount =
    activeAccountId && activeAccountId !== session?.user?.account_id;

  const userName = session?.user?.first_name
    ? `${session.user.first_name} ${session.user.last_name || ""}`
    : session?.user?.email?.split("@")[0] || "User";

  // Find the active account details
  const activeAccount = useMemo(() => {
    if (!isViewingDifferentAccount || !accountsData?.results) return null;
    return accountsData.results.find((acc) => acc.uid === activeAccountId);
  }, [isViewingDifferentAccount, activeAccountId, accountsData]);

  const accountDisplayName =
    isViewingDifferentAccount && activeAccount
      ? `${activeAccount.owner_name}'s account`
      : `${userName}'s account`;

  return (
    <Card className="relative min-h-[200px] overflow-hidden border shadow-md sm:min-h-[250px] dark:shadow-gray-600">
      {/* Background Overlay */}
      <div className="pointer-events-none absolute inset-0">
        {/* World Map Background from SVG file */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[1] dark:opacity-5">
          <Image
            src="/images/common/world.svg"
            alt=""
            fill
            className="object-cover opacity-60"
            priority={false}
          />
        </div>

        {/* Top left solid circle */}
        {/* <div className="absolute top-8 left-8 hidden h-8 w-8 rounded-full bg-cyan-400/60 blur-sm sm:flex sm:h-12 sm:w-12" /> */}

        {/* Bottom right large circle with blur */}
        {/* <div className="absolute -right-24 -bottom-24 h-32 w-32 rounded-full bg-cyan-300/50 blur-3xl sm:h-40 sm:w-40" /> */}

        {/* Middle right solid circle */}
        {/* <div className="absolute right-12 bottom-24 hidden h-20 w-20 rounded-full bg-cyan-400/50 blur-md sm:right-16 sm:bottom-32 sm:flex sm:h-24 sm:w-24" /> */}

        {/* Dynamic flowing curves that intersect and cross like the reference */}
        <svg
          className="absolute top-0 left-0 h-full w-full"
          viewBox="0 0 1400 600"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Gradients for transparent flowing ribbons - light mode */}
            <linearGradient id="flow-grad-1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop
                offset="0%"
                stopColor="rgb(186, 230, 253)"
                stopOpacity="0"
                className="dark:[stop-color:rgb(8,51,68)]"
              />
              <stop
                offset="20%"
                stopColor="rgb(125, 211, 252)"
                // stopOpacity="0.4"   
                stopOpacity="0.3" 
                className="dark:[stop-color:rgb(14,116,144)]"
              />
              <stop
                offset="50%"
                stopColor="rgb(56, 189, 248)"
                // stopOpacity="0.6"
                stopOpacity="0.5"
                className="dark:[stop-color:rgb(21,94,117)]"
              />
              <stop
                offset="80%"
                stopColor="rgb(125, 211, 252)"
                // stopOpacity="0.4"
                stopOpacity="0.3"
                className="dark:[stop-color:rgb(14,116,144)]"
              />
              <stop
                offset="100%"
                stopColor="rgb(186, 230, 253)"
                stopOpacity="0"
                className="dark:[stop-color:rgb(8,51,68)]"
              />
            </linearGradient>

            <linearGradient id="flow-grad-2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop
                offset="0%"
                stopColor="rgb(224, 242, 254)"
                stopOpacity="0"
                className="dark:[stop-color:rgb(12,74,110)]"
              />
              <stop
                offset="25%"
                stopColor="rgb(186, 230, 253)"
                // stopOpacity="0.35"
                stopOpacity="0.3"
                className="dark:[stop-color:rgb(15,98,131)]"
              />
              <stop
                offset="50%"
                stopColor="rgb(125, 211, 252)"
                // stopOpacity="0.5"
                stopOpacity="0.4"
                className="dark:[stop-color:rgb(14,116,144)]"
              />
              <stop
                offset="75%"
                stopColor="rgb(186, 230, 253)"
                // stopOpacity="0.35"
                stopOpacity="0.3"
                className="dark:[stop-color:rgb(15,98,131)]"
              />
              <stop
                offset="100%"
                stopColor="rgb(224, 242, 254)"
                stopOpacity="0"
                className="dark:[stop-color:rgb(12,74,110)]"
              />
            </linearGradient>

            <linearGradient id="flow-grad-3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop
                offset="0%"
                stopColor="rgb(240, 249, 255)"
                stopOpacity="0"
                className="dark:[stop-color:rgb(8,47,73)]"
              />
              <stop
                offset="30%"
                stopColor="rgb(224, 242, 254)"
                // stopOpacity="0.3"
                stopOpacity="0.2"
                className="dark:[stop-color:rgb(12,74,110)]"
              />
              <stop
                offset="50%"
                stopColor="rgb(186, 230, 253)"
                // stopOpacity="0.45"
                stopOpacity="0.35"
                className="dark:[stop-color:rgb(15,98,131)]"
              />
              <stop
                offset="70%"
                stopColor="rgb(224, 242, 254)"
                // stopOpacity="0.3"
                stopOpacity="0.2"
                className="dark:[stop-color:rgb(12,74,110)]"
              />
              <stop
                offset="100%"
                stopColor="rgb(240, 249, 255)"
                stopOpacity="0"
                className="dark:[stop-color:rgb(8,47,73)]"
              />
            </linearGradient>
          </defs>

          {/* Bottom flowing curve - much bigger amplitude */}
          <path
            d="M-200,420 Q0,320 200,380 Q400,440 600,340 Q800,240 1000,320 Q1200,400 1400,300 L1600,280 L1600,500 Q1400,480 1200,490 Q1000,500 800,460 Q600,420 400,480 Q200,540 0,500 L-200,530 Z"
            fill="url(#flow-grad-3)"
            // opacity="0.6"
            opacity="0.4"
          />

          {/* Middle-lower curve - dramatic sweeps */}
          <path
            d="M-200,380 Q100,240 300,320 Q500,400 700,260 Q900,120 1100,240 Q1300,360 1500,220 L1600,200 L1600,460 Q1500,420 1300,440 Q1100,460 900,400 Q700,340 500,420 Q300,500 100,460 L-200,490 Z"
            fill="url(#flow-grad-2)"
            // opacity="0.55"
            opacity="0.35"
          />

          {/* Central dramatic curve - extreme dips and rises */}
          <path
            d="M-200,340 Q50,160 250,260 Q450,360 650,180 Q850,0 1050,160 Q1250,320 1450,140 L1600,110 L1600,400 Q1450,360 1250,390 Q1050,420 850,340 Q650,260 450,360 Q250,460 50,400 L-200,440 Z"
            fill="url(#flow-grad-1)"
            // opacity="0.65"
            opacity="0.45"
          />

          {/* Upper-middle curve - big flowing movements */}
          <path
            d="M-200,300 Q150,140 350,240 Q550,340 750,180 Q950,20 1150,160 Q1350,300 1550,140 L1600,120 L1600,360 Q1550,320 1350,350 Q1150,380 950,310 Q750,240 550,330 Q350,420 150,360 L-200,400 Z"
            fill="url(#flow-grad-2)"
            // opacity="0.5"
            opacity="0.3"
          />

          {/* Upper curve - crossing with large amplitude */}
          <path
            d="M-200,260 Q200,120 400,220 Q600,320 800,160 Q1000,0 1200,140 Q1400,280 1600,120 L1600,320 Q1600,300 1400,320 Q1200,340 1000,270 Q800,200 600,290 Q400,380 200,320 L-200,360 Z"
            fill="url(#flow-grad-3)"
            // opacity="0.6"
            opacity="0.4"
          />

          {/* Top flowing curve - big dramatic sweeps */}
          <path
            d="M-200,220 Q100,80 300,180 Q500,280 700,120 Q900,-40 1100,100 Q1300,240 1500,80 L1600,60 L1600,280 Q1500,250 1300,270 Q1100,290 900,230 Q700,170 500,260 Q300,350 100,290 L-200,330 Z"
            fill="url(#flow-grad-1)"
            // opacity="0.5"
            opacity="0.3"
          />

          {/* Thin accent lines - bigger curves */}
          <path
            d="M-200,225 Q100,85 300,185 Q500,285 700,125 Q900,-35 1100,105 Q1300,245 1500,85 L1600,65"
            fill="none"
            stroke="rgb(125, 211, 252)"
            strokeWidth="2.5"
            // opacity="0.4"
            opacity="0.2"
            strokeLinecap="round"
            className="dark:stroke-cyan-600"
          />

          <path
            d="M-200,305 Q150,145 350,245 Q550,345 750,185 Q950,25 1150,165 Q1350,305 1550,145"
            fill="none"
            stroke="rgb(56, 189, 248)"
            strokeWidth="3"
            // opacity="0.5"
            opacity="0.3"
            strokeLinecap="round"
            className="dark:stroke-cyan-700"
          />

          <path
            d="M-200,345 Q50,165 250,265 Q450,365 650,185 Q850,5 1050,165 Q1250,325 1450,145"
            fill="none"
            stroke="rgb(14, 165, 233)"
            strokeWidth="2.5"
            // opacity="0.55"
            opacity="0.35"
            strokeLinecap="round"
            className="dark:stroke-cyan-800"
          />

          <path
            d="M-200,385 Q100,245 300,325 Q500,405 700,265 Q900,125 1100,245 Q1300,365 1500,225"
            fill="none"
            stroke="rgb(125, 211, 252)"
            strokeWidth="2"
            // opacity="0.45"
            opacity="0.25"
            strokeLinecap="round"
            className="dark:stroke-cyan-600"
          />

          <path
            d="M-200,425 Q0,325 200,385 Q400,445 600,345 Q800,245 1000,325 Q1200,405 1400,305"
            fill="none"
            stroke="rgb(186, 230, 253)"
            strokeWidth="2"
            // opacity="0.4"
            opacity="0.2"
            strokeLinecap="round"
            className="dark:stroke-cyan-700"
          />
        </svg>

        {/* Additional small circles */}
        {/* <div className="absolute top-14 right-1/4 h-10 w-10 rounded-full bg-cyan-200/40 blur-lg" />
        <div className="absolute top-1/4 left-1/3 h-8 w-8 rounded-full bg-cyan-300/35 blur-md" /> */}
      </div>

      <div className="relative flex flex-col gap-6 p-4 sm:p-6 md:p-8 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Welcome Text Section */}
        <div className="flex-1 space-y-3 sm:space-y-4">
          <h1 className="text-foreground text-2xl font-semibold sm:text-3xl md:text-xl">
            Welcome to Afrobeutic!
          </h1>
          <Badge
            variant="secondary"
            className="bg-secondary hover:bg-secondary/90 inline-flex rounded-md px-4 py-1 text-sm font-semibold text-white sm:px-3 sm:py-1 sm:text-base"
          >
            {status === "loading" ? (
              <div className="flex items-center gap-2">
                <LoaderPinwheel className="h-4 w-4 animate-spin sm:h-6 sm:w-10" />
              </div>
            ) : (
              <span>{accountDisplayName}</span>
            )}
          </Badge>
        </div>

        {/* Right: Monitor/Dashboard Display */}
      </div>
    </Card>
  );
};

export default WelcomeMessage;
