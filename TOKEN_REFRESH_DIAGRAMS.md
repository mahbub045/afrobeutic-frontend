# Token Refresh Flow Diagrams

## 1. Initial Login Flow

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. POST /auth/login
       │    { email, password }
       ▼
┌─────────────────┐
│  Django Backend │
│   (API Server)  │
└────────┬────────┘
         │
         │ 2. Returns tokens
         │    { access, refresh, account_id }
         ▼
    ┌──────────┐
    │ NextAuth │
    │   JWT    │
    └────┬─────┘
         │
         │ 3. Stores in encrypted JWT cookie:
         │    - accessToken
         │    - refreshToken
         │    - accessTokenExpires: now + 12h
         │    - user data (uid, email, etc.)
         ▼
    ┌─────────┐
    │ Session │ ← User is now logged in
    └─────────┘
```

## 2. Automatic Token Refresh - Server Side (NextAuth)

```
┌─────────────┐
│   Client    │
│  Component  │
└──────┬──────┘
       │
       │ useSession() or getSession()
       ▼
┌─────────────────┐
│  NextAuth       │
│  JWT Callback   │
└────────┬────────┘
         │
         │ Check: Date.now() < accessTokenExpires ?
         │
    ┌────┴────┐
    │         │
    │ NO      │ YES
    │         │
    ▼         ▼
  ┌─────────────┐         Return existing token
  │   Refresh   │         (still valid)
  │   Required  │
  └──────┬──────┘
         │
         │ 1. POST /token/verify
         │    { token: refreshToken }
         ▼
┌─────────────────┐
│  Django Backend │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
  VALID    INVALID
    │         │
    │         └─→ Return error
    │              User signed out
    │
    │ 2. POST /token/refresh
    │    { refresh: refreshToken }
    ▼
┌─────────────────┐
│  Django Backend │
│  Returns new    │
│  access token   │
└────────┬────────┘
         │
         │ 3. Update JWT:
         │    - new accessToken
         │    - new accessTokenExpires
         ▼
    ┌─────────┐
    │ Updated │
    │ Session │ ← Transparent to user
    └─────────┘
```

## 3. Automatic Token Refresh - Client Side (API Calls)

```
┌─────────────┐
│   Client    │
│  Makes API  │
│   Request   │
└──────┬──────┘
       │
       │ GET/POST /api/endpoint
       │ Authorization: Bearer <access_token>
       ▼
┌─────────────────┐
│  Django Backend │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
   200       401
    │         │ Token Expired
    │         │
    │         ▼
    │    ┌──────────────────┐
    │    │ Axios Interceptor│
    │    │  or RTK Query    │
    │    └────────┬─────────┘
    │             │
    │             │ Queue request if
    │             │ refresh in progress
    │             │
    │             │ Get refreshToken
    │             │ from session
    │             ▼
    │    ┌─────────────────┐
    │    │ POST /token/    │
    │    │      refresh    │
    │    │ {refresh: "..."} │
    │    └────────┬────────┘
    │             │
    │        ┌────┴────┐
    │        │         │
    │     SUCCESS   FAILURE
    │        │         │
    │        │         └─→ Sign out user
    │        │              Redirect to login
    │        │
    │        │ Update Authorization header
    │        │ with new access token
    │        │
    │        │ RETRY original request
    │        ▼
    │    ┌─────────────────┐
    │    │  Django Backend │
    │    └────────┬────────┘
    │             │
    └─────────────┘
                  │
                  ▼ 200 OK
             ┌─────────┐
             │ Success │ ← User never noticed
             │ Response│    the refresh
             └─────────┘
```

## 4. Multiple Concurrent Requests During Refresh

```
Time →

Request A ──→ 401 ──→ Start Refresh ──→ Get new token ──→ Retry A ──→ ✓
                                ↓
Request B ──→ 401 ──→ (queued) ─┘                      ──→ Retry B ──→ ✓
                                ↓
Request C ──→ 401 ──→ (queued) ─┘                      ──→ Retry C ──→ ✓

Only ONE refresh attempt is made, all other requests wait in queue
```

## 5. Token Refresh Failure → Auto Logout

```
┌─────────────┐
│   Client    │
│  Makes API  │
│   Request   │
└──────┬──────┘
       │
       │ API call with expired access token
       ▼
┌─────────────────┐
│  Django Backend │
│  Returns 401    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Axios Interceptor│
│ Try to refresh  │
└────────┬────────┘
         │
         │ POST /token/refresh
         │ { refresh: refreshToken }
         ▼
┌─────────────────┐
│  Django Backend │
│  refresh token  │
│  also expired!  │
│  Returns 401    │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ TokenRefreshMonitor │
│ Detects error       │
└──────────┬──────────┘
           │
           │ signOut()
           ▼
┌─────────────────┐
│  Redirect to    │
│  /auth/login    │
└─────────────────┘
```

## 6. Session Monitoring Flow

```
┌──────────────────────┐
│  Root Layout         │
│  <Providers>         │
│    <SessionMonitor>  │
│    <TokenRefresh     │
│       Monitor>       │ ← Runs on every page
│      {children}      │
│    </TokenRefresh    │
│       Monitor>       │
│  </Providers>        │
└──────────┬───────────┘
           │
           │ Continuously monitors
           │ session.error
           ▼
    ┌──────────────┐
    │ Error found? │
    └──────┬───────┘
           │
      ┌────┴────┐
      │         │
     NO        YES
      │         │
      │         │ error === "RefreshAccessTokenError"
      │         │
      │         ▼
      │    ┌────────────┐
      │    │  Sign Out  │
      │    │  Redirect  │
      │    └────────────┘
      │
      └─→ Continue monitoring
```

## Key Points

### 🔄 Refresh Happens In Two Places:

1. **Server-side (NextAuth JWT callback)**
   - Before session is sent to client
   - Happens on `getSession()`, `useSession()` calls
   - More secure, runs on server

2. **Client-side (API interceptors)**
   - When API call gets 401 response
   - Immediate retry with new token
   - Better UX, no failed requests

### 🎯 User Experience:

- **Seamless**: User never sees token expiration
- **No interruption**: Failed requests are automatically retried
- **Secure logout**: If refresh fails, clean automatic logout
- **No manual handling**: Developers don't need to handle token refresh in components

### 🔐 Security:

- Refresh token stored in httpOnly cookie (via NextAuth JWT)
- Access token only sent to backend API
- Automatic cleanup on logout or refresh failure
- No token exposure in client JavaScript (except in session object)
