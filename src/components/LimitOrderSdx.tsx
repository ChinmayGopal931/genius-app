import React, { useState } from "react";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { useToast } from "@/components/ui/use-toast";
import { SessionSigs, IRelayPKP } from "@lit-protocol/types";
import { litNodeClient } from "@/services/helper";

interface LimitOrderFormProps {
  pkpInfo: IRelayPKP | null;
  sessionSigs: SessionSigs | null;
}

const LimitOrderSDK: React.FC<LimitOrderFormProps> = ({
  pkpInfo,
  sessionSigs,
}) => {
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const { toast } = useToast();

  const litActionCode = `
  const signEcdsa = async () => {
    // this Lit Action simply requests an ECDSA signature share from the Lit Node
    const message = new Uint8Array(
      await crypto.subtle.digest('SHA-256', new TextEncoder().encode('Hello world'))
    );
    const resp = await Lit.Actions.call({
      ipfsId: "QmRwN9GKHvCn4Vk7biqtr6adjXMs7PzzYPCzNCRjPFiDjm",
      params: {
        // this is the string "Hello World" for testing
        toSign: message,
        publicKey: pkpInfo.publicKey,
        sigName: "childSig",
      },
    });
  
    console.log("results: ", resp);
  };
  
  if (functionToRun === "signEcdsa") {
    signEcdsa();
  }
  `;

  const submitLimitOrder = async () => {
    if (!pkpInfo || !sessionSigs) {
      toast({
        title: "Cannot submit limit order",
        description: "PKP or session not available",
        variant: "destructive",
      });
      return;
    }

    await litNodeClient.connect().then(async () => {
      try {
        const executionResult = await litNodeClient.executeJs({
          code: litActionCode,
          sessionSigs,
          jsParams: {
            authSig: {
              sig: "d812be0b5c321c242f0a1a091b3067f34c95a525b4af4056b8b18d79f027fa9fa325d215dc7e572a92ad9c55f6c80a01aba3e6cb62832e7f4cae80d366a2ed0f",
              derivedVia: "web3.eth.personal.sign",
              signedMessage:
                "localhost wants you to sign in with your Ethereum account:\0x9B4063C5C44882A79dA4e15943D17dcF17af2E1B\n\nThis is a key for Partiful\n\nURI: https://localhost/login\nVersion: 1\nChain ID: 1\nNonce: 1LF00rraLO4f7ZSIt\nIssued At: 2022-06-03T05:59:09.959Z",
              address: "0x9B4063C5C44882A79dA4e15943D17dcF17af2E1B",
            },
            chain: "ethereum",
          },
        });

        console.log("Execution result:", executionResult);
      } catch (error) {
        console.error("Error submitting limit order:", error);
        toast({
          title: "Failed to submit limit order",
          description: "Please try again",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Create Limit Order</h3>
      <div className="space-y-4">
        <Button
          onClick={submitLimitOrder}
          disabled={!amount || !price || !pkpInfo || !sessionSigs}
        >
          Submit Test signEcdsa
        </Button>
      </div>
    </div>
  );
};

export default LimitOrderSDK;
