import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Facebook,
  Instagram,
  Mail,
  Pencil,
  Phone,
  Twitter,
} from "lucide-react";

const ContactAndSocialLinks: React.FC = () => {
  return (
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

          {/* Social Links */}
          <div className="pt-2">
            <p className="mb-4 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
              Follow Us
            </p>
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                <a href="">
                  <Facebook />
                </a>
              </Button>
              <Button variant="outline" size="sm">
                <a href="">
                  <Instagram />
                </a>
              </Button>
              <Button variant="outline" size="sm">
                <a href="">
                  <Twitter />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactAndSocialLinks;
