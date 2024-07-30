import { useEffect, useState } from "react";
import {
  isSignInRedirect,
  getProviderFromUrl,
  GoogleProvider,
} from "@lit-protocol/lit-auth-client";
import { AuthMethod } from "@lit-protocol/types";
import { litAuthClient } from "@/services/helper";
import { ProviderType } from "@lit-protocol/constants";

export default function useGenerateOAuth(redirectUri?: string) {
  const [authMethod, setAuthMethod] = useState<AuthMethod | undefined>(
    undefined
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    async function handleAuthentication() {
      if (redirectUri && isSignInRedirect(redirectUri)) {
        const providerName = getProviderFromUrl();
        if (providerName === "google") {
          setLoading(true);
          setError(undefined);
          setAuthMethod(undefined);

          try {
            const googleProvider = litAuthClient.initProvider<GoogleProvider>(
              ProviderType.Google,
              { redirectUri }
            );
            const newAuthMethod = await googleProvider.authenticate();
            setAuthMethod(newAuthMethod);
          } catch (err) {
            setError(new Error(`${err}`));
          } finally {
            setLoading(false);
          }
        }
      }
    }

    handleAuthentication();
  }, [redirectUri]);

  return {
    authMethod,
    loading,
    error,
  };
}
