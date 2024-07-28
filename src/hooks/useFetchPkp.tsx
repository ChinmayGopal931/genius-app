import { useState } from "react";
import { AuthMethod, IRelayPKP } from "@lit-protocol/types";
import { getPKPs, mintPKP } from "@/services/helper";

export default function useFetchPkp() {
  const [accounts, setAccounts] = useState<IRelayPKP[]>([]);
  const [currentAccount, setCurrentAccount] = useState<IRelayPKP | undefined>(
    undefined
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  async function fetchAccounts(authMethod: AuthMethod): Promise<IRelayPKP[]> {
    setLoading(true);
    setError(undefined);
    try {
      const myPKPs = await getPKPs(authMethod);
      console.log("fetchAccounts pkps: ", myPKPs);
      setAccounts(myPKPs);

      if (myPKPs.length === 1) {
        setCurrentAccount(myPKPs[0]);
      }

      return myPKPs;
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error("Unknown error occurred in fetchAccounts"));
      }
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function createAccount(
    authMethod: AuthMethod
  ): Promise<IRelayPKP | undefined> {
    setLoading(true);
    setError(undefined);
    try {
      const newPKP = await mintPKP(authMethod);
      console.log("createAccount pkp: ", newPKP);
      setAccounts((prev) => [...prev, newPKP]);
      setCurrentAccount(newPKP);
      return newPKP;
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error("Unknown error in createAccount"));
      }
      return undefined;
    } finally {
      setLoading(false);
    }
  }

  return {
    fetchAccounts,
    createAccount,
    setCurrentAccount,
    accounts,
    currentAccount,
    loading,
    error,
  };
}
