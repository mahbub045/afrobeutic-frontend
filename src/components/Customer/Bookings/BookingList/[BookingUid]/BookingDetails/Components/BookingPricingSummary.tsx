import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useDownloadReceiptMutation } from "@/Redux/Api/CustomerBaseApi";
import { CustomerBookingDetail } from "@/Types/Customer/BookingTypes";
import { Download, LoaderPinwheel, ReceiptText } from "lucide-react";
import React from "react";

interface Props {
  booking: CustomerBookingDetail;
}

interface LineItemProps {
  label: string;
  value: string;
  muted?: boolean;
  bold?: boolean;
  highlight?: boolean;
}

const LineItem: React.FC<LineItemProps> = ({
  label,
  value,
  muted,
  bold,
  highlight,
}) => (
  <div
    className={`flex items-center justify-between text-sm ${
      highlight
        ? "bg-primary/10 text-primary rounded-lg px-3 py-2 font-semibold"
        : ""
    }`}
  >
    <span className={muted ? "text-muted-foreground" : ""}>{label}</span>
    <span className={bold ? "font-semibold" : ""}>{value}</span>
  </div>
);

const fmt = (n?: number) => `$${(n ?? 0).toFixed(2)}`;

const BookingPricingSummary: React.FC<Props> = ({ booking }) => {
  const [downloadReceipt, { isLoading: isDownloading }] =
    useDownloadReceiptMutation();

  const handleDownload = async () => {
    try {
      const { url, fileName } = await downloadReceipt(booking.uid).unwrap();
      if (url) {
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = fileName || "receipt";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => window.URL.revokeObjectURL(url), 10000);
      }
    } catch (e) {
      console.error("receipt download failed", e);
    }
  };

  return (
    <Card className="space-y-4 rounded-xl border p-5 shadow-md dark:shadow-gray-600">
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground flex items-center gap-2 text-sm font-semibold tracking-wider uppercase">
          <ReceiptText className="h-4 w-4" />
          Pricing Summary
        </div>

        <div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <LoaderPinwheel className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span className="ml-2">Download Receipt</span>
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <LineItem
          label="Services subtotal"
          value={fmt(booking.total_services_price)}
          muted
        />
        <LineItem
          label="Products subtotal"
          value={fmt(booking.total_products_price)}
          muted
        />
        {booking.services_discount_price !== booking.total_services_price && (
          <LineItem
            label="Services (after discount)"
            value={fmt(booking.services_discount_price)}
            muted
          />
        )}
        <LineItem
          label="Tips"
          value={`$${parseFloat(booking.tips_amount ?? "0").toFixed(2)}`}
          muted
        />

        <Separator />

        <LineItem label="Total" value={fmt(booking.total_price)} bold />

        <LineItem
          label="Final Amount"
          value={fmt(booking.final_price)}
          highlight
        />
      </div>
    </Card>
  );
};

export default BookingPricingSummary;
