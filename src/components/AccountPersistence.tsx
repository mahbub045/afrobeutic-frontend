"use client";

import { setActiveAccount } from "@/Redux/Reducers/CommonReducer/accountSlice";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export const AccountPersistence = () => {
  const dispatch = useDispatch();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      status === "authenticated" &&
      session?.user
    ) {
      if (session.user.accessToken) {
        localStorage.setItem("token", session.user.accessToken);
      }

      if (session.user.refreshToken) {
        localStorage.setItem("refreshToken", session.user.refreshToken);
      }

      // Check if there's a stored active account
      const storedAccountId = localStorage.getItem("activeAccountId");
      const storedAccountRole = localStorage.getItem("activeAccountRole");

      if (storedAccountId) {
        // Use the stored account if it exists
        dispatch(
          setActiveAccount({
            id: storedAccountId,
            role: storedAccountRole,
          }),
        );
      } else if (session.user.account_id) {
        // If no stored account, default to user's own account
        dispatch(
          setActiveAccount({
            id: session.user.account_id,
            role: session.user.role,
          }),
        );
        localStorage.setItem("activeAccountId", session.user.account_id);
        if (session.user.role) {
          localStorage.setItem("activeAccountRole", session.user.role);
        }
      }
    }
  }, [dispatch, session, status]);

  return null;
};
