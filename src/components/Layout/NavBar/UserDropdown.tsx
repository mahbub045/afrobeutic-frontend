"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatChoiceFieldValue } from "@/lib/utils";
import { LoaderPinwheel } from "lucide-react";
import Link from "next/link";
interface Props {
  status: "loading" | "authenticated" | "unauthenticated" | string;
  // session is intentionally typed as any to accept the app's expanded NextAuth session shape
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any;
  onSignOut: () => void;
}

const UserDropdown: React.FC<Props> = ({ status, session, onSignOut }) => {
  if (status === "loading")
    return (
      <div className="flex h-8 w-8 items-center justify-center">
        <LoaderPinwheel className="h-5 w-5 animate-spin" />
      </div>
    );

  if (!session?.user) {
    return (
      <div className="flex items-center space-x-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/auth/login">Sign in</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/auth/signup">Sign up</Link>
        </Button>
      </div>
    );
  }

  const displayName =
    session.user &&
    (session.user.first_name && session.user.last_name
      ? `${session.user.first_name} ${session.user.last_name}`
      : session.user.name || "");

  // Role helpers
  const role: string | undefined = session.user.role;
  const isClientRole = ["OWNER", "ADMIN", "STAFF"].includes(role || "");
  const isManagementRole = ["MANAGEMENT_ADMIN", "MANAGEMENT_STAFF"].includes(
    role || "",
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="inline-flex items-center gap-2 rounded-full px-2 py-1 dark:shadow-gray-600"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={session.user.avatar || ""}
              alt={session.user.name || "User"}
            />
            <AvatarFallback>
              {session.user.first_name?.[0] || session.user.name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>

          {/* show name on md+ screens */}
          <span className="hidden text-sm font-medium md:inline-block">
            {displayName}
          </span>
          <span className="sr-only">Open user menu</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm leading-none font-medium md:hidden">
              {session.user.first_name && session.user.last_name
                ? `${session.user.first_name} ${session.user.last_name}`
                : session.user.name}
            </p>
            <p className="text-muted-foreground text-xs leading-none">
              {session.user.email}
            </p>
            {session.user.role && (
              <Badge variant="secondary" className="w-fit text-xs">
                {formatChoiceFieldValue(session.user.role)}
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />
        {isClientRole && (
          <>
            <DropdownMenuItem asChild>
              <Link
                className="cursor-pointer"
                href="/dashboard/client-panel/profile"
              >
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                className="cursor-pointer"
                href="/dashboard/client-panel/members"
              >
                Members
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                className="cursor-pointer"
                href="/dashboard/client-panel/accounts/switch-account"
              >
                Switch account
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                className="cursor-pointer"
                href="/dashboard/client-panel/accounts/billing"
              >
                Billing
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                className="cursor-pointer"
                href="/dashboard/client-panel/accounts/pricing-plans"
              >
                Pricing Plans
              </Link>
            </DropdownMenuItem>
          </>
        )}
        {isManagementRole && (
          <>
            <DropdownMenuItem asChild>
              <Link
                className="cursor-pointer"
                href="/dashboard/admin-panel/profile"
              >
                Profile
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-danger cursor-pointer"
          onClick={onSignOut}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
