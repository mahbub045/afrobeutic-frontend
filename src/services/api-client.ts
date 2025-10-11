import axios from "axios";
import { getSession } from "next-auth/react";

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

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
  (error) => {
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
