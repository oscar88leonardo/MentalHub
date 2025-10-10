"use client"
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useActiveWallet } from "thirdweb/react";
import Sidebar from "@/components/Sidebar";
import DashboardContent from "@/components/DashboardContent";
import ProfilePage from "@/components/ProfilePage";

export default function DashboardPage() {
  const activeWallet = useActiveWallet();
  const account = activeWallet ? activeWallet.getAccount() : null;
  const [activeItem, setActiveItem] = useState('dashboard');
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Desconectar la billetera usando Thirdweb
      if (activeWallet) {
        await activeWallet.disconnect();
      }
      
      // Limpiar storage local
      sessionStorage.clear();
      localStorage.clear();
      
      // Redirigir al login después de desconectar
      router.push('/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      // Redirigir de todas formas si hay error
      router.push('/login');
    }
  };

  const handleItemClick = (item: string) => {
    setActiveItem(item);
  };

  const renderContent = () => {
    switch (activeItem) {
      case 'profile':
        return <ProfilePage onLogout={handleLogout} />;
      case 'dashboard':
      default:
        return <DashboardContent onLogout={handleLogout} />;
    }
  };

  return (
    <div 
      className="flex h-screen overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #6666ff 0%, #4d4dcc 50%, #339999 100%)',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Sidebar fijo */}
      <div className="flex-shrink-0">
        <Sidebar activeItem={activeItem} onItemClick={handleItemClick} />
      </div>
      
      {/* Área de contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
}
