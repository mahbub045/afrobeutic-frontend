"use client";
import { Button } from "@/components/ui/button";
import { AccountDetailsProps } from "@/Types/AdminPanel/AccountsTypes/AccountsTypes";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import SalonsCard from "./Salons/SalonsCard";
import UsersCard from "./Users/UsersCard";

const AccountDetails: React.FC<AccountDetailsProps> = ({
  accountDetails,
  isLoading,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-primary text-lg font-semibold">
          {accountDetails?.name} Details
        </h2>
        <div>
          <Link href="/dashboard/admin-panel/accounts">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-slate-600 shadow-md dark:text-gray-300 dark:shadow-gray-600"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Accounts
            </Button>
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <UsersCard accountDetails={accountDetails} isLoading={isLoading} />
        <SalonsCard />
      </div>
    </div>
  );
};

export default AccountDetails;
