"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatChoiceFieldValue,
  formatDateTime,
  getCountryName,
} from "@/lib/utils";
import { useGetProfileDataQuery } from "@/Redux/Reducers/Common/ProfileApi";
import { LoaderPinwheel } from "lucide-react";
import { useSession } from "next-auth/react";
import * as React from "react";
import { useState } from "react";
import Breadcrumbs from "../Breadcrumbs";
import ChangePasswordDialog from "./Dialogs/ChangePasswordDialog";
import EditAccountNameDialog from "./Dialogs/EditAccountNameDialog";
import EditProfileDialog from "./Dialogs/EditProfileDialog";

function initials(name = "") {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const ProfileConatiner: React.FC = () => {
  const { data: session } = useSession();
  const [isOpenChangePassword, setIsOpenChangePassword] = useState(false);
  const { data: userData, isLoading } = useGetProfileDataQuery(undefined);

  const toggleChangePasswordDialog = () => {
    setIsOpenChangePassword((prev) => !prev);
  };

  const fullName = `${userData?.first_name} ${userData?.last_name}`.trim();

  // Determine which dashboard panel link to show based on user role
  // Roles that should see the client panel
  const clientRoles = ["OWNER", "ADMIN", "STAFF"];
  const adminRoles = ["MANAGEMENT_ADMIN", "MANAGEMENT_STAFF"];

  const panelHref = clientRoles.includes(userData?.role)
    ? "/dashboard/client-panel"
    : adminRoles.includes(userData?.role)
      ? "/dashboard/admin-panel"
      : "/dashboard/client-panel";

  if (isLoading) {
    return (
      <div>
        <LoaderPinwheel className="mx-auto my-20 h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <Breadcrumbs
        items={[
          { label: "Home", href: panelHref },
          { label: "User Profile", href: `${panelHref}/profile` },
        ]}
      />
      <div className="mx-auto">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="col-span-1 shadow-md dark:shadow-gray-500">
            <CardContent>
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="from-primary/20 via-secondary/10 to-accent/10 rounded-full bg-gradient-to-br p-1">
                  <Avatar className="size-24">
                    {userData?.avatar ? (
                      <AvatarImage src={userData?.avatar} alt={fullName} />
                    ) : (
                      <AvatarFallback>
                        <span className="text-lg font-semibold">
                          {initials(fullName)}
                        </span>
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold">{fullName}</h2>
                  <Badge variant="secondary" className="text-sm">
                    {formatChoiceFieldValue(userData?.role || "-")}
                  </Badge>
                </div>

                <div className="mt-2 flex gap-2">
                  <EditProfileDialog data={userData} isFetching={isLoading} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleChangePasswordDialog}
                  >
                    Change Password
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6 lg:col-span-2">
            <Card className="shadow-md dark:shadow-gray-500">
              <CardHeader>
                <CardTitle>Profile Details</CardTitle>
                <CardDescription>
                  Personal and account information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm">First name</p>
                    <p className="font-medium">{userData?.first_name || "-"}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm">Last name</p>
                    <p className="font-medium">{userData?.last_name || "-"}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm">Email</p>
                    <p className="font-medium">{userData?.email || "-"}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm">Country</p>
                    <p className="font-medium">
                      {getCountryName(userData?.country || "-")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {session?.user?.role === "MANAGEMENT_ADMIN" ||
            session?.user?.role === "MANAGEMENT_STAFF" ? null : (
              <Card className="shadow-md dark:shadow-gray-500">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle>Account</CardTitle>
                      <CardDescription>Role and access</CardDescription>
                    </div>
                    <EditAccountNameDialog
                      accountName={userData?.account?.name}
                      isFetching={isLoading}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Account Name
                      </p>
                      <Badge variant="default" className="text-sm">
                        {userData?.account?.name || "-"}
                      </Badge>
                    </div>

                    <div>
                      <p className="text-muted-foreground text-sm">
                        Account Type
                      </p>
                      <Badge variant="secondary" className="text-sm">
                        {formatChoiceFieldValue(
                          userData?.account?.account_type || "-",
                        )}
                      </Badge>
                    </div>

                    <div>
                      <p className="text-muted-foreground text-sm">
                        Member since
                      </p>
                      <p className="font-medium">
                        {userData?.account?.created_at ? (
                          formatDateTime(userData?.account?.created_at)
                        ) : (
                          <small className="text-muted-foreground">
                            Not Available
                          </small>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <ChangePasswordDialog
        isOpen={isOpenChangePassword}
        onClose={toggleChangePasswordDialog}
      />
    </div>
  );
};

export default ProfileConatiner;
