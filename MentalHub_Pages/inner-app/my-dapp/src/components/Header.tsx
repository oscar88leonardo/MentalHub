"use client"
import React from "react";
import Image from "next/image";
import { useActiveWallet } from "thirdweb/react";
import { useCeramic } from "@/context/CeramicContext";

interface HeaderProps {
  title: string;
  subtitle: string;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, onLogout }) => {
  const activeWallet = useActiveWallet();
  const account = activeWallet ? activeWallet.getAccount() : null;
  const { isConnected: isCeramicConnected, isLoading } = useCeramic();

  return (
    <div 
      className="shadow-sm border-b"
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Image
              src="/innerverse-logo.png"
              alt="Innerverse Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <div>
              <h1 
                className="text-2xl font-bold text-white"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
              >
                {title}
              </h1>
              <p 
                className="text-white/90"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
              >
                {subtitle}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Estado de conexión */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                isCeramicConnected ? 'bg-green-400' : 
                isLoading ? 'bg-yellow-400' : 'bg-red-400'
              }`}></div>
              <span 
                className="text-sm text-white font-medium"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
              >
                {isCeramicConnected ? 'Ceramic Conectado ✅' : 
                 isLoading ? 'Conectando...' : 'Ceramic Desconectado ❌'}
              </span>
            </div>
            
            {/* Información de wallet */}
            {account && (
              <div 
                className="rounded-lg px-4 py-2"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <p className="text-xs text-white/70 font-medium">Wallet</p>
                <p className="text-sm font-mono text-white font-semibold">
                  {account.address.slice(0, 6)}...{account.address.slice(-4)}
                </p>
              </div>
            )}
            
            {/* Botón de logout */}
            <button
              onClick={onLogout}
              className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center space-x-2 shadow-lg font-medium"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;