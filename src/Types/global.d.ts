declare module "*.css";
declare module "*.scss";
declare module "*.sass";
declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}
declare module "*.module.scss" {
  const classes: { [key: string]: string };
  export default classes;
}
declare module "*.module.sass" {
  const classes: { [key: string]: string };
  export default classes;
}

// Facebook SDK types
interface FBLoginResponse {
  authResponse?: {
    accessToken: string;
    userID: string;
    expiresIn: number;
    signedRequest: string;
    grantedScopes?: string;
  } | null;
  status: string;
}

interface FBLoginOptions {
  scope?: string;
  config_id?: string;
  auth_type?: string;
  response_type?: string;
  override_default_response_type?: boolean;
  extras?: {
    sessionInfoVersion?: number;
    setup?: {
      solutionID?: string;
    };
  };
}

interface FacebookSDK {
  init: (params: {
    appId: string;
    autoLogAppEvents?: boolean;
    xfbml?: boolean;
    version: string;
  }) => void;
  login: (
    callback: (response: FBLoginResponse) => void,
    options?: FBLoginOptions,
  ) => void;
  logout: (callback: () => void) => void;
  getLoginStatus: (callback: (response: FBLoginResponse) => void) => void;
  api: (path: string, callback: (response: unknown) => void) => void;
}

interface Window {
  FB?: FacebookSDK;
  fbAsyncInit?: () => void;
}
