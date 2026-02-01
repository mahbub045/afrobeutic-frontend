"use client";

import { Button } from "@/components/ui/button";
import {
  useEditSingleSalonMutation,
  useGetSingleSalonDataQuery,
} from "@/Redux/Reducers/ClientPanel/ManageSalons/SingleSalon/SingleSalonApi";
import { Check, Pause, Settings, Trash } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import AboutAndProfessional from "./AboutAndProfessional/AboutAndProfessional";
import AddressSection from "./AddressSection/AddressSection";
import ContactAndSocialLinks from "./ContactAndSocialLinks/ContactAndSocialLinks";
import DeleteSalonDialog from "./Dialogs/DeleteSalonDialog";
import ProfessionalCareer from "./ProfessionalCareer/ProfessionalCareer";
import SalonProfileCard from "./SalonProfileCard/SalonProfileCard";

const SettingsTab: React.FC = () => {
  const { data: session } = useSession();
  const params = useParams();
  const { salonuid } = params;
  const { resolvedTheme } = useTheme();

  // RTK hooks
  const [editProfile, { isLoading: isEditing }] = useEditSingleSalonMutation();
  // RTK Hooks
  const {
    data: singleSalonData,
    isLoading,
    refetch,
  } = useGetSingleSalonDataQuery({
    salonUid: salonuid,
  });

  const handleToggleStatus = async () => {
    const isInactive = singleSalonData?.status === "INACTIVE";
    const res = await Swal.fire({
      title: isInactive ? "Activate salon" : "Deactivate salon",
      text: isInactive
        ? "Are you sure you want to activate this salon?"
        : "Are you sure you want to deactivate this salon?",
      icon: isInactive ? "question" : "warning",
      showCancelButton: true,
      confirmButtonText: isInactive ? "Yes, activate" : "Yes, deactivate",
      cancelButtonText: "Cancel",
      background: resolvedTheme === "dark" ? "#0f1724" : undefined,
      color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
      confirmButtonColor: "#037375",
      timer: 2000,
    });

    if (!res.isConfirmed) return;

    try {
      await editProfile({
        salonUid: salonuid as string,
        salonData: { status: isInactive ? "ACTIVE" : "INACTIVE" },
      }).unwrap();

      Swal.fire({
        icon: "success",
        title: isInactive ? "Activated" : "Deactivated",
        text: isInactive
          ? "Salon was activated successfully"
          : "Salon was deactivated successfully",
        showConfirmButton: false,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 2000,
      });

      // refresh data
      refetch();
    } catch (err) {
      console.error("Failed to update salon status", err);
      toast.error("Failed to update salon status. Please try again.");
    }
  };

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  return (
    <div className="space-y-8 pb-6">
      {/* Heading Section */}
      <div className="mb-8">
        <h2 className="flex gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <Settings /> Settings
        </h2>
        <p className="text-muted-foreground mt-2">
          Salon settings and preferences.
        </p>
      </div>
      {/* Profile Header Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column - Salon Profile */}
        <div className="space-y-6">
          {/* Salon Profile Card */}
          <SalonProfileCard
            singleSalonData={singleSalonData}
            isLoading={isLoading}
          />

          {/* Address Section */}
          <AddressSection
            singleSalonData={singleSalonData}
            isLoading={isLoading}
          />
        </div>

        <div className="space-y-6">
          {/* Contact & Social Links Section */}
          <ContactAndSocialLinks
            singleSalonData={singleSalonData}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* About Salon */}
      <div>
        {session?.user?.account_type === "INDIVIDUAL_STYLIST" ? (
          <AboutAndProfessional
            singleSalonData={singleSalonData}
            isLoading={isLoading}
          />
        ) : null}
      </div>
      {/* Professional Career Details */}
      <div>
        {session?.user?.account_type === "INDIVIDUAL_STYLIST" ? (
          <ProfessionalCareer
            singleSalonData={singleSalonData}
            isLoading={isLoading}
          />
        ) : null}
      </div>

      <hr />
      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        {(() => {
          const isInactive = singleSalonData?.status === "INACTIVE";
          return (
            <Button
              variant={isInactive ? "default" : "warning"}
              onClick={handleToggleStatus}
              disabled={isEditing}
              aria-label={isInactive ? "Activate salon" : "Deactivate salon"}
              className={
                isInactive
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : undefined
              }
            >
              {isInactive ? (
                <>
                  <Check /> {isEditing ? "Processing..." : "Activate Salon"}
                </>
              ) : (
                <>
                  <Pause /> {isEditing ? "Processing..." : "Deactivate Salon"}
                </>
              )}
            </Button>
          );
        })()}

        <Button
          variant="danger"
          onClick={() => setOpenDeleteDialog(true)}
          aria-label="Delete salon"
        >
          <Trash /> Delete Salon
        </Button>

        <DeleteSalonDialog
          singleSalonData={singleSalonData}
          isOpen={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
        />
      </div>
    </div>
  );
};

export default SettingsTab;
