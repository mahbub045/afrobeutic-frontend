import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetMembersQuery } from "@/Redux/Reducers/ClientPanel/Members/MembersApi";
import { EllipsisVertical, Plus, UserRoundPen, UserX } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import AddNewUserDialog from "./Dialogs/AddNewUserDialog";

// minimal Member type for this list component
export interface MemberProps {
  uid: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  status?: string;
  [key: string]: unknown;
}

const MemberList: React.FC = () => {
  const [isOpenAddUserModal, setIsOpenAddUserModal] = useState(false);
  const { data: session } = useSession();

  // RTK hooks
  const { data: membersData, isLoading: isLoadingMembers } =
    useGetMembersQuery(undefined);

  const handleOpenAddUserModal = () => {
    setIsOpenAddUserModal(true);
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button
          variant="default"
          size="sm"
          className="text-white"
          onClick={handleOpenAddUserModal}
        >
          <Plus />
          Invite User
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {isLoadingMembers &&
          Array.from({ length: 12 }).map((_, idx) => (
            <Card
              key={`member-skeleton-${idx}`}
              className="relative flex flex-col items-center gap-2 overflow-hidden border border-gray-200/60 bg-white/80 p-8 text-center shadow-md dark:border-gray-700/60 dark:bg-gray-900/80"
            >
              <div className="absolute top-2 left-2">
                <Skeleton className="h-5 w-5 rounded" />
              </div>
              <Skeleton className="absolute top-2 right-2 h-5 w-16" />
              <Skeleton className="mt-8 mb-4 h-20 w-20 rounded" />
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-4 w-48" />
            </Card>
          ))}
        {membersData?.map((member: MemberProps) => (
          <Card
            key={member.uid}
            className="group hover:shadow-primary/10 relative flex flex-col items-center gap-2 overflow-hidden border border-gray-200/60 bg-white/80 p-8 text-center shadow-md backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:border-gray-700/60 dark:bg-gray-900/80 dark:shadow-gray-600 dark:hover:shadow-gray-600/30"
          >
            {member.role !== "OWNER" && (
              <div className="absolute top-2 left-2">
                <DropdownMenu>
                  <DropdownMenuTrigger className="rounded-md px-1 dark:shadow-gray-600">
                    <EllipsisVertical className="cursor-pointer" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem className="text-primary cursor-pointer">
                      <UserRoundPen className="text-primary" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-danger cursor-pointer">
                      <UserX className="text-danger" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            <Badge
              variant="secondary"
              className="absolute top-2 right-2 w-fit text-xs text-white"
            >
              {member.role}
            </Badge>
            <Image
              src={member.avatar || "/images/common/user.png"}
              alt={member.name}
              width={80}
              height={80}
              className="rounded-full object-cover"
            />

            <h3 className="relative text-xl font-bold md:text-base lg:text-xl">
              {member.name}
              {/* animated status dot (ping + solid) at top-right of the image */}
              {/* <div className="absolute top-1 -right-3 flex items-center">
                <span
                  className={`absolute inline-flex h-3 w-3 rounded-full ${
                    member.status === "ACTIVE" ? "bg-green-400" : "bg-red-400"
                  } animate-ping opacity-75`}
                />
                <span
                  className={`relative inline-flex h-3 w-3 rounded-full ${
                    member.status === "ACTIVE" ? "bg-green-600" : "bg-red-600"
                  } border-2 border-white`}
                />
              </div> */}
            </h3>
            <p className="text-sm text-gray-600 md:text-xs lg:text-sm dark:text-gray-400">
              {member.email}
            </p>
          </Card>
        ))}
      </div>
      {/* Modals */}
      <AddNewUserDialog
        isOpen={isOpenAddUserModal}
        onClose={() => setIsOpenAddUserModal(false)}
      />
    </>
  );
};

export default MemberList;
