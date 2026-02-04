"use client";

type MetaSdkOptions = {
  appId: string;
  version?: string;
  locale?: string;
};

let sdkLoadPromise: Promise<void> | null = null;

function getSdkScriptId() {
  return "facebook-jssdk";
}

export function loadMetaSdk({
  appId,
  version = "v18.0",
  locale = "en_US",
}: MetaSdkOptions): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("Meta SDK can only be loaded in the browser"),
    );
  }

  if (!appId) {
    return Promise.reject(new Error("Missing Meta app id"));
  }

  if (window.FB) {
    return Promise.resolve();
  }

  if (sdkLoadPromise) return sdkLoadPromise;

  sdkLoadPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(getSdkScriptId());
    if (existingScript) {
      const check = () => {
        if (window.FB) resolve();
        else setTimeout(check, 50);
      };
      check();
      return;
    }

    window.fbAsyncInit = function () {
      try {
        window.FB?.init({
          appId,
          cookie: true,
          xfbml: true,
          version,
        });
        resolve();
      } catch (e) {
        reject(e instanceof Error ? e : new Error("Failed to init Meta SDK"));
      }
    };

    const script = document.createElement("script");
    script.id = getSdkScriptId();
    script.src = `https://connect.facebook.net/${locale}/sdk.js`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Failed to load Meta SDK"));

    document.body.appendChild(script);
  });

  return sdkLoadPromise;
}
