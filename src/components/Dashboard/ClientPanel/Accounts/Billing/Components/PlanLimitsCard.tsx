"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { safe } from "@/lib/utils";
import { BillingSubscription } from "@/Types/ClientPanel/Accounts/BillingTypes";

type PricingPlan = BillingSubscription["pricing_plan"] | undefined;

export default function PlanLimitsCard({ plan }: { plan: PricingPlan }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Plan limits</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-primary text-lg font-bold">
                  Feature
                </TableHead>
                <TableHead className="text-primary text-right text-lg font-bold">
                  Limit
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Salon limit</TableCell>
                <TableCell className="text-right">
                  {safe(plan?.salon_limit)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>WhatsApp chatbot limit</TableCell>
                <TableCell className="text-right">
                  {safe(plan?.whatsapp_chatbot_limit)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Messages per chatbot</TableCell>
                <TableCell className="text-right">
                  {safe(plan?.whatsapp_messages_per_chatbot)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Broadcasting</TableCell>
                <TableCell className="text-right">
                  {plan?.has_broadcasting
                    ? `Yes (Limit -> ${safe(plan?.broadcasting_message_limit)})`
                    : "No"}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
