import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardTabProps } from "@/Types/ClientPanel/ManageSalonTypes/SalonListType";
import {
  Facebook,
  Instagram,
  Mail,
  Pencil,
  Phone,
  Youtube,
} from "lucide-react";
import React, { useState } from "react";
import EditContactAndSocialLinkDialog from "../Dialogs/EditContactAndSocialLinkDialog";

const ContactAndSocialLinks: React.FC<DashboardTabProps> = ({
  singleSalonData,
  isLoading,
}) => {
  const [openContactDialog, setOpenContactDialog] = useState(false);

  return (
    <Card className="border-0 shadow-md transition-shadow duration-300 hover:shadow-lg dark:shadow-gray-600">
      <CardContent className="p-4">
        <div className="mb-8 flex items-center justify-between">
          {isLoading ? (
            <Skeleton className="h-6 w-56" />
          ) : (
            <h2 className="flex gap-2 text-xl font-bold text-gray-900 dark:text-white">
              <Phone /> Contact & Social Links
            </h2>
          )}

          {isLoading ? (
            <Skeleton className="h-8 w-16 rounded" />
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenContactDialog(true)}
              aria-label="Edit contact and social links"
            >
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          )}
        </div>

        {/* Dialog */}
        <EditContactAndSocialLinkDialog
          singleSalonData={singleSalonData}
          isOpen={openContactDialog}
          onClose={() => setOpenContactDialog(false)}
        />

        <div className="space-y-4">
          {/* Phone */}
          {isLoading ? (
            <div className="flex items-start gap-4 border-b border-gray-100 pb-3 dark:border-gray-700">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-2 h-5 w-40" />
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-4 border-b border-gray-100 pb-3 dark:border-gray-700">
              <div className="flex-shrink-0 rounded-lg bg-blue-100 p-3 dark:bg-blue-900">
                <Phone className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                  Phone
                </p>
                <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                  {singleSalonData?.phone_number_one || "Not Specified"}
                </p>
              </div>
            </div>
          )}

          {/* Email */}
          {isLoading ? (
            <div className="flex items-start gap-4 border-b border-gray-100 pb-5 dark:border-gray-700">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="mt-2 h-5 w-48" />
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-4 border-b border-gray-100 pb-3 dark:border-gray-700">
              <div className="flex-shrink-0 rounded-lg bg-amber-100 p-3 dark:bg-amber-900">
                <Mail className="h-5 w-5 text-amber-600 dark:text-amber-300" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                  Email
                </p>
                <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                  {singleSalonData?.email || "Not Specified"}
                </p>
              </div>
            </div>
          )}

          {/* Social Links */}
          <div className="pt-2">
            <p className="mb-4 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
              Follow Us
            </p>

            <div className="flex gap-3">
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-16 rounded" />
                  <Skeleton className="h-8 w-16 rounded" />
                  <Skeleton className="h-8 w-16 rounded" />
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm">
                    <a
                      href={singleSalonData?.facebook || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Facebook className="text-blue-500" />
                    </a>
                  </Button>
                  <Button variant="outline" size="sm">
                    <a
                      href={singleSalonData?.instagram || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Instagram className="text-pink-500" />
                    </a>
                  </Button>
                  <Button variant="outline" size="sm">
                    <a
                      href={singleSalonData?.youtube || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Youtube className="text-red-600" />
                    </a>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactAndSocialLinks;
