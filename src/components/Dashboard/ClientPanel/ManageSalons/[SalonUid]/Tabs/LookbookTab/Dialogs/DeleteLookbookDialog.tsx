"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useDeleteLookBookMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/LookBook/LookBookApi";
import { DeleteLookbookDialogProps } from "@/Types/ClientPanel/ManageSalonTypes/LookBookTypes/LookBookType";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import React from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const DeleteLookbookDialog: React.FC<DeleteLookbookDialogProps> = ({
  isOpen,
  onClose,
  selectedLookBook,
  onDeleted,
}) => {
  const { salonuid } = useParams();
  const { resolvedTheme } = useTheme();
  const salonUid = Array.isArray(salonuid) ? salonuid[0] : (salonuid ?? "");
  const [deleteLookBook, { isLoading }] = useDeleteLookBookMutation();

  const handleDelete = async () => {
    if (!salonUid || !selectedLookBook?.uid) {
      toast.error("No lookbook selected.");
      return;
    }

    try {
      await deleteLookBook({
        salonUid,
        lookBookUid: selectedLookBook.uid,
      }).unwrap();

      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Deleted!",
        html: `The lookbook for <b class="text-danger">${selectedLookBook.customer.first_name} ${selectedLookBook.customer.last_name}</b> has been successfully deleted.`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 2000,
      });
      onClose();
      onDeleted?.();
    } catch (error) {
      console.error("Failed to delete lookbook:", error);
      toast.error("Failed to delete lookbook. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="shadow dark:shadow-gray-600">
        <DialogHeader>
          <DialogTitle className="text-danger">Delete Lookbook</DialogTitle>
        </DialogHeader>
        <div>
          Are you sure you want to delete the lookbook for{" "}
          <b className="text-danger">
            {selectedLookBook?.customer.first_name}{" "}
            {selectedLookBook?.customer.last_name}
          </b>
          ? This action cannot be undone.
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

export default DeleteLookbookDialog;
