import { LitNodeClient } from "@lit-protocol/lit-node-client";
import {
  GoogleProvider,
  LitAuthClient,
  isSignInRedirect,
} from "@lit-protocol/lit-auth-client";
import {
  AuthMethodScope,
  AuthMethodType,
  ProviderType,
} from "@lit-protocol/constants";
import {
  AuthCallbackParams,
  AuthMethod,
  AuthSig,
  IRelayPKP,
  SessionSigs,
  GetSessionSigsProps,
} from "@lit-protocol/types";
import { ethers } from "ethers";
import {
  LitAbility,
  LitActionResource,
  createSiweMessageWithRecaps,
  LitPKPResource,
} from "@lit-protocol/auth-helpers";

export const DOMAIN = import.meta.env.VITE_DOMAIN || "localhost";
export const IS_PRODUCTION = import.meta.env.VITE_ENV === "production";
export const ORIGIN = IS_PRODUCTION
  ? `https://${DOMAIN}`
  : `http://${DOMAIN}:5173`;
export const REDIRECT_URI = `${ORIGIN}`;
export const WALLET =
  import.meta.env.YOUR_PRIVATE_KEY ||
  "0x0123456789012345678901234567890123456789012345678901234567890123";

export const litNodeClient = new LitNodeClient({
  alertWhenUnauthorized: false,
  litNetwork: "datil-dev",
  debug: true,
  rpcUrl: import.meta.env.VITE_RPC_URL,
});

export const litAuthClient = new LitAuthClient({
  litRelayConfig: {
    relayApiKey: import.meta.env.VITE_LIT_RELAY_API_KEY,
  },
  litNodeClient,
});

export async function handleRedirect() {
  if (isSignInRedirect(REDIRECT_URI)) {
    const provider = litAuthClient.initProvider(ProviderType.Google);

    if (!provider) {
      throw new Error("No Provider available");
    }

    try {
      const authMethodGoogle = await provider.authenticate();
      return authMethodGoogle;
    } catch (error) {
      console.error("Error during authentication:", error);
      throw error;
    }
  }
  return null;
}

export async function signInWithGoogle(): Promise<void> {
  const googleProvider = litAuthClient.initProvider(ProviderType.Google, {
    redirectUri: REDIRECT_URI,
  }) as GoogleProvider;
  await googleProvider.signIn();
}

export async function getPKPs(authMethod: AuthMethod): Promise<IRelayPKP[]> {
  const provider = litAuthClient.getProvider(ProviderType.Google);
  const allPKPs = await provider?.fetchPKPsThroughRelayer(authMethod);
  if (!allPKPs) {
    throw new Error("failed fetchPKPsThroughRelayer");
  }
  return allPKPs;
}

export async function mintPKP(authMethod: AuthMethod): Promise<IRelayPKP> {
  await litNodeClient.connect();
  if (!litNodeClient.ready) throw "litNodeClient not ready";

  const provider = litAuthClient.getProvider(ProviderType.Google);
  const options = {
    permittedAuthMethodScopes: [[AuthMethodScope.SignAnything]],
  };
  const txHash = await provider?.mintPKPThroughRelayer(authMethod, options);
  const response = await provider?.relay.pollRequestUntilTerminalState(
    txHash || ""
  );

  if (
    response?.status !== "Succeeded" ||
    !response.pkpTokenId ||
    !response.pkpPublicKey ||
    !response.pkpEthAddress
  ) {
    throw new Error("minting failed");
  }

  const newPKP: IRelayPKP = {
    tokenId: response.pkpTokenId,
    publicKey: response.pkpPublicKey,
    ethAddress: response.pkpEthAddress,
  };
  return newPKP;
}

export async function getSessionSigs({
  pkpPublicKey,
  authMethod,
  sessionSigsParams,
}: {
  pkpPublicKey: string;
  authMethod: AuthMethod;
  sessionSigsParams: GetSessionSigsProps;
}): Promise<SessionSigs> {
  await litNodeClient.connect();
  if (!litNodeClient.ready) throw "litNodeClient not ready";

  const sessionSigs = await litNodeClient.getPkpSessionSigs({
    pkpPublicKey: pkpPublicKey,
    authMethods: [authMethod],
    jsParams: {
      authNeededCallback: sessionSigsParams.authNeededCallback,
    },
    expiration: sessionSigsParams.expiration,
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

  return sessionSigs;
}

export const authNeededCallback = async ({
  uri,
  expiration,
  resourceAbilityRequests,
}: AuthCallbackParams) => {
  try {
    const wallet = new ethers.Wallet(WALLET);
    if (!uri) throw "Invliad URI";
    if (!expiration) throw "Invliad expiration";
    if (!resourceAbilityRequests) throw "Invliad resources";

    // Prepare the SIWE message for signing
    const toSign = await createSiweMessageWithRecaps({
      uri: uri,
      expiration: expiration,
      resources: resourceAbilityRequests,
      walletAddress: wallet.address,
      nonce: await litNodeClient.getLatestBlockhash(),
      litNodeClient: litNodeClient,
    });
    // Use the Ethereum wallet to sign the message, return the digital signature
    const signature = await wallet.signMessage(toSign);

    // Create an AuthSig using the derived signature, the message, and wallet address
    const authSig = {
      sig: signature,
      derivedVia: "web3.eth.personal.sign",
      signedMessage: toSign,
      address: wallet.address,
    };

    return authSig;
  } catch (error) {
    console.error("Error in authNeededCallback:", error);
    throw error;
  }
};
