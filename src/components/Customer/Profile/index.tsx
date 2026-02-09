"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatChoiceFieldValue } from "@/lib/utils";
import { useGetCustomerProfileQuery } from "@/Redux/Api/CustomerBaseApi";
import {
  Edit,
  ExternalLink,
  LoaderPinwheel,
  Mail,
  Phone,
  User,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Breadcrumbs from "../Breadcrumbs/Breadcrumbs";
import EditCustomerProfileInfoDialog from "./Dialogs/EditCustomerProfileInfoDialog";

const CustomerProfileContainer: React.FC = () => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const handleEditDialogOpen = () => setIsEditDialogOpen(true);

  const {
    data: profile,
    isLoading,
    isError,
  } = useGetCustomerProfileQuery(undefined);

  const fullName =
    `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim();

  if (isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="flex flex-col items-center gap-2">
          <LoaderPinwheel className="text-primary h-8 w-8 animate-spin" />
          <p className="text-muted-foreground text-sm">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <Breadcrumbs
          items={[
            { label: "Bookings", href: "/customer/bookings" },
            { label: "Profile", href: "/customer/profile" },
          ]}
        />
        <div className="mt-6 rounded-lg border bg-white p-6 text-center dark:border-gray-800 dark:bg-gray-950">
          <p className="text-sm text-red-600">
            Failed to load profile. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Bookings", href: "/customer/bookings" },
          { label: "Profile", href: "/customer/profile" },
        ]}
      />

      <div className="mt-6 rounded-lg border bg-white p-6 shadow-md dark:border-gray-800 dark:bg-gray-950 dark:shadow-gray-600">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-sm font-medium">
                {profile.first_name ? profile.first_name[0] : ""}
                {profile.last_name ? profile.last_name[0] : ""}
              </AvatarFallback>
            </Avatar>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {fullName || profile.phone || profile.uid}
              </h2>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="secondary">
                  {formatChoiceFieldValue(profile?.role) || "Not Found"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <Button variant="outline" onClick={handleEditDialogOpen}>
              <Edit />
              Edit profile
            </Button>
            <Link href="/customer/bookings">
              <Button>
                <ExternalLink />
                My bookings
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="bg-muted/50 rounded-md p-4">
            <div className="flex items-start gap-3">
              <Phone className="text-muted-foreground h-5 w-5" />
              <div>
                <div className="text-muted-foreground text-xs">Phone</div>
                <div className="text-sm font-medium">{profile.phone}</div>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-md p-4">
            <div className="flex items-start gap-3">
              <Mail className="text-muted-foreground h-5 w-5" />
              <div>
                <div className="text-muted-foreground text-xs">Email</div>
                <div className="text-sm font-medium">
                  {profile.email ?? "Not provided"}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-md p-4">
            <div className="flex items-start gap-3">
              <User className="text-muted-foreground h-5 w-5" />
              <div>
                <div className="text-muted-foreground text-xs">User ID</div>
                <div className="text-sm font-medium break-all">
                  {profile.uid}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-md p-4">
            <div className="text-muted-foreground text-xs">Account</div>
            <div className="mt-1 text-sm font-medium">
              {formatChoiceFieldValue(profile?.role) || "Not Found"}
            </div>
          </div>
        </div>
      </div>
      {/* Modals  */}
      <EditCustomerProfileInfoDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </div>
  );
};

export default CustomerProfileContainer;
