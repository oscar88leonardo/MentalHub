"use client"
import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ConnectEmbed, useActiveWallet } from "thirdweb/react";
import { client } from "@/lib/client";
import { myChain } from "@/config/chain";
import { 
  inAppWallet,
  createWallet,
} from "thirdweb/wallets";

const walletsThirdweb = [
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
    /*executionMode: {
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

export default function LoginPage() {
  const activeWallet = useActiveWallet();
  const account = activeWallet ? activeWallet.getAccount() : null;
  const router = useRouter();

  // Efecto para redirigir cuando el wallet esté conectado (NO esperar a Ceramic)
  useEffect(() => {
    if (account) {
      console.log("✅ Wallet conectado, redirigiendo a dashboard...");
      console.log("Ceramic se autenticará solo cuando sea necesario (al editar perfil)");
      router.push('/dashboard');
    }
  }, [account, router]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #6666ff 0%, #4d4dcc 50%, #339999 100%)',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      <div className="max-w-md w-full">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <Image
              src="/innerverse-logo.png" 
              alt="Innerverse Logo" 
              width={80}
              height={80}
              className="mx-auto"
              style={{ objectFit: 'contain' }}
            />
          </div>
          <h1 
            className="text-4xl font-bold text-white mb-3"
            style={{ 
              fontWeight: '800',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Bienvenido a Innerverse
          </h1>
          <p 
            className="text-white/90 text-lg font-medium"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
          >
            Tu espacio de bienestar mental
          </p>
        </div>

        {/* Card contenedor del ConnectEmbed */}
        <div 
          className="bg-white rounded-2xl shadow-2xl p-8"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="text-center mb-6">
            <h2 
              className="text-2xl font-bold mb-2"
              style={{ 
                color: '#3e4555',
                fontWeight: '700'
              }}
            >
              Iniciar Sesión
            </h2>
            <p 
              className="font-medium"
              style={{ color: '#8d97ad' }}
            >
              Elige tu método de conexión preferido
            </p>
          </div>

          {/* ConnectEmbed de thirdweb */}
          <div className="flex justify-center mb-6">
            <ConnectEmbed
              client={client}
              wallets={walletsThirdweb}
              accountAbstraction={{
                chain: myChain,
                sponsorGas: true, 
              }}
              auth={{
                isLoggedIn: async () => {
                  return !!account;
                },
                doLogin: async () => {
                  console.log("logging in!");
                },
                getLoginPayload: async () => ({
                  address: "0x0000000000000000000000000000000000000000",
                  chain_id: "0x1",
                  domain: "dummy",
                  uri: "https://dummy.com",
                  version: "1",
                  nonce: "0",
                  issued_at: new Date().toISOString(),
                  expiration_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                  invalid_before: new Date().toISOString(),
                  statement: "Sign in to Innerverse",
                  resources: [],
                }),
                doLogout: async () => {
                  console.log("logging out!");
                },
              }}
              theme="light"
              className="w-full"
            />
          </div>

          {/* Enlaces adicionales */}
          <div 
            className="pt-6 border-t"
            style={{ borderColor: 'rgba(120, 130, 140, 0.13)' }}
          >
            <div className="text-center">
              <Link 
                href="/" 
                className="inline-flex items-center text-sm font-medium transition-colors"
                style={{ 
                  color: '#6666ff',
                  textDecoration: 'none'
                }}
              >
                ← Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
