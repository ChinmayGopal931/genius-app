import { useCallback, useState } from "react";
import { AuthMethod } from "@lit-protocol/types";
import { LitAbility, LitActionResource } from "@lit-protocol/auth-helpers";
import { IRelayPKP } from "@lit-protocol/types";
import { SessionSigs } from "@lit-protocol/types";
import { litNodeClient } from "@/services/helper";
import { LitPKPResource } from "@lit-protocol/auth-helpers";

export default function useFetchSession() {
  const [sessionSigs, setSessionSigs] = useState<SessionSigs>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>();

  const initSession = useCallback(
    async (authMethod: AuthMethod, pkp: IRelayPKP): Promise<void> => {
      setLoading(true);
      setError(undefined);
      try {
        const expiration = new Date(
          Date.now() + 1000 * 60 * 60 * 24 * 7
        ).toISOString();

        await litNodeClient.connect();

        if (!litNodeClient.ready) throw "litNodeClient not ready";

        const sessionSigs = await litNodeClient.getPkpSessionSigs({
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

        setSessionSigs(sessionSigs);
      } catch (err) {
        if (err instanceof Error) {
          setError(err);
        } else {
          setError(new Error("an unknown error in initSession"));
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    initSession,
    sessionSigs,
    loading,
    error,
  };
}
