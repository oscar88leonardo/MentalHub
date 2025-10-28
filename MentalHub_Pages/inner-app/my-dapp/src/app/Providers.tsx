"use client"
import React from "react";
import { ThirdwebProvider, AutoConnect } from "thirdweb/react";
import { client } from "@/lib/client";
import { myChain } from "@/config/chain";
import { inAppWallet, createWallet } from "thirdweb/wallets";

const wallets = [
  inAppWallet({
    auth: {
      options: [
        "google",
        "discord",
        "telegram",
        "farcaster",
        "email",
        "x",
        "passkey",
        "phone",
      ],
    },
    /*// Habilitar sponsor de gas (EIP-7702) en la in-app wallet
    executionMode: {
      mode: "EIP7702",
      sponsorGas: true,
    },*/
  }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("io.rabby"),
  createWallet("io.zerion.wallet"),
];

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThirdwebProvider>
      <AutoConnect
        client={client}
        wallets={wallets}
        accountAbstraction={{ chain: myChain, sponsorGas: true }}
      />
      {children}
    </ThirdwebProvider>
  );
}


