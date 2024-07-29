// LimitOrderForm.tsx
import React, { useState } from "react";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { useToast } from "@/components/ui/use-toast";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { IRelayPKP, SessionSigs } from "@lit-protocol/types";
import { ethers } from "ethers";
import { litNodeClient } from "@/services/helper";
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import fs from "fs";
import { serialize, recoverAddress } from "@ethersproject/transactions";
import {
  hexlify,
  splitSignature,
  hexZeroPad,
  joinSignature,
} from "@ethersproject/bytes";
import { recoverPublicKey, computePublicKey } from "@ethersproject/signing-key";

// You might want to move these to a constants file
const SWAP_ROUTER_ADDRESS = "0xE592427A0AEce92De3Edee1F18E0157C05861564"; // Uniswap V3 SwapRouter
const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

interface LimitOrderFormProps {
  pkpInfo: IRelayPKP | null;
  sessionSigs: SessionSigs | null;
}

const LimitOrderForm: React.FC<LimitOrderFormProps> = ({
  pkpInfo,
  sessionSigs,
}) => {
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const { toast } = useToast();

  const generateSwapCalldata = (
    tokenIn: string,
    tokenOut: string,
    fee: number,
    recipient: string,
    deadline: number,
    amountIn: string,
    amountOutMinimum: string
  ): string => {
    const swapRouter = new ethers.Contract(
      SWAP_ROUTER_ADDRESS,
      [
        "function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)",
      ],
      ethers.providers.getDefaultProvider()
    );
    return swapRouter.interface.encodeFunctionData("exactInputSingle", [
      {
        tokenIn,
        tokenOut,
        fee: fee,
        recipient,
        deadline,
        amountIn,
        amountOutMinimum,
        sqrtPriceLimitX96: 0,
      },
    ]);
  };

  const litActionCode = `
  const go = async () => {
    // Prepare the transaction parameters
    const txParams = {
      to: UNISWAP_ROUTER_ADDRESS,
      data: web3.eth.abi.encodeFunctionCall({
        name: 'swapExactTokensForTokens',
        type: 'function',
        inputs: [
          { type: 'uint256', name: 'amountIn' },
          { type: 'uint256', name: 'amountOutMin' },
          { type: 'address[]', name: 'path' },
          { type: 'address', name: 'to' },
          { type: 'uint256', name: 'deadline' }
        ]
      }, [amountIn, amountOutMin, path, to, deadline]),
      gasLimit: '300000', // Adjust as needed
      gasPrice: await web3.eth.getGasPrice(),
      nonce: await web3.eth.getTransactionCount(fromAddress),
      chainId: chainId // e.g., 1 for Ethereum mainnet
    };
  
    // Sign the transaction
    const toSign = ethers.utils.arrayify(ethers.utils.keccak256(ethers.utils.serializeTransaction(txParams)));
    const sigShare = await LitActions.signEcdsa({ toSign, publicKey, sigName: 'sig1' });
  
    // Return the transaction parameters and signature
    LitActions.setResponse({
      response: JSON.stringify({
        txParams,
        signature: sigShare
      })
    });
  };
  
  go();
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

    try {
      const amountIn = ethers.utils.parseEther(amount);
      const amountOutMinimum = ethers.utils.parseUnits(
        (Number(amount) * Number(price)).toString(),
        6
      );

      const calldata = generateSwapCalldata(
        WETH_ADDRESS,
        USDC_ADDRESS,
        3000, // 0.3% fee tier
        pkpInfo.ethAddress,
        Math.floor(Date.now() / 1000) + 3600, // Set deadline to 1 hour from now
        amountIn.toString(),
        amountOutMinimum.toString()
      );

      await litNodeClient.connect();

      if (!litNodeClient.ready) {
        toast({
          title: "Lit Node Client is not available",
          description: "PKP or session not available",
          variant: "destructive",
        });
        return;
      }

      const results = await litNodeClient.executeJs({
        code: litActionCode,
        sessionSigs: sessionSigs,
        jsParams: {
          calldata: calldata,
          to: SWAP_ROUTER_ADDRESS,
          value: amountIn.toString(), // We're swapping ETH, so we need to send the value
          publicKey: pkpInfo.publicKey,
          userAddress: "0x9B4063C5C44882A79dA4e15943D17dcF17af2E1B",
        },
      });

      const txHash = results.response;

      toast({
        title: "Limit order submitted",
        description: `Transaction hash: ${txHash}`,
      });
    } catch (error) {
      console.error("Error submitting limit order:", error);
      toast({
        title: "Failed to submit limit order",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Create Limit Order</h3>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700"
          >
            Amount (ETH)
          </label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter ETH amount"
          />
        </div>
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700"
          >
            Limit Price (USDC per ETH)
          </label>
          <Input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter limit price in USDC"
          />
        </div>
        <Button
          onClick={submitLimitOrder}
          disabled={!amount || !price || !pkpInfo || !sessionSigs}
        >
          Submit Limit Order
        </Button>
      </div>
    </div>
  );
};

export default LimitOrderForm;
