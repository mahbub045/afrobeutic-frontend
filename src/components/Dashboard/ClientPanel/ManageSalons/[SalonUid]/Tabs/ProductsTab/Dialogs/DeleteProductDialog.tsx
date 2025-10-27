import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useDeleteProductMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/Products/ProductsApi";
import { DeleteProductDialogProps } from "@/Types/ClientPanel/ManageSalonTypes/ProductsTypes/ProductsType";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const DeleteProductDialog: React.FC<DeleteProductDialogProps> = ({
  selectedProduct,
  isOpen,
  onClose,
}) => {
  const { salonuid } = useParams();
  const { resolvedTheme } = useTheme();
  const [deleteProduct, { isLoading }] = useDeleteProductMutation();

  const handleDelete = async () => {
    try {
      await deleteProduct({
        salonUid: salonuid,
        productUid: selectedProduct?.uid,
      }).unwrap();
      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Deleted!",
        html: `The product <b class="text-danger">${selectedProduct?.name}</b> has been successfully deleted.`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 3000,
      });
      onClose();
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Failed to delete product. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="shadow dark:shadow-gray-600">
        <DialogHeader>
          <DialogTitle className="text-danger">Delete Product</DialogTitle>
        </DialogHeader>
        <div>
          Are you sure you want to delete this{" "}
          <b className="text-danger">{selectedProduct?.name}</b> product? This
          action cannot be undone.
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

export default DeleteProductDialog;
