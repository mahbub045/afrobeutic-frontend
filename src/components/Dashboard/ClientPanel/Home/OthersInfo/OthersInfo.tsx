"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccountSwitch } from "@/hooks/use-account-switch";
import { formatChoiceFieldValue } from "@/lib/utils";
import { useGetAccountAccesserQuery } from "@/Redux/Reducers/ClientPanel/Accounts/SwitchAccount/SwitchAccountApi";
import { ArrowRight, LoaderPinwheel, Star } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useMemo } from "react";

const OthersInfo: React.FC = () => {
  const { data: session } = useSession();
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
    <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Documentation Card */}
      <Card className="border shadow-md dark:shadow-gray-600">
        <CardHeader className="relative pb-4">
          <div className="absolute -top-8 right-4">
            <div className="z-20 flex h-10 w-10 items-center justify-center rounded-tr-lg rounded-b-lg bg-amber-500">
              <div className="absolute -top-0 -left-2 z-10 h-0 w-0 border-t-8 border-r-8 border-t-transparent border-r-amber-800"></div>
              <Star className="h-5 w-5 fill-white text-white" />
            </div>
          </div>
          <CardTitle className="pr-14 text-xl font-bold">
            Check our Online Management documentation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            We know it will be great and long journey with us. So we have
            prepared enough documentation so that you can manage this online
            platform like a Pro!
          </p>
          <Link href="/documentation" passHref>
            <Button className="w-full gap-2 bg-teal-600 text-white hover:bg-teal-700 sm:w-auto">
              Afrobeutic.com User Guide
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Account Details Card */}
      <Card className="border shadow-md dark:shadow-gray-600">
        <CardHeader className="border-b-1 border-teal-600 pb-4">
          <CardTitle className="text-xl font-bold">Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          {!session ? (
            <div className="flex items-center justify-center py-8">
              <LoaderPinwheel className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            <>
              <div>
                <p className="text-muted-foreground mb-1 text-sm">
                  Account name:
                </p>
                <p className="font-semibold">{accountDisplayName}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1 text-sm">
                  Access Role:
                </p>
                <Badge variant="secondary" className="font-semibold text-white">
                  {(isViewingDifferentAccount && activeAccount
                    ? formatChoiceFieldValue(activeAccount.role)
                    : formatChoiceFieldValue(session?.user?.role)) || "N/A"}
                </Badge>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OthersInfo;
