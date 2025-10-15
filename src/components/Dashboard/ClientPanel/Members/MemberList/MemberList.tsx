import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical, Plus } from "lucide-react";
import Image from "next/image";
import React from "react";

const MemberList: React.FC = () => {
  const members = [
    {
      name: "Md Mahbub Rahman",
      email: "mahbub.official045@gmail.com",
      role: "Owner",
      image: "/images/common/user.png",
    },
    {
      name: "Md Mahbub Rahman",
      email: "mahbub.official045@gmail.com",
      role: "Staff",
      image: "/images/common/user.png",
    },
    // Add more members here
  ];

  return (
    <>
      <div className="flex justify-end">
        <Button variant="default" size="sm" className="text-white">
          <Plus />
          Invite User
        </Button>
      </div>
      <div className="flex flex-wrap gap-5">
        {members.map((member, index) => (
          <Card
            key={index}
            className="group hover:shadow-primary/10 relative flex flex-col items-center overflow-hidden border border-gray-200/60 bg-white/80 p-5 text-center shadow-md backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:border-gray-700/60 dark:bg-gray-900/80 dark:shadow-gray-600 dark:hover:shadow-gray-600/30"
          >
            <div className="absolute top-2 right-2">
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
            <Image
              src={member.image}
              alt={member.name}
              width={100}
              height={100}
              className="mb-4 rounded-full"
            />
            <h3 className="text-xl font-bold">{member.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {member.email}
            </p>
            <span className="rounded bg-orange-600 px-2 py-1 text-xs text-white">
              {member.role}
            </span>
          </Card>
        ))}
      </div>
    </>
  );
};

export default MemberList;
