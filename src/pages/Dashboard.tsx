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
import useFetchSessionSignatures from "@/hooks/useFetchSession";
import useFetchPKp from "@/hooks/useFetchPkp";
import useSession from "@/hooks/useFetchSession";
import useFetchSession from "@/hooks/useFetchSession";
import LimitOrderSDK from "@/components/LimitOrderSdx";

export default function Dashboard() {
  const [isCreatingPKP, setIsCreatingPKP] = useState(false);
  const [pkpInfo, setPkpInfo] = useState<IRelayPKP | null>(null);
  // const [sessionSigs, setSessionSigs] = useState<SessionSigs | null>(null);

  const redirectUri = ORIGIN;

  const {
    initSession,
    sessionSigs,
    loading: sessionLoading,
    error: sessionError,
  } = useFetchSession();

  const {
    authMethod,
    loading: authLoading,
    error: authError,
  } = useGenerateOAuth(redirectUri);

  const {
    createAccount,
    currentAccount,
    loading: accountsLoading,
  } = useFetchPKp();

  console.log(
    sessionSigs,
    authMethod,
    currentAccount,
    import.meta.env.VITE_LIT_RELAY_API_KEY,
    import.meta.env.VITE_RPC_URL
  );

  // useEffect(() => {
  //   if (authMethod && authMethod.authMethodType !== AuthMethodType.WebAuthn) {
  //     navigate(window.location.pathname, { replace: true });
  //     console.log("authMethod: ", authMethod);
  //     createAccount(authMethod);
  //   }
  // }, [authMethod, createAccount]);

  // useEffect(() => {
  //   if (authMethod && currentAccount) {
  //     initSession(authMethod, currentAccount);
  //   }
  // }, [authMethod, currentAccount, initSession]);

  useEffect(() => {
    if (
      authMethod &&
      authMethod.authMethodType !== AuthMethodType.WebAuthn &&
      !currentAccount &&
      !isLoading
    ) {
      createAccount(authMethod).then((account) => {
        if (account) {
          setPkpInfo(account);
          initSession(authMethod, account);
        }
      });
    }
  }, [authMethod, createAccount, currentAccount, initSession]);

  const isLoading =
    authLoading || accountsLoading || sessionLoading || isCreatingPKP;

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
          {isCreatingPKP || isLoading
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

        {/* {currentAccount && sessionSigs && (
          <LimitOrderForm pkpInfo={pkpInfo} sessionSigs={sessionSigs} />
        )} */}

        {currentAccount && sessionSigs && (
          <LimitOrderSDK pkpInfo={pkpInfo} sessionSigs={sessionSigs} />
        )}
      </div>
    </div>
  );
}
