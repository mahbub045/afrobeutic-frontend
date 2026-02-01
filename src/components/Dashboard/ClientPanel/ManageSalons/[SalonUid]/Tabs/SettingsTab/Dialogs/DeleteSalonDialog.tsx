"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteSingleSalonMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/SingleSalon/SingleSalonApi";
import { EditDashboardProps } from "@/Types/ClientPanel/ManageSalonTypes/SalonListType";
import { useTheme } from "next-themes";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const DeleteSalonDialog: React.FC<EditDashboardProps> = ({
  singleSalonData,
  isOpen,
  onClose,
}) => {
  const { salonuid } = useParams();
  const { resolvedTheme } = useTheme();
  const router = useRouter();

  const [deleteSalon, { isLoading }] = useDeleteSingleSalonMutation();

  const handleDelete = async () => {
    try {
      if (!salonuid) return;

      await deleteSalon({ salonUid: salonuid }).unwrap();

      onClose();

      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Deleted",
        html: `Successfully deleted <b class="text-danger">${singleSalonData?.name}</b>.`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 2000,
      });

      // Navigate back to Manage Salons list
      router.push("/dashboard/client-panel/manage-salons");
    } catch (error) {
      console.error("Failed to delete salon:", error);
      toast.error("Failed to delete salon. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-danger">Delete Salon</DialogTitle>
          <DialogDescription className="text-xs">
            Are you sure you want to delete{" "}
            <b className="text-danger">{singleSalonData?.name}</b>? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1 rounded-md border border-red-100 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
          <p className="font-semibold">Warning</p>
          <p>
            This will permanently delete the salon and all associated data
            (appointments, clients, settings).
          </p>
          <p>
            Please ensure you have exported any important information — this
            action cannot be undone.
          </p>
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteSalonDialog;
