"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAccountSwitch } from "@/hooks/use-account-switch";
import { useGetAccountAccesserQuery } from "@/Redux/Reducers/ClientPanel/SwitchAccount/SwitchAccountApi";
import { ArrowLeft, Info } from "lucide-react";
import { useSession } from "next-auth/react";
import { useMemo } from "react";

export const ActiveAccountBanner = () => {
  const { data: session } = useSession();
  const { activeAccountId, resetToMainAccount } = useAccountSwitch();
  const { data: accountsData } = useGetAccountAccesserQuery();

  const mainAccountId = session?.user?.account_id;
  const isUsingDifferentAccount =
    activeAccountId && activeAccountId !== mainAccountId;

  // Find the active account details
  const activeAccount = useMemo(() => {
    if (!isUsingDifferentAccount || !accountsData?.results) return null;
    return accountsData.results.find((acc) => acc.uid === activeAccountId);
  }, [isUsingDifferentAccount, activeAccountId, accountsData]);

  if (!isUsingDifferentAccount) {
    return null;
  }

  return (
    <div className="mb-4 flex flex-col items-start justify-between gap-3 rounded-lg border-1 p-4 shadow-md sm:flex-row sm:items-center dark:shadow-gray-600">
      <div className="flex items-start gap-3 sm:items-center">
        <Info className="text-primary mt-0.5 h-5 w-5 sm:mt-0" />
        <div className="text-sm">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Badge variant="default" className="text-xs text-white">
              Viewing{" "}
              {activeAccount?.owner_name
                ? `${activeAccount.owner_name}'s`
                : "Different"}{" "}
              Account
            </Badge>
          </div>
          <p className="font-medium">
            <span className="text-muted-foreground/80 text-xs">
              ID: {activeAccountId}
            </span>
          </p>
          <p className="text-muted-foreground/80 mt-0.5 text-xs">
            All data and actions will be performed on this account
          </p>
        </div>
      </div>
      <Button
        onClick={resetToMainAccount}
        variant="outline"
        size="sm"
        className="w-full gap-2 shadow-md sm:w-auto dark:shadow-gray-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Account
      </Button>
    </div>
  );
};
