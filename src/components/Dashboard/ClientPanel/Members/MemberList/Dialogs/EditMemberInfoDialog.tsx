import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useEditMemberMutation } from "@/Redux/Reducers/ClientPanel/Members/MembersApi";
import {
  EditFormValueProps,
  EditNewMemberDialogProps,
} from "@/Types/ClientPanel/MemberTypes/MemberType";
import { ErrorMessage, Field, Formik, Form as FormikForm } from "formik";
import { useTheme } from "next-themes";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as Yup from "yup";

const EditMemberInfoDialog: React.FC<EditNewMemberDialogProps> = ({
  isOpen,
  onClose,
  selectedMember,
}) => {
  const { resolvedTheme } = useTheme();
  const initialValues: EditFormValueProps = {
    status: selectedMember?.status ?? "",
    role: selectedMember?.role ?? "",
  };

  //   RTK hook
  const [editMember, { isLoading }] = useEditMemberMutation();

  const roles = [
    { value: "ADMIN", label: "Admin - Full Access" },
    { value: "STAFF", label: "Staff - Limited Access" },
  ];
  const statuses = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "SUSPENDED", label: "Suspended" },
  ];
  const validationSchema = Yup.object().shape({
    status: Yup.string().required("Required"),
    role: Yup.string().required("Required"),
  });

  const handleSubmit = (values: EditFormValueProps) => {
    // Handle form submission logic here
    if (!selectedMember) return;
    const memberData = {
      uid: selectedMember.uid,
      role: values.role,
      status: values.status,
    };
    editMember(memberData)
      .unwrap()
      .then(() => {
        onClose();
        Swal.fire({
          icon: "success",
          iconColor: "#037375",
          title: "Member Updated",
          text: `Member information has been updated successfully.`,
          background: resolvedTheme === "dark" ? "#0f1724" : undefined,
          color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
          confirmButtonColor: "#037375",
        });
      })
      .catch((error) => {
        console.error("Failed to edit member:", error);
        toast.error("Failed to update member information.");
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="shadow-md dark:shadow-gray-600">
        <DialogHeader>
          <DialogTitle>Edit Member Information</DialogTitle>
          <DialogDescription className="text-xs">
            Update the member&apos;s role and status.
          </DialogDescription>
        </DialogHeader>
        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          <FormikForm>
            <div className="mb-4">
              <Label htmlFor="role" className="mb-2">
                Access Type / Role<span className="text-danger">*</span>
              </Label>
              <Field id="role" name="role" as="select" required>
                <option value="" disabled>
                  Select a role
                </option>
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </Field>
              <ErrorMessage
                name="role"
                component="div"
                className="text-danger mt-1 text-xs"
              />
            </div>
            <div>
              <Label htmlFor="status" className="mb-2">
                Status<span className="text-danger">*</span>
              </Label>
              <Field id="status" name="status" as="select" required>
                <option value="" disabled>
                  Select a status
                </option>
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </Field>
              <ErrorMessage
                name="status"
                component="div"
                className="text-danger mt-1 text-xs"
              />
            </div>
            <div className="mt-2 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-40 text-white"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </FormikForm>
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default EditMemberInfoDialog;
