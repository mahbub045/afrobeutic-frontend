"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BriefcaseBusiness,
  Facebook,
  Globe,
  Info,
  Instagram,
  Mail,
  MapPin,
  Pause,
  Pencil,
  Phone,
  Settings,
  Trash,
  Twitter,
} from "lucide-react";
import Link from "next/link";

const SettingsTab: React.FC = () => {
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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left Column - Salon Profile */}
        <div className="space-y-6">
          {/* Salon Profile Card */}
          <Card className="border-0 bg-gradient-to-br from-slate-50 to-slate-100 shadow-md transition-shadow duration-300 hover:shadow-lg dark:from-slate-950 dark:to-slate-900 dark:shadow-gray-900">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-lg dark:border-slate-800 dark:shadow-gray-800">
                      <AvatarImage src="/images/common/salon-placeholder.jpg" />
                      <AvatarFallback className="text-xl font-bold">
                        S
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      Salon 1
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Your salon profile at a glance
                    </p>
                    <Badge variant="secondary" className="mt-2">
                      Male
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Address Section */}
          <Card className="border-0 shadow-md transition-shadow duration-300 hover:shadow-lg dark:shadow-gray-600">
            <CardContent className="p-4">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex gap-2 text-xl font-bold text-gray-900 dark:text-white">
                  <MapPin /> Address
                </h2>
                <Button variant="outline" size="sm">
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
              </div>
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                    Street
                  </p>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                    mjj, nknn
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                      City
                    </p>
                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                      hjh
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                      Postal Code
                    </p>
                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                      1204
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                    Country
                  </p>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                    Bangladesh
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - About & Professional Details */}
        <div className="space-y-6">
          {/* About Salon */}
          <Card className="border-0 shadow-md transition-shadow duration-300 hover:shadow-lg dark:shadow-gray-600">
            <CardContent className="p-4">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex gap-2 text-xl font-bold text-gray-900 dark:text-white">
                  <Info /> About Salon
                </h2>
                <Button variant="outline" size="sm">
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
              </div>
              <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
                sed magna euismod, sodales lorem at, porttitor est. Vestibulum
                ante ipsum primis in faucibus orci luctus et ultrices posuere
                cubilia curae;
              </p>
            </CardContent>
          </Card>

          {/* Professional Career Details */}
          <Card className="border-0 shadow-md transition-shadow duration-300 hover:shadow-lg dark:shadow-gray-600">
            <CardContent className="p-4">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex gap-2 text-xl font-bold text-gray-900 dark:text-white">
                  <BriefcaseBusiness /> Professional Career
                </h2>
                <Button variant="outline" size="sm">
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
              </div>
              <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                Suspendisse potenti. Curabitur at lacus in dui ultricies
                feugiat. Donec nec nunc bibendum, convallis libero vitae,
                commodo sem. Integer at nunc eget arcu tempor vulputate ac non
                nisl.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact & Social Links Section */}
      <Card className="border-0 shadow-md transition-shadow duration-300 hover:shadow-lg dark:shadow-gray-600">
        <CardContent className="p-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="flex gap-2 text-xl font-bold text-gray-900 dark:text-white">
              <Phone /> Contact & Social Links
            </h2>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          </div>

          <div className="space-y-6">
            {/* Phone */}
            <div className="flex items-start gap-4 border-b border-gray-100 pb-5 dark:border-gray-700">
              <div className="flex-shrink-0 rounded-lg bg-blue-100 p-3 dark:bg-blue-900">
                <Phone className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                  Phone
                </p>
                <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                  +123 456 789
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4 border-b border-gray-100 pb-5 dark:border-gray-700">
              <div className="flex-shrink-0 rounded-lg bg-amber-100 p-3 dark:bg-amber-900">
                <Mail className="h-5 w-5 text-amber-600 dark:text-amber-300" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                  Email
                </p>
                <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                  salon@example.com
                </p>
              </div>
            </div>

            {/* Website */}
            <div className="flex items-start gap-4 border-b border-gray-100 pb-5 dark:border-gray-700">
              <div className="flex-shrink-0 rounded-lg bg-green-100 p-3 dark:bg-green-900">
                <Globe className="h-5 w-5 text-green-600 dark:text-green-300" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                  Website
                </p>
                <Link
                  href="https://www.example.com"
                  target="_blank"
                  className="mt-1 inline-block text-lg font-semibold text-blue-600 hover:underline dark:text-blue-400"
                >
                  www.example.com
                </Link>
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-2">
              <p className="mb-4 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                Follow Us
              </p>
              <div className="flex gap-3">
                <Link
                  href="#"
                  className="transform rounded-lg bg-blue-600 p-3 transition-all duration-200 hover:scale-110 hover:bg-blue-700"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5 text-white" />
                </Link>
                <Link
                  href="#"
                  className="transform rounded-lg bg-gradient-to-tr from-pink-500 to-purple-500 p-3 transition-all duration-200 hover:scale-110 hover:shadow-lg"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5 text-white" />
                </Link>
                <Link
                  href="#"
                  className="transform rounded-lg bg-sky-400 p-3 transition-all duration-200 hover:scale-110 hover:bg-sky-500"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5 text-white" />
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-2">
        <Button variant={"warning"}>
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
