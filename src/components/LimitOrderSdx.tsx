import React, { useState } from "react";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { useToast } from "@/components/ui/use-toast";
import { SessionSigs, IRelayPKP } from "@lit-protocol/types";
import { litNodeClient } from "@/services/helper";
import { ethers } from "ethers";

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

  console.log(
    pkpInfo,
    ethers.utils.arrayify(
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Hello World"))
    )
  );

  const litActionCode = `
  const signEcdsa = async () => {
    const message = ethers.utils.arrayify(
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Hello"))
      );

      console.log(message)
    
    const resp = await Lit.Actions.call({
      ipfsId: "QmRwN9GKHvCn4Vk7biqtr6adjXMs7PzzYPCzNCRjPFiDjm",
      params: {
        toSign: message,
        publicKey: "0x04956252b502dd0b8821bf1a9249e17403f375a976ef4a32c9fc4addcbe1b3330db7160034e93f458ba2fadc6bb7acadc18de3a4c90121f67f42e9515a6d5b8619",
        sigName: "childSig"
      }
    });
    };
  
      signEcdsa();
 
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
        // const sigShare = await LitActions.signEcdsa({
        //   toSign: message,
        //   publicKey,
        //   sigName: "sig1",
        // });
        console.log(sessionSigs);
        const executionResult = await litNodeClient.executeJs({
          code: litActionCode,
          sessionSigs,
          jsParams: {
            functionToRun: "signEcdsa",
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
        <Button onClick={submitLimitOrder}>Submit Test signEcdsa</Button>
      </div>
    </div>
  );
};

export default LimitOrderSDK;
