import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteMemberMutation } from "@/Redux/Reducers/ClientPanel/Members/MembersApi";
import { DeleteMemberDialogProps } from "@/Types/ClientPanel/MemberTypes/MemberType";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const DeleteMemberDialog: React.FC<DeleteMemberDialogProps> = ({
  isOpen,
  onClose,
  selectedMember,
}) => {
  // RTK hook
  const [deleteMember, { isLoading }] = useDeleteMemberMutation();

  const handleDelete = async () => {
    if (!selectedMember) return;

    try {
      await deleteMember(selectedMember.uid).unwrap();
      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Deleted!",
        text: `${selectedMember.name} has been deleted.`,
        confirmButtonColor: "#037375",
      });
    } catch (error) {
      console.error("Failed to delete member:", error);
      toast.error("Failed to delete member. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="shadow-md dark:shadow-gray-600">
        <DialogHeader>
          <DialogTitle className="text-danger">Delete Member</DialogTitle>
          <DialogDescription className="text-xs">
            Are you sure you want to delete{" "}
            <b className="text-danger">{selectedMember?.name}</b>?
            <p className="text-muted-foreground mt-2 text-xs">
              This action cannot be undone.
            </p>
          </DialogDescription>

          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="danger"
              className="text-white"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteMemberDialog;
