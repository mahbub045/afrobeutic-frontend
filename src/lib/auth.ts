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
  avatar?: string | null;
  first_name?: string;
  last_name?: string;
  country?: string;
  role?: string;
  accessTokenExpires?: number; // Timestamp when access token expires
}

// TypeScript Declaration Module for Custom Session and User Properties
declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      uid?: string;
      account_id?: string; // session account id
      avatar?: string | null;
      first_name?: string;
      last_name?: string;
      country?: string;
      accessToken?: string;
      refreshToken?: string;
      role?: string;
    };
    error?: string;
  }

  interface User {
    accessToken?: string;
    refreshToken?: string;
    uid?: string;
    account_id?: string;
    avatar?: string | null;
    first_name?: string;
    last_name?: string;
    country?: string;
    role?: string;
    accessTokenExpires?: number;
  }

  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    uid?: string;
    account_id?: string;
    avatar?: string | null;
    first_name?: string;
    last_name?: string;
    country?: string;
    role?: string;
    accessTokenExpires?: number;
    error?: string;
  }
}

/**
 * Refreshes the access token using the refresh token
 */
async function refreshAccessToken(token: {
  refreshToken?: string;
  [key: string]: unknown;
}) {
  try {
    // First verify if the access token is still valid
    await axios.post(`${process.env.NEXT_PUBLIC_APIBASE_URL}/token/verify`, {
      token: token.accessToken,
    });

    // If verification succeeds, refresh the token
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_APIBASE_URL}/token/refresh`,
      { refresh: token.refreshToken },
    );

    const refreshedTokens = response.data;

    if (!refreshedTokens?.access) {
      throw new Error("No access token in refresh response");
    }

    return {
      ...token,
      accessToken: refreshedTokens.access,
      accessTokenExpires: Date.now() + 12 * 60 * 60 * 1000, // 12 hours from now
      refreshToken: refreshedTokens.refresh ?? token.refreshToken, // Fall back to old refresh token
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
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
            const userInfoResponse = await axios.get(
              `${process.env.NEXT_PUBLIC_APIBASE_URL}/auth/me`,
              {
                headers: {
                  Authorization: `Bearer ${loginResponse.data.access}`,
                  "Content-Type": "application/json",
                  "X-ACCOUNT-ID": loginResponse.data.account_id || "",
                },
              },
            );
            // console.log("User Info Response:", userInfoResponse.data);

            const userInfo = userInfoResponse.data;

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
              refreshToken: loginResponse.data.refresh,
              account_id: loginResponse.data.account_id,
              accessTokenExpires: Date.now() + 12 * 60 * 60 * 1000, // 12 hours
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
    async jwt({ token, user }) {
      // Initial sign in - store all user data
      if (user) {
        const userWithToken = user as UserWithToken;
        if (userWithToken.accessToken) {
          token.accessToken = userWithToken.accessToken;
        }
        if (userWithToken.refreshToken) {
          token.refreshToken = userWithToken.refreshToken;
        }
        if (userWithToken.accessTokenExpires) {
          token.accessTokenExpires = userWithToken.accessTokenExpires;
        }
        if (userWithToken.uid) {
          token.uid = userWithToken.uid;
        }
        if (userWithToken.account_id) {
          token.account_id = userWithToken.account_id;
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
        return token;
      }

      // Return previous token if the access token has not expired yet
      if (
        token.accessTokenExpires &&
        typeof token.accessTokenExpires === "number" &&
        Date.now() < token.accessTokenExpires
      ) {
        return token;
      }

      // Access token has expired, try to refresh it
      console.log("Access token expired, refreshing...");
      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.user = {
        ...session.user,
        uid: token.uid as string | undefined,
        account_id: token.account_id as string | undefined,
        avatar: token.avatar as string | null | undefined,
        first_name: token.first_name as string | undefined,
        last_name: token.last_name as string | undefined,
        country: token.country as string | undefined,
        role: token.role as string | undefined,
        accessToken: token.accessToken as string | undefined,
        refreshToken: token.refreshToken as string | undefined,
      };

      // Pass error to client if token refresh failed
      if (token.error) {
        session.error = token.error as string;
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
};
