"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatChoiceFieldValue, getCountryName } from "@/lib/utils";
import {
  AccountDetailsProps,
  AccountListProps,
} from "@/Types/AdminPanel/AccountsTypes/AccountsTypes";
import { Bot, LoaderPinwheel } from "lucide-react";
import Image from "next/image";

const UsersCard: React.FC<AccountDetailsProps> = ({
  accountDetails,
  isLoading,
}) => {
  const users = accountDetails?.users ?? [];

  type User = NonNullable<AccountListProps["users"]>[0];

  const getFullName = (user: User) =>
    `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();

  const getInitials = (user: User) => {
    const first = user.first_name ? user.first_name.charAt(0) : "";
    const last = user.last_name ? user.last_name.charAt(0) : "";
    const initials = (first + last).toUpperCase();
    return initials || "?";
  };

  return (
    <Card className="h-full shadow-md dark:shadow-gray-600">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold">Users</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-lg p-8">
            <LoaderPinwheel
              className="text-primary h-8 w-8 animate-spin"
              aria-hidden="true"
            />
            <span className="sr-only">Loading users…</span>
          </div>
        ) : users.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center dark:border-gray-700 dark:bg-gray-900/50">
            <div className="space-y-2">
              <Bot className="text-muted-foreground/50 mx-auto h-10 w-10" />
              <p className="text-muted-foreground text-sm">No users yet</p>
              <p className="text-muted-foreground text-xs">
                Add users to manage access for this account
              </p>
            </div>
          </div>
        ) : (
          <div className="max-h-[340px] space-y-4 overflow-y-auto pr-2 pb-4">
            {users.map((user: User) => (
              <div
                key={user.uid}
                className="bg-card hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-4 shadow-md transition-colors dark:shadow-gray-600"
              >
                <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={getFullName(user)}
                      width={40}
                      height={40}
                      className="h-10 w-10 object-cover"
                    />
                  ) : (
                    <div className="text-primary flex h-10 w-10 items-center justify-center text-sm font-medium">
                      {getInitials(user)}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm leading-none font-medium">
                      {getFullName(user) || user.email}
                    </h4>
                    <Badge variant="secondary" className="text-xs">
                      {formatChoiceFieldValue(user.role) ?? "Unknown"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">{user.email}</p>
                  {user.country && (
                    <p className="text-muted-foreground mt-1 text-xs">
                      Country: {getCountryName(user.country)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UsersCard;
