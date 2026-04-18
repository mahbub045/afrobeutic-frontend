# Effective Role Implementation

## Purpose

The `useEffectiveRole` hook centralizes role evaluation when account switching is enabled. It derives the current effective role from the authenticated session and any active switched account state, and exposes booleans used across the dashboard for UI and permission decisions.

## File

- `src/hooks/use-effective-role.ts`

## How it works

1. `useEffectiveRole` uses `useAccountSwitch()` to read the currently active account context:
   - `activeAccountId`
   - `activeAccountRole`

2. It also reads the session user's base account and role from the provided `session` object.

3. The primary effective role is determined as follows:
   - If the user has switched accounts and `activeAccountId` differs from `session.user.account_id`, use `activeAccountRole`.
   - Otherwise, use the base session role.

4. The hook returns the effective role and several derived permissions flags.

## Hook behavior

```ts
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
```

## Role categories

- `CLIENT_ROLES`: `OWNER`, `ADMIN`, `STAFF`
- `MANAGEMENT_ROLES`: `MANAGEMENT_ADMIN`, `MANAGEMENT_STAFF`
- `CLIENT_MANAGER_ROLES`: `OWNER`, `ADMIN`

## Returned values

- `role`: the active effective role string
- `hasSwitchedAccount`: whether the current account differs from the session account
- `isClientRole`: true when effective role belongs to a client account
- `isManagementRole`: true when effective role belongs to a management account
- `canManageClientAccount`: true for client roles that can manage account-level data (`OWNER`, `ADMIN`)
- `isManagementAdmin`: true when role is `MANAGEMENT_ADMIN`

## Usage

Use `useEffectiveRole` wherever UI or actions depend on the current effective role.

Examples:

- `src/components/Layout/NavBar/UserDropdown.tsx`
- `src/components/Dashboard/CommonComponents/Profile/index.tsx`
- `src/components/Dashboard/ClientPanel/Leads/LeadList/LeadList.tsx`
- `src/components/Dashboard/ClientPanel/Enquiries/EnquiryList/EnquiryList.tsx`

## Implementation notes

- The hook is intentionally simple and client-side only.
- It relies on `useAccountSwitch` for state persisted in Redux and localStorage.
- When a switched account is active, the hook falls back to the base role if `activeAccountRole` is missing.
- This ensures the application still has a valid role for permission checks even during incomplete account switch state.

## Benefits

- Provides a single source of truth for effective role resolution.
- Makes role-based UI logic consistent across components.
- Smoothly supports account switching by honoring active switched account context.
- Avoids repeated role and account comparators in multiple components.
