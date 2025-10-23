"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardTabProps } from "@/Types/ClientPanel/ManageSalonTypes/SalonListType";
import { Check, Copy, ExternalLink, PenSquare } from "lucide-react";
import React, { useState } from "react";
import EditContactInfoDialog from "./Dialogs/EditContactInfoDialog";

const ContactsCard: React.FC<DashboardTabProps> = ({
  singleSalonData,
  isLoading,
}) => {
  const [openContactInfoDialog, setOpenContactInfoDialog] = useState(false);

  const handleOpenContactInfoDialog = () => {
    setOpenContactInfoDialog(true);
  };

  // Replace these with props or data from store
  const website = singleSalonData?.website || "";
  const phone = singleSalonData?.phone || "";
  const email = singleSalonData?.email || "";

  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(null), 1800);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  return (
    <Card className="shadow-md dark:shadow-gray-600">
      <CardHeader className="flex items-start justify-between gap-4 px-6 py-1">
        {isLoading ? (
          <div className="flex flex-col">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="mt-1 h-4 w-48" />
          </div>
        ) : (
          <div>
            <CardTitle className="text-sm">Contacts</CardTitle>
            <CardDescription className="text-muted-foreground mt-1 text-xs">
              Website, phone and email for this salon
            </CardDescription>
          </div>
        )}

        <CardAction>
          {isLoading ? (
            <Skeleton className="h-8 w-16 rounded-md" />
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="shadow-md dark:shadow-gray-600"
              aria-label="Edit basic information"
              onClick={handleOpenContactInfoDialog}
            >
              <PenSquare className="size-4" />
              Edit
            </Button>
          )}
        </CardAction>
      </CardHeader>

      <Separator />

      <CardContent className="px-6 pt-4 pb-6">
        {isLoading ? (
          <div className="grid gap-4">
            <div className="flex items-start justify-between">
              <div className="w-3/4 min-w-0">
                <Skeleton className="mt-2 h-4 w-16" />
                <Skeleton className="mt-2 h-4 w-[260px]" />
              </div>

              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>

            <div className="flex items-start justify-between">
              <div className="w-3/4">
                <Skeleton className="mt-2 h-4 w-16" />
                <Skeleton className="mt-2 h-4 w-32" />
              </div>

              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>

            <div className="flex items-start justify-between">
              <div className="w-3/4">
                <Skeleton className="mt-2 h-4 w-16" />
                <Skeleton className="mt-2 h-4 w-48" />
              </div>

              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  Website
                </p>
                <a
                  href={singleSalonData?.website || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary mt-2 inline-flex items-center gap-2 text-sm font-medium"
                >
                  <span className="block max-w-[260px] truncate">
                    {singleSalonData?.website || "Not Specified"}
                  </span>
                  <ExternalLink className="text-primary size-3" />
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(website, "website")}
                  aria-label="Copy website"
                >
                  {copied === "website" ? (
                    <Check className="size-4 text-green-500" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  Phone
                </p>
                <a
                  className="text-foreground mt-2 block text-sm"
                  href={`tel:${singleSalonData?.phone || "#"}`}
                >
                  {singleSalonData?.phone || "Not Specified"}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(phone, "phone")}
                  aria-label="Copy phone"
                >
                  {copied === "phone" ? (
                    <Check className="size-4 text-green-500" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  Email
                </p>
                <a
                  className="text-foreground mt-2 block text-sm"
                  href={`mailto:${singleSalonData?.email || "#"}`}
                >
                  {singleSalonData?.email || "Not Specified"}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(email, "email")}
                  aria-label="Copy email"
                >
                  {copied === "email" ? (
                    <Check className="size-4 text-green-500" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <EditContactInfoDialog
        singleSalonData={singleSalonData}
        isOpen={openContactInfoDialog}
        onClose={() => setOpenContactInfoDialog(false)}
      />
    </Card>
  );
};

export default ContactsCard;
