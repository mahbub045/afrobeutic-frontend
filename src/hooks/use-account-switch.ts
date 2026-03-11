import { baseApi } from "@/Redux/Api/BaseApi";
import {
  clearActiveAccount,
  selectActiveAccountId,
  selectActiveAccountRole,
  setActiveAccount,
} from "@/Redux/Reducers/CommonReducer/accountSlice";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

export const useAccountSwitch = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const activeAccountId = useSelector(selectActiveAccountId);
  const activeAccountRole = useSelector(selectActiveAccountRole);

  const switchAccount = useCallback(
    (accountId: string, accountName?: string, accountRole?: string | null) => {
      // Store in Redux
      dispatch(
        setActiveAccount({
          id: accountId,
          role: accountRole,
        }),
      );

      // Persist to localStorage so it survives page reloads
      if (typeof window !== "undefined") {
        localStorage.setItem("activeAccountId", accountId);
        if (accountRole) {
          localStorage.setItem("activeAccountRole", accountRole);
        } else {
          localStorage.removeItem("activeAccountRole");
        }
      }

      // Invalidate all RTK Query cache to refetch data with new account
      dispatch(baseApi.util.resetApiState());

      // Show success notification
      toast.success(
        accountName
          ? `Switched to ${accountName}'s account`
          : "Account switched successfully",
      );

      // Navigate to dashboard
      router.push("/dashboard/client-panel");
    },
    [dispatch, router],
  );

  const resetToMainAccount = useCallback(() => {
    // Clear Redux state
    dispatch(clearActiveAccount());

    // Remove from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("activeAccountId");
      localStorage.removeItem("activeAccountRole");
    }

    // Invalidate all RTK Query cache to refetch data with main account
    dispatch(baseApi.util.resetApiState());

    // Show success notification
    toast.info("Returned to your main account");

    // Navigate to dashboard
    router.push("/dashboard/client-panel");
  }, [dispatch, router]);

  const getActiveAccountId = useCallback(() => {
    // Check localStorage first for persisted value
    if (typeof window !== "undefined") {
      return localStorage.getItem("activeAccountId");
    }
    return activeAccountId;
  }, [activeAccountId]);

  const getActiveAccountRole = useCallback(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("activeAccountRole");
    }
    return activeAccountRole;
  }, [activeAccountRole]);

  return {
    switchAccount,
    resetToMainAccount,
    activeAccountId: getActiveAccountId(),
    activeAccountRole: getActiveAccountRole(),
  };
};
