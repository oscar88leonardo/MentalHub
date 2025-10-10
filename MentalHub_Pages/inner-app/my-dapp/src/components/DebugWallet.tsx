"use client"
import React from "react";
import { useActiveWallet, useAdminWallet } from "thirdweb/react";
import { useCeramic } from "@/context/CeramicContext";

const DebugWallet: React.FC = () => {
  const activeWallet = useActiveWallet();
  const adminWallet = useAdminWallet();
  const account = activeWallet ? activeWallet.getAccount() : null;
  const adminAccount = adminWallet ? adminWallet.getAccount() : null;
  const { isConnected, hasPersistedSession } = useCeramic();

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 m-4">
      <h3 className="text-lg font-semibold text-purple-800 mb-2">🔍 Debug Wallet State</h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-center space-x-2">
          <span className="text-gray-700 font-medium">Active Wallet:</span>
          <span className={activeWallet ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
            {activeWallet ? `✅ ${activeWallet.id}` : '❌ No disponible'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-700 font-medium">Account:</span>
          <span className={account ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
            {account ? `✅ ${account.address.slice(0, 6)}...` : '❌ No disponible'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-700 font-medium">Admin Wallet:</span>
          <span className={adminWallet ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
            {adminWallet ? `✅ ${adminWallet.id}` : '❌ No disponible'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-700 font-medium">Admin Account:</span>
          <span className={adminAccount ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
            {adminAccount ? `✅ ${adminAccount.address.slice(0, 6)}...` : '❌ No disponible'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-700 font-medium">Ceramic:</span>
          <span className={isConnected ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
            {isConnected ? '✅ Conectado' : '❌ Desconectado'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-700 font-medium">Sesión Persistida:</span>
          <span className={hasPersistedSession ? 'text-green-600 font-semibold' : 'text-orange-600 font-semibold'}>
            {hasPersistedSession ? '✅ Restaurada' : '⚠️ Nueva'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DebugWallet;
