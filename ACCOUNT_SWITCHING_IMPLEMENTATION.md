# Account Switching Implementation

## Overview

This implementation allows users to switch between different accounts they have access to. When a user clicks on an account card, the system switches to that account and persists the selection across page reloads.

## Key Features

1. **Click to Switch**: Users can click on any account card to switch to that account
2. **Persistent State**: The active account is stored in localStorage and survives page reloads
3. **Visual Feedback**: Active account is highlighted with a border and "Active" badge
4. **Easy Return**: Users can easily switch back to their main account via the banner
5. **Automatic API Integration**: All API calls automatically use the active account ID

## Files Created/Modified

### New Files Created:

1. **`src/Redux/Reducers/CommonReducer/accountSlice.ts`**
   - Redux slice for managing active account state
   - Actions: `setActiveAccount`, `clearActiveAccount`
   - Selector: `selectActiveAccountId`

2. **`src/hooks/use-account-switch.ts`**
   - Custom hook for account switching functionality
   - Methods:
     - `switchAccount(accountId)`: Switch to a specific account
     - `resetToMainAccount()`: Return to the main account
     - `getActiveAccountId()`: Get the current active account ID

3. **`src/components/Dashboard/CommonComponents/ActiveAccountBanner.tsx`**
   - Banner component showing when viewing a different account
   - Provides quick access to return to main account

4. **`src/components/AccountPersistence.tsx`**
   - Component that loads persisted account state from localStorage on app mount

### Modified Files:

1. **`src/Redux/Reducers/Store.ts`**
   - Added account reducer to the store

2. **`src/Redux/Api/BaseApi.ts`**
   - Updated to check localStorage for active account ID
   - Priority: localStorage > session account_id

3. **`src/services/api-client.ts`**
   - Updated to use the same localStorage logic as BaseApi

4. **`src/components/Dashboard/ClientPanel/SwitchAccount/AccountList/AccountList.tsx`**
   - Changed from Link navigation to onClick account switching
   - Added visual indicators for active account
   - Removed Link import (no longer needed)

5. **`src/components/Dashboard/ClientPanel/Home/index.tsx`**
   - Added ActiveAccountBanner component

6. **`src/app/providers.tsx`**
   - Added AccountPersistence component to initialize state from localStorage

## How It Works

### 1. Account Switching Flow

```
User clicks account card
  ↓
useAccountSwitch hook triggered
  ↓
Redux state updated (setActiveAccount)
  ↓
localStorage updated (persists across reloads)
  ↓
RTK Query cache cleared (baseApi.util.resetApiState)
  ↓
Navigate to dashboard
  ↓
All queries automatically refetch with new account
```

### 2. API Request Flow

```
API request initiated
  ↓
BaseApi/apiClient interceptor runs
  ↓
Check localStorage for activeAccountId
  ↓
If found: Use stored account ID
  ↓
If not found: Use session account_id
  ↓
Set X-ACCOUNT-ID header
  ↓
Request sent to backend
```

### 3. State Persistence Flow

```
App loads
  ↓
AccountPersistence component mounts
  ↓
Check localStorage for activeAccountId
  ↓
If found: Dispatch setActiveAccount to Redux
  ↓
All API calls will use this account ID
```

## Usage

### Switch to an Account

```typescript
import { useAccountSwitch } from "@/hooks/use-account-switch";

const { switchAccount } = useAccountSwitch();
switchAccount("account-uid-here");
```

### Return to Main Account

```typescript
import { useAccountSwitch } from "@/hooks/use-account-switch";

const { resetToMainAccount } = useAccountSwitch();
resetToMainAccount();
```

### Get Active Account ID

```typescript
import { useAccountSwitch } from "@/hooks/use-account-switch";

const { activeAccountId } = useAccountSwitch();
console.log("Current account:", activeAccountId);
```

## Benefits

1. **No Session Modification**: The main session remains unchanged, only the active account context is switched
2. **Survives Reloads**: Account selection persists even after page refresh or browser restart
3. **Automatic Data Refresh**: RTK Query automatically refetches all data when switching accounts - no manual reload needed
4. **Automatic API Integration**: All existing API calls automatically use the correct account ID without modification
5. **Visual Feedback**: Users always know which account they're viewing
6. **Easy to Reset**: Simple way to return to the main account
7. **Optimized Performance**: Uses RTK Query's built-in cache invalidation instead of full page reloads

## Testing

1. Navigate to the switch account page
2. Click on any account card
3. Verify you're redirected to dashboard
4. Verify the banner shows the active account
5. Check that data reflects the selected account
6. Reload the page - verify the account selection persists
7. Click "Back to My Account" to return to main account
