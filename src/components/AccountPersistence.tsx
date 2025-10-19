"use client";

import { setActiveAccount } from "@/Redux/Reducers/CommonReducer/accountSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export const AccountPersistence = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Load active account from localStorage on mount
    if (typeof window !== "undefined") {
      const storedAccountId = localStorage.getItem("activeAccountId");
      if (storedAccountId) {
        dispatch(setActiveAccount(storedAccountId));
      }
    }
  }, [dispatch]);

  return null;
};
