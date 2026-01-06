import Link from "next/link";
import React from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Revenue: React.FC = () => {
  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Revenue</h2>
      </header>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-start">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Date Range:</label>
          <Select defaultValue="today">
            <SelectTrigger size="sm" className="w-40">
              <SelectValue>Today</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 md:ml-4">
          <label className="text-sm font-medium">Search:</label>
          <div className="w-full md:w-72">
            <Input placeholder="Booking ID or Customer N" />
          </div>
        </div>
      </div>

      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Customer Name</TableHead>
              <TableHead>Finished At</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Download Invoice</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <Link href="#" className="text-primary hover:underline">
                  BKG1160
                </Link>
              </TableCell>
              <TableCell>
                <Link href="#" className="text-primary hover:underline">
                  Michael Brown
                </Link>
              </TableCell>
              <TableCell>Jan 6, 2026, 08:55 PM</TableCell>
              <TableCell>$118.09</TableCell>
              <TableCell>
                <a className="text-primary hover:underline" href="#">
                  Download
                </a>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </section>
  );
};

export default Revenue;
