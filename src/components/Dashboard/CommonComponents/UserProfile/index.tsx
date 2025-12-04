"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { countries } from "@/data/countries";
import * as React from "react";
import Breadcrumbs from "../Breadcrumbs";

type User = {
  avatar: string | null;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  country: string;
};

const sampleUser: User = {
  avatar: null,
  first_name: "Md Mahbub",
  last_name: "Rahman",
  email: "mahbub.official045@gmail.com",
  role: "OWNER",
  country: "BD",
};

function initials(name = "") {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const UserProfileConatiner: React.FC<{ data?: User }> = ({ data }) => {
  const user = data ?? sampleUser;
  const fullName = `${user.first_name} ${user.last_name}`.trim();
  const countryName =
    countries.find((c) => c.code === user.country)?.name ?? user.country;

  return (
    <div className="w-full">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard/client-panel" },
          { label: "User Profile", href: "/dashboard/client-panel/profile" },
        ]}
      />
      <div className="mx-auto">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="col-span-1">
            <CardContent>
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="from-primary/20 via-secondary/10 to-accent/10 rounded-full bg-gradient-to-br p-1">
                  <Avatar className="size-24">
                    {user.avatar ? (
                      <AvatarImage src={user.avatar} alt={fullName} />
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
                  <p className="text-muted-foreground text-sm">{user.role}</p>
                </div>

                <div className="mt-2 flex gap-2">
                  <Button variant="default" size="sm">
                    Edit Profile
                  </Button>
                  <Button variant="outline" size="sm">
                    Change Password
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6 lg:col-span-2">
            <Card>
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
                    <p className="font-medium">{user.first_name}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm">Last name</p>
                    <p className="font-medium">{user.last_name}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm">Country</p>
                    <p className="font-medium">{countryName}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Role and access</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Role</p>
                    <p className="font-medium">{user.role}</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-sm">
                      Member since
                    </p>
                    <p className="font-medium">2024</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileConatiner;
