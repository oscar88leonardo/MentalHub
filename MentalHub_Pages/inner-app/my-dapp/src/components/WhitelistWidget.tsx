"use client";
import React, { useEffect, useState } from "react";
// import { TransactionButton } from "thirdweb/react";
import { getContract, prepareContractCall, resolveMethod, sendTransaction } from "thirdweb";
import { client } from "@/lib/client";
import { myChain } from "@/config/chain";
import { contracts } from "@/config/contracts";
import { abi } from "@/abicontracts/whitelist";
import { useActiveWallet, useReadContract } from "thirdweb/react";
import Header from "./Header";

interface WhitelistWidgetProps {
  onLogout?: () => Promise<void> | void;
}


export default function WhitelistWidget({ onLogout }: WhitelistWidgetProps) {
  const activeWallet = useActiveWallet();
  const account = activeWallet ? activeWallet.getAccount() : null;
  
  // Estados para manejar el estado de la whitelist
  const [joinedWhitelist, setJoinedWhitelist] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'error' | 'success' | 'info' } | null>(null);

  // Crear instancia del contrato whitelist
  const contract = getContract({
    client: client!,
    chain: myChain,
    address: contracts.whitelist,
    abi: abi as [],
  });

  // Hook para leer si la dirección está en la whitelist
  const { data: isWhitelisted, isLoading: isCheckingWhitelist } = useReadContract({
    contract,
    method: "whitelistedAddresses",
    params: [account?.address || ""],
  });

  // Hook para leer el número de direcciones en la whitelist
  const { data: numberOfWhitelistedData, isLoading: isLoadingNumber } = useReadContract({
    contract,
    method: "numAddressesWhitelisted",
    params: [],
  });

  // Hook para leer el máximo de direcciones permitidas
  const { data: maxWhitelistedData } = useReadContract({
    contract,
    method: "maxWhitelistedAddresses",
    params: [],
  });

  // Efecto para actualizar el estado cuando cambie isWhitelisted
  useEffect(() => {
    if (isWhitelisted !== undefined) {
      console.log("iswhitelisted?", isWhitelisted);
      setJoinedWhitelist(Boolean(isWhitelisted));
    }
  }, [isWhitelisted]);

  // Función para mostrar toast
  const showToast = (text: string, type: 'error' | 'success' | 'info' = 'info') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Detectar cuenta conectada
  useEffect(() => {
    if (account != null) {
      console.log("account connected:", account);
    }
  }, [account]);

  /**
   * Función para agregar la dirección actual a la whitelist
   */
  const addAddressToWhitelist = async () => {
    try {
      setLoading(true);
      
      // Verificar si hay una wallet conectada
      if (!activeWallet || !account) {
        showToast('No hay wallet conectada', 'error');
        setLoading(false);
        return;
      }

      // Preparar transacción usando ThirdWeb
      const tx = prepareContractCall({
        contract,
        method: resolveMethod("addAddressToWhitelist"),
        params: [],
      });

      // Enviar la transacción
      await sendTransaction({ account, transaction: tx });
      
      console.log("Transaction sent successfully");
      showToast('¡Te has unido a la whitelist exitosamente!', 'success');
      setJoinedWhitelist(true);
      
    } catch (error) {
      console.error("Error adding address to whitelist:", error);
      showToast(String(error), 'error');
    } finally {
      setLoading(false);
    }       
  };

  /**
   * Renderizar el contador de whitelist
   */
  const renderWhitelistCount = () => {
    if (isLoadingNumber) {
      return "...";
    }
    return numberOfWhitelistedData ? Number(numberOfWhitelistedData) : 0;
  };

  /**
   * Renderizar el botón basado en el estado de la dapp
   */
  const renderButton = () => {
    if (account != null) {
      if (isCheckingWhitelist) {
        return (
          <div className="text-white/80 text-sm">
            Verificando whitelist...
          </div>
        );
      }
      if (joinedWhitelist) {
        return (
          <div className="text-white/90 text-sm">
            ¡Gracias por unirte a la Whitelist!
          </div>
        );
      } else {
        return (
          <button
            onClick={addAddressToWhitelist}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md bg-white/20 px-6 py-3 text-white hover:bg-white/30 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Procesando...
              </span>
            ) : (
              "Unirse a la Whitelist"
            )}
          </button>
        );
      }
    } else {
      return (
        <div className="text-white/80 text-sm">
          Conecta tu wallet para unirte a la whitelist
        </div>
      );
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header fijo */}
      <Header
        title="Whitelist"
        subtitle="Whitelist de la comunidad"
        onLogout={(onLogout as any) || (() => {})}
      />
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div
            className="rounded-2xl p-6 text-white mb-8 shadow-2xl"
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Whitelist Mental Hub</h1>
                <p className="text-white/80">Bienvenido a la whitelist</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-white/90 text-lg leading-relaxed">
                Colecciones NFT para ayudar con tu salud mental <br />
                Proporcionadas por los mejores profesionales de la salud.
              </p>
              
              <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                <div className="text-white/90 text-sm">
                  <span className="font-semibold">{renderWhitelistCount()}</span> direcciones ya se han unido a la Whitelist.
                  {maxWhitelistedData && (
                    <span className="ml-2 text-white/70">
                      (Máximo: {Number(maxWhitelistedData)})
                    </span>
                  )}
                </div>
              </div>
              
              <div className="pt-4">
                {renderButton()}
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div
            className="rounded-2xl p-6 text-white shadow-2xl"
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            <h3 className="text-xl font-semibold mb-4">Información del Contrato</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-white/70">Dirección del contrato:</span>
                <span className="text-white/90 ml-2 font-mono">{contracts.whitelist}</span>
              </div>
              <div>
                <span className="text-white/70">Red:</span>
                <span className="text-white/90 ml-2">{myChain.name}</span>
              </div>
              <div>
                <span className="text-white/70">Estado de tu dirección:</span>
                <span className={`ml-2 font-semibold ${
                  isCheckingWhitelist 
                    ? "text-yellow-300" 
                    : joinedWhitelist 
                      ? "text-green-300" 
                      : "text-red-300"
                }`}>
                  {isCheckingWhitelist 
                    ? "Verificando..." 
                    : joinedWhitelist 
                      ? "En la whitelist" 
                      : "No está en la whitelist"
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast notifications */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-lg shadow"
          style={{
            background: toast.type === 'error'
              ? 'rgba(220,38,38,0.95)'
              : (toast.type === 'success' ? 'rgba(16,185,129,0.95)' : 'rgba(55,65,81,0.95)'),
            color: '#fff'
          }}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}
