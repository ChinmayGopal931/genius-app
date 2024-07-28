// LimitOrderForm.tsx
import React, { useState } from "react";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { useToast } from "@/components/ui/use-toast";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { IRelayPKP, SessionSigs } from "@lit-protocol/types";
import { ethers } from "ethers";

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
      // Ensure the required parameters are passed
      if (!calldata || !to || !value) {
        throw new Error("Missing required parameters");
      }

      // Sign the transaction
      const sigShare = await LitActions.signEcdsa({ 
        toSign: calldata,
        publicKey,
        sigName: "sig1"
      });

      // Construct the transaction object
      const tx = {
        to: to,
        data: calldata,
        value: value,
        gasLimit: gasLimit || "300000", // You might want to estimate this
        gasPrice: gasPrice || await Lit.Actions.getGasPrice({ chain: 'ethereum' }),
      };

      // Send the transaction
      const response = await eth.sendTransaction(tx);

      // Return the transaction hash
      return { txHash: response.hash };
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

      const litNodeClient = new LitNodeClient({ litNetwork: "datil-dev" });
      await litNodeClient.connect();

      const results = await litNodeClient.executeJs({
        code: litActionCode,
        sessionSigs: sessionSigs,
        jsParams: {
          calldata: calldata,
          to: SWAP_ROUTER_ADDRESS,
          value: amountIn.toString(), // We're swapping ETH, so we need to send the value
          publicKey: pkpInfo.publicKey,
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
