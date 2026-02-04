import MetaOauthCallbackClient from "./MetaOauthCallbackClient";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MetaOauthCallbackPage({
  searchParams,
}: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};

  const codeRaw = resolvedSearchParams.code;
  const stateRaw = resolvedSearchParams.state;
  const errorRaw = resolvedSearchParams.error;
  const errorDescriptionRaw = resolvedSearchParams.error_description;

  const code = Array.isArray(codeRaw) ? codeRaw[0] : (codeRaw ?? null);
  const state = Array.isArray(stateRaw) ? stateRaw[0] : (stateRaw ?? null);
  const error = Array.isArray(errorRaw) ? errorRaw[0] : (errorRaw ?? null);
  const errorDescription = Array.isArray(errorDescriptionRaw)
    ? errorDescriptionRaw[0]
    : (errorDescriptionRaw ?? null);

  return (
    <MetaOauthCallbackClient
      code={code}
      state={state}
      error={error}
      errorDescription={errorDescription}
    />
  );
}
