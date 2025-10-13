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
import { Check, Copy, ExternalLink, PenSquare } from "lucide-react";
import React, { useState } from "react";

const ContactsCard: React.FC = () => {
  // Replace these with props or data from store
  const website = "https://chh.com";
  const phone = "0876";
  const email = "hlh@hg.com";

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
        <div>
          <CardTitle className="text-sm">Contacts</CardTitle>
          <CardDescription className="text-muted-foreground mt-1 text-xs">
            Website, phone and email for this salon
          </CardDescription>
        </div>

        <CardAction>
          <Button
            variant="outline"
            size="sm"
            aria-label="Edit basic information"
          >
            <PenSquare className="size-4" />
            Edit
          </Button>
        </CardAction>
      </CardHeader>

      <Separator />

      <CardContent className="px-6 pt-4 pb-6">
        <div className="grid gap-4">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs font-semibold tracking-wide">
                WEBSITE
              </p>
              <a
                href={website}
                target="_blank"
                rel="noreferrer"
                className="text-primary mt-2 inline-flex items-center gap-2 text-sm font-medium"
              >
                <span className="block max-w-[260px] truncate">{website}</span>
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
              <p className="text-muted-foreground text-xs font-semibold tracking-wide">
                PHONE
              </p>
              <a
                className="text-foreground mt-2 block text-sm"
                href={`tel:${phone}`}
              >
                {phone}
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
              <p className="text-muted-foreground text-xs font-semibold tracking-wide">
                EMAIL
              </p>
              <a
                className="text-foreground mt-2 block text-sm"
                href={`mailto:${email}`}
              >
                {email}
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
      </CardContent>
    </Card>
  );
};

export default ContactsCard;
