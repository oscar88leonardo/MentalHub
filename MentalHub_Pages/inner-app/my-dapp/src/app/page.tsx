"use client"
import { useEffect } from "react";
import { useActiveWallet } from "thirdweb/react";

export default function Home() {
  const activeWallet = useActiveWallet();
  const account = activeWallet ? activeWallet.getAccount() : null;

  useEffect(() => {
    // Redirigir al dashboard si ya está autenticado, sino al login
    if (account) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/login';
    }
  }, [account]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando...</p>
      </div>
    </div>
  );
}
