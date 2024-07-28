import { useState } from "react";
import { AuthMethod, IRelayPKP, SessionSigs } from "@lit-protocol/types";
import {
  LitAbility,
  LitActionResource,
  LitPKPResource,
} from "@lit-protocol/auth-helpers";
import { litNodeClient } from "@/services/helper";

export default function useFetchSessionSignatures() {
  const [sessionSigs, setSessionSigs] = useState<SessionSigs | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  async function getSessionSigs(
    authMethod: AuthMethod,
    pkp: IRelayPKP
  ): Promise<SessionSigs | null> {
    setLoading(true);
    setError(null);
    try {
      const expiration = new Date(
        Date.now() + 1000 * 60 * 60 * 24 * 7
      ).toISOString(); // 7 days from now

      const pkpSessionSigs = await litNodeClient.getPkpSessionSigs({
        pkpPublicKey: pkp.publicKey,
        authMethods: [authMethod],
        expiration,
        resourceAbilityRequests: [
          {
            resource: new LitPKPResource("*"),
            ability: LitAbility.PKPSigning,
          },
          {
            resource: new LitActionResource("*"),
            ability: LitAbility.LitActionExecution,
          },
        ],
      });

      console.log(pkpSessionSigs);

      setSessionSigs(pkpSessionSigs);
      return pkpSessionSigs;
    } catch (err) {
      console.error("Error in getSessionSigs", err);
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error("An unknown error occurred in getSessionSigs"));
      }
      return null;
    } finally {
      setLoading(false);
    }
  }

  return {
    getSessionSigs,
    sessionSigs,
    loading,
    error,
  };
}
