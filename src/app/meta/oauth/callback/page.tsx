"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function MetaOauthCallbackPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    const payload = {
      type: "META_OAUTH_CODE",
      code,
      state,
      error,
      errorDescription,
    };

    try {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(payload, window.location.origin);
        window.close();
        return;
      }
    } catch {
      // ignore
    }

    // Fallback: keep the payload accessible if there is no opener.
    try {
      localStorage.setItem("META_OAUTH_LAST_RESULT", JSON.stringify(payload));
    } catch {
      // ignore
    }
  }, [searchParams]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-2 p-6 text-center">
      <h1 className="text-lg font-semibold">Completing Meta login…</h1>
      <p className="text-muted-foreground text-sm">
        If this window doesn’t close automatically, you can close it.
      </p>
    </div>
  );
}
