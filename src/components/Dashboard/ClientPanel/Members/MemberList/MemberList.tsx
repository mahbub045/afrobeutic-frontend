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
import { useEffectiveRole } from "@/hooks/use-effective-role";
import { formatChoiceFieldValue } from "@/lib/utils";
import { useGetMembersQuery } from "@/Redux/Reducers/ClientPanel/Members/MembersApi";
import { MemberProps } from "@/Types/ClientPanel/ManageSalonTypes/MemberTypes/MemberType";
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Plus,
  UserRoundPen,
  UserX,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import AddNewMemberDialog from "./Dialogs/AddNewMemberDialog";
import DeleteMemberDialog from "./Dialogs/DeleteMemberDialog";
import EditMemberInfoDialog from "./Dialogs/EditMemberInfoDialog";

const MemberList: React.FC = () => {
  const { data: session } = useSession();
  const { canManageClientAccount } = useEffectiveRole(session);
  const [isOpenAddMemberModal, setIsOpenAddMemberModal] = useState(false);
  const [isOpenEditMemberModal, setIsOpenEditMemberModal] = useState(false);
  const [isOpenDeleteMemberModal, setIsOpenDeleteMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberProps | undefined>(
    undefined,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page on new search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // RTK hooks
  const {
    data: membersData,
    isLoading: isLoadingMembers,
    isFetching,
  } = useGetMembersQuery({
    page: currentPage,
    search: debouncedSearch || undefined,
  });

  const handleOpenAddMemberModal = () => {
    setIsOpenAddMemberModal(true);
  };
  const handleOpenEditMemberModal = (member: MemberProps) => {
    setSelectedMember(member);
    setIsOpenEditMemberModal(true);
  };
  const handleOpenDeleteMemberModal = (member: MemberProps) => {
    setSelectedMember(member);
    setIsOpenDeleteMemberModal(true);
  };

  const handlePreviousPage = () => {
    if (membersData?.previous) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (membersData?.next) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const totalPages = membersData?.count
    ? Math.ceil(membersData.count / (membersData.results?.length || 1))
    : 0;

  return (
    <div className="space-y-6">
      {/* Search Bar and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
        {/* <div className="relative max-w-sm flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            type="text"
            placeholder="Search members by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="!px-8"
          />
        </div> */}
        <div>
          {canManageClientAccount && (
            <Button
              variant="default"
              size="sm"
              className="text-white"
              onClick={handleOpenAddMemberModal}
            >
              <Plus />
              Invite Member
            </Button>
          )}
        </div>
      </div>

      {/* Member Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
        {!isLoadingMembers &&
        membersData?.results &&
        membersData.results.length > 0 ? (
          membersData.results.map((member: MemberProps) => (
            <Card
              key={member.uid}
              className="group hover:shadow-primary/10 relative gap-2 overflow-hidden border border-gray-200/60 bg-white/80 p-2 text-center shadow-md backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:border-gray-700/60 dark:bg-gray-900/80 dark:shadow-gray-600 dark:hover:shadow-gray-600/30"
            >
              {/* Animated border gradient */}
              <div className="from-primary/10 dark:from-primary/20 dark:to-primary/20 to-primary/10 pointer-events-none absolute inset-0 z-0 rounded-lg bg-gradient-to-r via-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="secondary" className="text-xs">
                    {member.role ? formatChoiceFieldValue(member.role) : "N/A"}
                  </Badge>
                </div>
                <div>
                  {canManageClientAccount && member.role !== "OWNER" && (
                    <div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="relative z-10 h-8 w-8 p-0 shadow-md dark:shadow-gray-600"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            className="text-primary cursor-pointer"
                            onClick={() => handleOpenEditMemberModal(member)}
                          >
                            <UserRoundPen className="text-primary" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-danger cursor-pointer"
                            onClick={() => handleOpenDeleteMemberModal(member)}
                          >
                            <UserX className="text-danger" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center">
                <Image
                  src={member.avatar || "/images/common/user.png"}
                  alt={member.name}
                  width={80}
                  height={80}
                  className="mb-2 rounded-full h-20 w-20 object-cover"
                />

                <h3 className="relative text-xl font-bold md:text-base lg:text-lg xl:text-xl">
                  {member.name}
                </h3>
                <p className="text-sm text-gray-600 md:text-xs lg:text-sm dark:text-gray-400">
                  {member.email}
                </p>
              </div>
            </Card>
          ))
        ) : !isLoadingMembers ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm
                ? "No members found matching your search."
                : "No members available."}
            </p>
            {searchTerm && (
              <Button
                variant="link"
                onClick={() => setSearchTerm("")}
                className="mt-2"
              >
                Clear search
              </Button>
            )}
          </div>
        ) : null}
      </div>
      <div className="flex justify-between">
        <div>
          {membersData && membersData.count > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total: {membersData.count} member
              {membersData.count !== 1 ? "s" : ""}
            </div>
          )}
        </div>
        <div>
          {/* Pagination Controls */}
          {membersData && membersData.count > membersData.results.length && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={!membersData.previous || isFetching}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!membersData.next || isFetching}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddNewMemberDialog
        isOpen={isOpenAddMemberModal}
        onClose={() => setIsOpenAddMemberModal(false)}
      />
      <EditMemberInfoDialog
        isOpen={isOpenEditMemberModal}
        onClose={() => {
          setIsOpenEditMemberModal(false);
        }}
        selectedMember={selectedMember}
      />
      <DeleteMemberDialog
        isOpen={isOpenDeleteMemberModal}
        onClose={() => setIsOpenDeleteMemberModal(false)}
        selectedMember={selectedMember}
      />
    </div>
  );
};

export default MemberList;
