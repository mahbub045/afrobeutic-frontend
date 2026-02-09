export type SendOtpResponse = {
  message: string;
};

export type VerifyOtpResponse = {
  message: string;
  token: string;
};

export type ConsumerProfile = {
  uid: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string;
  role: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_APIBASE_URL;

const assertApiBaseUrl = () => {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_APIBASE_URL is not set");
  }
};

const parseJsonOrThrow = async (res: Response) => {
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "message" in data
        ? String((data as { message?: unknown }).message)
        : null) || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
};

export const sendCustomerOtp = async (phone: string) => {
  assertApiBaseUrl();

  const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phone }),
  });

  return (await parseJsonOrThrow(res)) as SendOtpResponse;
};

export const verifyCustomerOtp = async (otp_code: string) => {
  assertApiBaseUrl();

  const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ otp_code }),
  });

  return (await parseJsonOrThrow(res)) as VerifyOtpResponse;
};

export const fetchConsumerProfile = async (token: string) => {
  assertApiBaseUrl();

  const res = await fetch(`${API_BASE_URL}/consumers/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return (await parseJsonOrThrow(res)) as ConsumerProfile;
};
