import { Dialog } from "@/components/ui/dialog";

const EditMemberInfoDialog: React.FC = () => {
  const roles = [
    { value: "ADMIN", label: "Admin - Full Access" },
    { value: "STAFF", label: "Staff - Limited Access" },
  ];
  const statuses = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "SUSPENDED", label: "Suspended" },
  ];
  return <Dialog>{/* JSX here */}</Dialog>;
};

export default EditMemberInfoDialog;
