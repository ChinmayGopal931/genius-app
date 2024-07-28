import { http, createConfig } from "wagmi";
import { mainnet, sepolia, baseSepolia, base, anvil } from "wagmi/chains";
import { createPublicClient } from "viem";

export const config = createConfig({
  chains: [baseSepolia, sepolia, anvil],
  transports: {
    [baseSepolia.id]: http(),
    [sepolia.id]: http(),
    [anvil.id]: http(),
  },
});

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

interface AddressConfig {
  holdingContract: `0x${string}`;
  GeniusOpenTradevault: `0x${string}`;
  USDC: `0x${string}`;
  stUSD: `0x${string}`;
  OPENTRADE_POOL: `0x${string}`;
  HOLDING_MULTI: `0x${string}`;
  holdingContractHistory: `0x${string}`;
}

export const addresses: { [chainId: number]: AddressConfig } = {
  11155111: {
    holdingContract: "0x96b6f5D1b093757775B3AC431E792699D0df4c66",
    GeniusOpenTradevault: "0x43eA61E9a702FF9375E3BE4644582FDb64720Ece",
    USDC: "0xfd4f11A2aaE86165050688c85eC9ED6210C427A9",
    stUSD: "0x43eA61E9a702FF9375E3BE4644582FDb64720Ece",
    OPENTRADE_POOL: "0xf8A98eC5Aef19bd62843e81f6e9911483b5fbe53",
    HOLDING_MULTI: "0x85a0caEC3E7f49BC76c92540312C11dEa3D75474",
    holdingContractHistory: "0x8f07E1c56781b5ef3BF752F7De167e4BF6E7d5Dc",
  },
  84532: {
    holdingContract: "0xNewAddressForBase",
    GeniusOpenTradevault: "0xNewAddressForBase",
    USDC: "0xNewAddressForBase",
    stUSD: "0xNewAddressForBase",
    OPENTRADE_POOL: "0xNewAddressForBase",
    HOLDING_MULTI: "0xNewAddressForBase",
    holdingContractHistory: "0xNewAddressForBase",
  },
  31337: {
    holdingContract: "0xNewAddressForAnvil",
    GeniusOpenTradevault: "0xNewAddressForAnvil",
    USDC: "0xNewAddressForAnvil",
    stUSD: "0xNewAddressForAnvil",
    OPENTRADE_POOL: "0xNewAddressForAnvil",
    HOLDING_MULTI: "0xNewAddressForAnvil",
    holdingContractHistory: "0xNewAddressForAnvil",
  },
};
const defaultChainId = 11155111; // Default to Sepolia as the fallback chain ID.

export function getAddressConfig(chainId?: number): AddressConfig {
  const config = addresses[chainId ?? defaultChainId];
  if (!config) {
    console.error(`Invalid chainId: ${chainId}`);
    return addresses[defaultChainId]; // Fallback to default if invalid chainId
  }
  return config;
}
