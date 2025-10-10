"use client"
import React, { useContext, useEffect } from "react";
import { ConnectEmbed, useActiveWallet } from "thirdweb/react";
import { client as clientThirdweb } from "../../innerComp/client";
import { myChain } from "../../innerComp/myChain";
import { AppContext } from "../../context/AppContext";
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
  
  // get global data from Appcontext
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error("useContext must be used within a provider");
  }
  const { isConComposeDB } = context;

  // Efecto para redirigir si ya está autenticado
  useEffect(() => {
    if (account && isConComposeDB) {
      console.log("Usuario ya autenticado, redirigiendo a perfil...");
      window.location.href = '/profile';
    }
  }, [account, isConComposeDB]);

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
            <img 
              src="/innerverse-logo.png" 
              alt="Innerverse Logo" 
              className="h-20 mx-auto"
              onError={(e) => {
                e.currentTarget.src = "/innerverse-logo.png";
                e.currentTarget.onerror = () => {
                  e.currentTarget.style.display = 'none';
                };
              }}
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

          {/* ConnectEmbed de thirdweb - CONFIGURACIÓN IDÉNTICA A MENU.TSX */}
          <div className="flex justify-center mb-6">
            <ConnectEmbed
              client={clientThirdweb}
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
                  statement: "Bienvenido a Innerverse - Tu espacio de bienestar mental",
                  resources: [],
                }),
                doLogout: async () => {
                  console.log("logging out!");
                  // NO llamar logout() aquí para evitar conflictos
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
              <a 
                href="/" 
                className="inline-flex items-center text-sm font-medium transition-colors"
                style={{ 
                  color: '#6666ff',
                  textDecoration: 'none'
                }}
              >
                ← Volver al inicio
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
