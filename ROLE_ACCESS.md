# Role Access Pattern

## Overview
The `role` field is now inside the `accounts` array. Each user can have multiple accounts, and each account has its own role.

## Data Structure
```json
{
  "uid": "8b55f1b9-a4a2-4397-a9b7-277891547e9a",
  "avatar": null,
  "first_name": "Md Mahbub",
  "last_name": "Rahman",
  "email": "mahbub.official045@gmail.com",
  "country": "BD",
  "accounts": [
    {
      "uid": "78e791af-98fa-4b6f-94c7-1885cf801310",
      "name": "Md Mahbub's Account",
      "owner": "mahbub.official045@gmail.com",
      "role": "OWNER"
    }
  ]
}
```

## How to Access Role

### In Client Components (using `useSession`)
```typescript
import { useSession } from "next-auth/react";

function MyComponent() {
  const { data: session } = useSession();
  
  // Access role from first account
  const role = session?.user?.accounts?.[0]?.role;
  
  return <div>Your role: {role}</div>;
}
```

### In Server Components
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function MyPage() {
  const session = await getServerSession(authOptions);
  
  // Access role from first account
  const role = session?.user?.accounts?.[0]?.role;
  
  return <div>Your role: {role}</div>;
}
```

### In Middleware
```typescript
export default withAuth(function middleware(req) {
  const token = req.nextauth.token;
  
  // Type cast accounts and access role
  const accounts = token.accounts as Account[] | undefined;
  const role = accounts?.[0]?.role;
  
  if (role === "OWNER") {
    // Do something
  }
});
```

### Role-Based Access Control
```typescript
// Server component example
const session = await getServerSession(authOptions);
const allowedRoles = ["OWNER", "ADMIN", "STAFF"];
const role = session?.user?.accounts?.[0]?.role;

if (!role || !allowedRoles.includes(role)) {
  redirect("/auth/login?error=access_denied");
}
```

## Available Roles
- `MANAGEMENT_ADMIN` - Management admin role
- `MANAGEMENT_STAFF` - Management staff role  
- `OWNER` - Account owner
- `ADMIN` - Account admin
- `STAFF` - Account staff

## Notes
- Always use optional chaining (`?.`) when accessing accounts to avoid errors
- The first account `accounts[0]` is considered the primary account
- All role checks use the primary account's role
