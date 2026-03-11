"use client";

import { useAccountSwitch } from "@/hooks/use-account-switch";

type SessionLike = {
  user?: {
    role?: string | null;
    account_id?: string | null;
  };
} | null;

const CLIENT_ROLES = new Set(["OWNER", "ADMIN", "STAFF"]);
const MANAGEMENT_ROLES = new Set(["MANAGEMENT_ADMIN", "MANAGEMENT_STAFF"]);
const CLIENT_MANAGER_ROLES = new Set(["OWNER", "ADMIN"]);

export const useEffectiveRole = (session?: SessionLike) => {
  const { activeAccountId, activeAccountRole } = useAccountSwitch();

  const sessionAccountId = session?.user?.account_id ?? null;
  const baseRole = session?.user?.role
    ? String(session.user.role).toUpperCase()
    : null;
  const switchedRole = activeAccountRole
    ? String(activeAccountRole).toUpperCase()
    : null;
  const hasSwitchedAccount =
    !!activeAccountId && activeAccountId !== sessionAccountId;
  const role = hasSwitchedAccount ? (switchedRole ?? baseRole) : baseRole;

  return {
    role,
    hasSwitchedAccount,
    isClientRole: role ? CLIENT_ROLES.has(role) : false,
    isManagementRole: role ? MANAGEMENT_ROLES.has(role) : false,
    canManageClientAccount: role ? CLIENT_MANAGER_ROLES.has(role) : false,
    isManagementAdmin: role === "MANAGEMENT_ADMIN",
  };
};
