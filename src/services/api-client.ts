import axios, { AxiosRequestHeaders, InternalAxiosRequestConfig } from "axios";
import { getSession, signOut } from "next-auth/react";

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Create a reusable Axios instance
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APIBASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// console.log("inside interceptor files", {
//   res: apiClient.defaults,
// });

apiClient.interceptors.request.use(
  async (config) => {
    const session = await getSession();

    // Only log if we're trying to access a protected endpoint
    if (config.url && !config.url.includes("/auth/login")) {
      console.log("Session Data:", session);
      console.log("Token:", session?.user?.accessToken);
    }

    const token = session?.user?.accessToken;

    // Get active account from localStorage (persisted across reloads)
    const storedAccountId =
      typeof window !== "undefined"
        ? localStorage.getItem("activeAccountId")
        : null;

    // Priority: stored account > session account
    const accountId = storedAccountId || session?.user?.account_id;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (accountId) {
      const headers = config.headers as AxiosRequestHeaders;
      headers["X-ACCOUNT-ID"] = accountId;
    }

    return config;
  },
  (error) => {
    // console.error("Request Interceptor Error:", error);
    return Promise.reject(error);
  },
);

// Normalize common error responses
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized - Token might be expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const session = await getSession();
        const refreshToken = session?.user?.refreshToken;

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Try to refresh the token
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_APIBASE_URL}/token/refresh`,
          { refresh: refreshToken },
        );

        if (response.data?.access) {
          // Token refreshed successfully
          // Note: The session will be updated on next getSession() call via NextAuth
          isRefreshing = false;
          processQueue(null);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        processQueue(
          refreshError instanceof Error
            ? refreshError
            : new Error("Token refresh failed"),
        );
        isRefreshing = false;

        // If refresh fails, sign out the user
        if (typeof window !== "undefined") {
          await signOut({ redirect: true, callbackUrl: "/auth/login" });
        }
        return Promise.reject(refreshError);
      }
    }

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 429) {
        // Try to respect Retry-After header if present
        const retryAfterHeader = error.response?.headers?.["retry-after"] as
          | string
          | undefined;
        const retryAfter = retryAfterHeader ? Number(retryAfterHeader) : NaN;
        const seconds = Number.isFinite(retryAfter) ? retryAfter : undefined;
        const message = seconds
          ? `Request was throttled. Expected available in ${seconds} seconds.`
          : "Request was throttled. Expected available in 12 seconds.";

        // Set a friendly message for consumers
        error.message = message;
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
