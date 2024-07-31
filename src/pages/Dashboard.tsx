import React, { useEffect, useState } from "react";
import { PageHeader, PageHeaderHeading } from "@/components/shadcn/page-header";
import { Button } from "@/components/shadcn/button";

import { IRelayPKP } from "@lit-protocol/types";
import { ORIGIN, signInWithGoogle } from "@/services/helper";
import { AuthMethodType } from "@lit-protocol/constants";

import useGenerateOAuth from "@/hooks/useGenerateOAuth";
import useFetchPKp from "@/hooks/useFetchPkp";
import useFetchSession from "@/hooks/useFetchSession";
import LimitOrderSDK from "@/components/LimitOrderSdx";
import LimitOrderForm from "@/components/ui/LimitOrder";

export default function Dashboard() {
  const [isCreatingPKP, setIsCreatingPKP] = useState(false);
  const [pkpInfo, setPkpInfo] = useState<IRelayPKP | null>(null);

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
            : "Create or Load Lit PKP with Google Account"}
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

        {currentAccount && sessionSigs && (
          <LimitOrderSDK pkpInfo={pkpInfo} sessionSigs={sessionSigs} />
        )}
      </div>
    </div>
  );
}
