import apiClient from "@/services/api-client";
import axios from "axios";
import { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Extend NextAuth's user type to include all API response data
interface UserWithToken extends NextAuthUser {
  accessToken?: string;
  refreshToken?: string;
  uid?: string;
  account_id?: string; // Added account id from login response
  account_name?: string;
  account_type?: string;
  is_salon_limit_reached?: boolean;
  avatar?: string | null;
  first_name?: string;
  last_name?: string;
  country?: string;
  role?: string;
}

type AuthenticatedUserInfo = {
  uid?: string;
  email?: string;
  avatar?: string | null;
  first_name?: string;
  last_name?: string;
  country?: string;
  role?: string;
  account?: {
    uid?: string;
    name?: string;
    account_type?: string;
  };
  account_type?: string;
  is_salon_limit_reached?: boolean;
};

async function fetchAuthenticatedUser(
  accessToken: string,
  accountId?: string,
): Promise<AuthenticatedUserInfo> {
  const userInfoResponse = await axios.get(
    `${process.env.NEXT_PUBLIC_APIBASE_URL}/auth/me`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-ACCOUNT-ID": accountId || "",
      },
    },
  );

  return userInfoResponse.data as AuthenticatedUserInfo;
}

// TypeScript Declaration Module for Custom Session and User Properties
declare module "next-auth" {
  interface Session {
    refreshUserData?: boolean;
    user: {
      name?: string | null;
      email?: string | null;
      uid?: string;
      account_id?: string; // session account id
      account_name?: string;
      account_type?: string;
      is_salon_limit_reached?: boolean;
      avatar?: string | null;
      first_name?: string;
      last_name?: string;
      country?: string;
      accessToken?: string;
      refreshToken?: string;
      role?: string;
    };
  }

