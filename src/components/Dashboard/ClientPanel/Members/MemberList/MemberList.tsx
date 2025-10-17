import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetMembersQuery } from "@/Redux/Reducers/ClientPanel/Members/MembersApi";
import { EllipsisVertical, Plus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import AddNewUserModal from "./Modals/AddNewUserModal";

// minimal Member type for this list component
export interface MemberProps {
  uid: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  [key: string]: unknown;
}

const MemberList: React.FC = () => {
  const [isOpenAddUserModal, setIsOpenAddUserModal] = useState(false);

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
        {membersData?.map((member: MemberProps) => (
          <Card
            key={member.uid}
            className="group hover:shadow-primary/10 relative flex flex-col items-center gap-2 overflow-hidden border border-gray-200/60 bg-white/80 p-8 text-center shadow-md backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:border-gray-700/60 dark:bg-gray-900/80 dark:shadow-gray-600 dark:hover:shadow-gray-600/30"
          >
            <div className="absolute top-2 left-2">
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-md px-1 dark:shadow-gray-600">
                  <EllipsisVertical className="cursor-pointer" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem className="cursor-pointer">
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    Delete
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    Deactivate
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    Activate
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
              height={100}
              className="mt-5 mb-4 rounded-md"
            />
            <h3 className="text-xl md:text-base lg:text-xl font-bold">{member.name}</h3>
            <p className="text-sm md:text-xs lg:text-sm text-gray-600 dark:text-gray-400">
              {member.email}
            </p>
          </Card>
        ))}
      </div>
      {/* Modals */}
      <AddNewUserModal
        isOpen={isOpenAddUserModal}
        onClose={() => setIsOpenAddUserModal(false)}
      />
    </>
  );
};

export default MemberList;
