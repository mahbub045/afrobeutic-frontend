"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Star } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

const OthersInfo: React.FC = () => {
  const { data: session } = useSession();

  const userName = session?.user?.first_name
    ? `${session.user.first_name} ${session.user.last_name || ""}`
    : session?.user?.email?.split("@")[0] || "User";

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Documentation Card */}
      <Card className="border shadow-md dark:shadow-gray-600">
        <CardHeader className="relative pb-4">
          <div className="absolute -top-8 right-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-tr-lg rounded-b-lg bg-amber-500">
                 <div className="absolute -top-1 -left-2 w-0 h-0 border-t-8 border-l-8 border-t-transparent border-l-amber-700"></div>
              <Star className="h-5 w-5 fill-white text-white" />
            </div>
          </div>
          <CardTitle className="pr-14 text-xl font-bold">
            Check our Online Management documentation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            We know it will be great and long journey with us. So we have
            prepared enough documentation so that you can manage this online
            platform like a Pro!
          </p>
          <Link href="/documentation" passHref>
            <Button className="w-full gap-2 bg-teal-600 text-white hover:bg-teal-700 sm:w-auto">
              Afrobeutic.com User Guide
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Account Details Card */}
      <Card className="border shadow-md dark:shadow-gray-600">
        <CardHeader className="border-b-1 border-teal-600 pb-4">
          <CardTitle className="text-xl font-bold">Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div>
            <p className="text-muted-foreground mb-1 text-sm">Account name:</p>
            <p className="font-semibold">{userName}&apos;s account</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-sm">Access Role:</p>
            <p className="font-semibold">owner</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OthersInfo;