  interface User {
    accessToken?: string;
    refreshToken?: string;
    uid?: string;
    account_id?: string;
    account_name?: string;
    account_type?: string;
    is_salon_limit_reached?: boolean;
    avatar?: string | null;
    first_name?: string;
    last_name?: string;
    country?: string;
    role?: string;
  }

  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    uid?: string;
    account_id?: string;
    account_name?: string;
    account_type?: string;
    is_salon_limit_reached?: boolean;
    avatar?: string | null;
    first_name?: string;
    last_name?: string;
    country?: string;
    role?: string;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    // maxAge: 30, // 30 seconds for testing
    maxAge: 12 * 60 * 60, // 12 hours
  },
  pages: {
    signIn: "auth/login",
    signOut: "auth/login",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials) {
            throw new Error("No credentials provided");
          }

          // First, authenticate and get tokens
          const loginResponse = await apiClient.post("/auth/login", {
            email: credentials.email,
            password: credentials.password,
          });
          // console.log("Login Response:", loginResponse);

          if (loginResponse.data?.access) {
            // Then fetch user info using the access token
            const userInfo = await fetchAuthenticatedUser(
              loginResponse.data.access,
              loginResponse.data.account_id,
            );

            return {
              id: userInfo.uid || "default_id",
              name:
                `${userInfo.first_name} ${userInfo.last_name}`.trim() ||
                userInfo.email,
              email: userInfo.email,
              uid: userInfo.uid,
              avatar: userInfo.avatar,
              first_name: userInfo.first_name,
              last_name: userInfo.last_name,
              country: userInfo.country,
              role: userInfo.role,
              accessToken: loginResponse.data.access,
              refreshToken:
                loginResponse.data.refresh || loginResponse.data.refreshToken,
              account_id: loginResponse.data.account_id,
              account_name: userInfo.account?.name,
              account_type:
                loginResponse.data.account_type ||
                userInfo.account?.account_type ||
                userInfo.account_type,
              is_salon_limit_reached: userInfo.is_salon_limit_reached,
            };
          }
          return null;
        } catch (error) {
          console.error("Authentication error:", error);
          // Handle throttling explicitly
          if (axios.isAxiosError(error) && error.response?.status === 429) {
            const retryAfterHeader = error.response.headers?.["retry-after"] as
              | string
              | undefined;
            const retryAfter = retryAfterHeader
              ? Number(retryAfterHeader)
              : NaN;
            const seconds = Number.isFinite(retryAfter)
              ? retryAfter
              : undefined;
            const message = seconds
              ? `Request was throttled. Expected available in ${seconds} seconds.`
              : "Request was throttled. Expected available in 12 seconds.";
            throw new Error(message);
          }
          throw new Error("Invalid email or password.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const userWithToken = user as UserWithToken;
        if (userWithToken.accessToken) {
          token.accessToken = userWithToken.accessToken;
        }
        if (userWithToken.refreshToken) {
          token.refreshToken = userWithToken.refreshToken;
        }
        if (userWithToken.uid) {
          token.uid = userWithToken.uid;
        }
        if (userWithToken.account_id) {
          token.account_id = userWithToken.account_id;
        }
        if (userWithToken.account_name) {
          token.account_name = userWithToken.account_name;
        }
        if (userWithToken.account_type) {
          token.account_type = userWithToken.account_type;
        }
        if (userWithToken.is_salon_limit_reached !== undefined) {
          token.is_salon_limit_reached = userWithToken.is_salon_limit_reached;
        }
        if (userWithToken.avatar !== undefined) {
          token.avatar = userWithToken.avatar;
        }
        if (userWithToken.first_name) {
          token.first_name = userWithToken.first_name;
        }
        if (userWithToken.last_name) {
          token.last_name = userWithToken.last_name;
        }
        if (userWithToken.country) {
          token.country = userWithToken.country;
        }
        if (userWithToken.role) {
          token.role = userWithToken.role;
        }
      }

      // Handle session updates (e.g., when profile is edited)
      if (trigger === "update") {
        if (session?.refreshUserData && token.accessToken) {
          const userInfo = await fetchAuthenticatedUser(
            token.accessToken as string,
            (token.account_id as string | undefined) ?? undefined,
          );

          token.uid = userInfo.uid ?? token.uid;
          token.account_name = userInfo.account?.name ?? token.account_name;
          token.account_type =
            userInfo.account?.account_type ??
            userInfo.account_type ??
            token.account_type;
          token.avatar = userInfo.avatar ?? token.avatar;
          token.first_name = userInfo.first_name ?? token.first_name;
          token.last_name = userInfo.last_name ?? token.last_name;
          token.country = userInfo.country ?? token.country;
          token.role = userInfo.role ?? token.role;
          token.is_salon_limit_reached =
            userInfo.is_salon_limit_reached ?? token.is_salon_limit_reached;
        }

        if (session?.user?.first_name !== undefined) {
          token.first_name = session.user.first_name;
        }
        if (session?.user?.last_name !== undefined) {
          token.last_name = session.user.last_name;
        }
        if (session?.user?.country !== undefined) {
          token.country = session.user.country;
        }
        if (session?.user?.avatar !== undefined) {
          token.avatar = session.user.avatar;
        }
        if (session?.user?.account_type !== undefined) {
          token.account_type = session.user.account_type;
        }
        if (session?.user?.account_name !== undefined) {
          token.account_name = session.user.account_name;
        }
        if (session?.user?.is_salon_limit_reached !== undefined) {
          token.is_salon_limit_reached = session.user.is_salon_limit_reached;
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.user = {
        ...session.user,
        uid: token.uid as string | undefined,
        account_id: token.account_id as string | undefined,
        account_name: token.account_name as string | undefined,
        account_type: token.account_type as string | undefined,
        is_salon_limit_reached: token.is_salon_limit_reached as
          | boolean
          | undefined,
        avatar: token.avatar as string | null | undefined,
        first_name: token.first_name as string | undefined,
        last_name: token.last_name as string | undefined,
        country: token.country as string | undefined,
        role: token.role as string | undefined,
        accessToken: token.accessToken as string | undefined,
        refreshToken: token.refreshToken as string | undefined,
      };
      return session;
    },

    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
};
