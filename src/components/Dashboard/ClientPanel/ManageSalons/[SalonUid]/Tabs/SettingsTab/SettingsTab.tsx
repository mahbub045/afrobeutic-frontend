"use client";

import { Button } from "@/components/ui/button";
import { useGetSingleSalonDataQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/SingleSalon/SingleSalonApi";
import { Pause, Settings, Trash } from "lucide-react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import AboutAndProfessional from "./AboutAndProfessional/AboutAndProfessional";
import AddressSection from "./AddressSection/AddressSection";
import ContactAndSocialLinks from "./ContactAndSocialLinks/ContactAndSocialLinks";
import ProfessionalCareer from "./ProfessionalCareer/ProfessionalCareer";
import SalonProfileCard from "./SalonProfileCard/SalonProfileCard";

const SettingsTab: React.FC = () => {
  const { data: session } = useSession();
  const params = useParams();
  const { salonuid } = params;
  // RTK Hooks
  const { data: singleSalonData, isLoading } = useGetSingleSalonDataQuery({
    salonUid: salonuid,
  });

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
          <SalonProfileCard singleSalonData={singleSalonData} isLoading={isLoading} />

          {/* Address Section */}
          <AddressSection singleSalonData={singleSalonData} isLoading={isLoading} />
        </div>

        <div className="space-y-6">
          {/* Contact & Social Links Section */}
          <ContactAndSocialLinks singleSalonData={singleSalonData} isLoading={isLoading} />
        </div>
      </div>

      {/* About Salon */}
      <div>
        {session?.user?.account_type === "INDIVIDUAL_STYLIST" ? (
          <AboutAndProfessional singleSalonData={singleSalonData} isLoading={isLoading} />
        ) : null}
      </div>
      {/* Professional Career Details */}
      <div>
        {session?.user?.account_type === "INDIVIDUAL_STYLIST" ? (
          <ProfessionalCareer singleSalonData={singleSalonData} isLoading={isLoading} />
        ) : null}
      </div>

      <hr />
      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="warning">
          <Pause /> Deactivate Salon
        </Button>
        <Button variant="danger">
          <Trash /> Delete Salon
        </Button>
      </div>
    </div>
  );
};

export default SettingsTab;
