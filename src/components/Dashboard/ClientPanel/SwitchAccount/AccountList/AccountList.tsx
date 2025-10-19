import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccountSwitch } from "@/hooks/use-account-switch";
import { useGetAccountAccesserQuery } from "@/Redux/Reducers/ClientPanel/SwitchAccount/SwitchAccountApi";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useState } from "react";

const AccountList: React.FC = () => {
  const { switchAccount, activeAccountId } = useAccountSwitch();
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

  const {
    data: accountAccesserData,
    isLoading,
    isFetching,
  } = useGetAccountAccesserQuery({
    page: currentPage,
    search: debouncedSearch || undefined,
  });

  const handlePreviousPage = () => {
    if (accountAccesserData?.previous) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (accountAccesserData?.next) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const totalPages = accountAccesserData?.count
    ? Math.ceil(
        accountAccesserData.count / (accountAccesserData.results?.length || 1),
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row md:justify-end">
        {/* <div className="relative max-w-sm flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            type="text"
            placeholder="Search accounts by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="!px-8"
          />
        </div> */}
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid auto-rows-fr grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          {[...Array(12)].map((_, index) => (
            <Card key={index} className="h-full min-h-20 p-4">
              <Skeleton className="mb-2 h-6 w-3/4" />
              <Skeleton className="mb-2 h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </Card>
          ))}
        </div>
      ) : accountAccesserData?.results &&
        accountAccesserData.results.length > 0 ? (
        <>
          {/* Account Cards */}
          <div className="grid auto-rows-fr grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
            {accountAccesserData.results.map((account, index) => (
              <div key={account.uid || index} className="relative w-full">
                <Card
                  onClick={() => switchAccount(account.uid, account.owner_name)}
                  className={`group hover:shadow-primary/10 relative flex h-full min-h-20 w-full transform cursor-pointer flex-row items-center gap-4 overflow-hidden border bg-white/80 px-4 pt-8 pb-6 shadow-md backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg dark:bg-gray-900/80 dark:shadow-gray-600 ${
                    activeAccountId === account.uid
                      ? "border-primary border-2 shadow-lg"
                      : "border-gray-200/60 dark:border-gray-700/60"
                  }`}
                >
                  {/* Badge inside the Card so it visually sits in the top-right of the card */}
                  <div className="absolute top-2 right-2 z-30">
                    <Badge
                      variant={
                        activeAccountId === account.uid
                          ? "default"
                          : "secondary"
                      }
                      className="w-fit text-xs text-white"
                    >
                      {account.role &&
                        account.role
                          .split("_")
                          .map((part: string) =>
                            part
                              .split("")
                              .map((char: string, idx: number) =>
                                idx === 0
                                  ? char.toUpperCase()
                                  : char.toLowerCase(),
                              )
                              .join(""),
                          )
                          .join(" ")}
                    </Badge>
                  </div>

                  {activeAccountId === account.uid && (
                    <div className="absolute top-2 left-2 z-30">
                      <Badge variant="secondary" className="text-xs text-white">
                        Active
                      </Badge>
                    </div>
                  )}

                  <div className="flex w-full flex-row items-center gap-4">
                    <div className="flex flex-col items-start truncate">
                      <h3 className="text-primary truncate text-base font-semibold lg:text-lg">
                        {account.owner_name}&apos;s account
                      </h3>
                      <p className="truncate text-xs">{account.owner_email}</p>
                      <p className="mt-2 truncate text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium">Account ID:</span>{" "}
                        {account.uid}
                      </p>
                    </div>
                    <div className="ml-auto" />
                  </div>
                </Card>
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            <div>
              {accountAccesserData && accountAccesserData.count > 0 && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total: {accountAccesserData.count} account
                  {accountAccesserData.count !== 1 ? "s" : ""}
                </div>
              )}
            </div>
            <div>
              {/* Pagination Controls */}
              {accountAccesserData.count >
                accountAccesserData.results.length && (
                <div className="flex items-center justify-center gap-4 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={!accountAccesserData.previous || isFetching}
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
                    disabled={!accountAccesserData.next || isFetching}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm
              ? "No accounts found matching your search."
              : "No accounts available."}
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
      )}
    </div>
  );
};

export default AccountList;
