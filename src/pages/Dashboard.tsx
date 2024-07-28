import React, { useEffect, useState } from "react";
import { PageHeader, PageHeaderHeading } from "@/components/shadcn/page-header";
import { Button } from "@/components/shadcn/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { AuthMethod, IRelayPKP, SessionSigs } from "@lit-protocol/types";
import LimitOrderForm from "@/components/ui/LimitOrder";
import {
  REDIRECT_URI,
  handleRedirect,
  signInWithGoogle,
  getPKPs,
  mintPKP,
  ORIGIN,
  authNeededCallback,
  getSessionSigs,
} from "@/services/helper";
import { LitAbility, LitActionResource } from "@lit-protocol/auth-helpers";
import { AuthMethodType } from "@lit-protocol/constants";

import { isSignInRedirect } from "@lit-protocol/lit-auth-client";
import useGenerateOAuth from "@/hooks/useGenerateOAuth";
import useFetchSessionSignatures from "@/hooks/useFetchSessionSignatures";
import useFetchPKp from "@/hooks/useFetchPkp";

export type LoadingState = "auth" | "accounts" | "session" | null;
export const loadingCopyMap: Record<NonNullable<LoadingState>, string> = {
  auth: "Authenticating your credentials...",
  accounts: "Creating your account...",
  session: "Securing your session...",
};

export default function Dashboard() {
  const [isCreatingPKP, setIsCreatingPKP] = useState(false);
  const [pkpInfo, setPkpInfo] = useState<IRelayPKP | null>(null);
  // const [sessionSigs, setSessionSigs] = useState<SessionSigs | null>(null);

  const { toast } = useToast();

  const navigate = useNavigate();

  useEffect(() => {
    checkAndCompleteAuth();
  }, []);

  async function checkAndCompleteAuth() {
    try {
      if (isSignInRedirect(REDIRECT_URI)) {
        const authMethod = await handleRedirect();
        if (authMethod) {
          await handlePKP(authMethod);
          navigate(window.location.pathname, { replace: false });
        }
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      toast({
        title: "Error checking authentication",
        description: "Please try signing in again.",
        variant: "destructive",
      });
    }
  }

  async function handlePKP(authMethod: AuthMethod) {
    setIsCreatingPKP(true);
    try {
      const existingPKPs = await getPKPs(authMethod);

      let pkp;
      if (existingPKPs.length > 0) {
        pkp = existingPKPs[0];
        setPkpInfo(pkp);
        toast({
          title: "Existing PKP found and loaded!",
        });
      } else {
        pkp = await mintPKP(authMethod);
        setPkpInfo(pkp);
        toast({
          title: "New PKP created successfully!",
        });
      }

      const chain = "sepolia";
      const expiration = new Date(
        Date.now() + 1000 * 60 * 60 * 24 * 7
      ).toISOString();

      const sigs = await getSessionSigs({
        pkpPublicKey: pkp.publicKey,
        authMethod,
        sessionSigsParams: {
          chain,
          expiration,
          resourceAbilityRequests: [
            {
              resource: new LitActionResource("*"),
              ability: LitAbility.PKPSigning,
            },
          ],
          authNeededCallback: authNeededCallback,
        },
      });

      //setSessionSigs(sigs);
      toast({
        title: "Session created successfully!",
      });
    } catch (error) {
      console.error("Error handling PKP:", error);
      toast({
        title: "Failed to handle PKP or create session",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingPKP(false);
    }
  }

  async function authWithGoogle() {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error during Google auth:", error);
      toast({
        title: "Failed to authenticate with Google",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  }
  const redirectUri = ORIGIN;

  const {
    sessionSigs,
    loading: sessionLoading,
    error: sessionError,
  } = useFetchSessionSignatures();

  const {
    authMethod,
    loading: authLoading,
    error: authError,
  } = useGenerateOAuth(redirectUri);

  const {
    createAccount,
    currentAccount,
    loading: accountsLoading,
    error: accountsError,
  } = useFetchPKp();

  console.log(sessionSigs, authMethod, currentAccount);

  useEffect(() => {
    if (authMethod) {
      navigate(window.location.pathname, { replace: true });
      console.log("authMethod: ", authMethod);
      createAccount(authMethod);
    }
  }, [authMethod, createAccount]);

  // useEffect(() => {
  //   if (authMethod && currentAccount) {
  //     initSession(authMethod, currentAccount);
  //   }
  // }, [authMethod, currentAccount, initSession]);

  console.log(sessionSigs);

  return (
    <div>
      <div className="flex flex-col py-1">
        <div className="flex p-4 gap-5" style={{ cursor: "pointer" }}>
          <PageHeader className="flex justify-left text-2xl">
            <PageHeaderHeading style={{ fontSize: "40" }}>
              Dashboard
            </PageHeaderHeading>
          </PageHeader>
        </div>

        <Button onClick={signInWithGoogle} disabled={isCreatingPKP}>
          {isCreatingPKP
            ? "Processing..."
            : "Create or Load Lit PKP / Ethereum Wallet with Google Account"}
        </Button>

        {pkpInfo && (
          <div className="mt-4">
            <h3>PKP Information:</h3>
            <p>Public Key: {pkpInfo.publicKey}</p>
            <p>Ethereum Address: {pkpInfo.ethAddress}</p>
          </div>
        )}

        {sessionSigs && (
          <div className="mt-4">
            <h3>Session Created Successfully!</h3>
            <p>You can now use this session for authenticated operations.</p>
          </div>
        )}

        {currentAccount && sessionSigs && (
          <LimitOrderForm pkpInfo={pkpInfo} sessionSigs={sessionSigs} />
        )}
      </div>
    </div>
  );
}
