"use client"
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useActiveWallet } from "thirdweb/react";
import Sidebar from "@/components/Sidebar";
import DashboardContent from "@/components/DashboardContent";
import DaoWidget from "@/components/DaoWidget";
import InnerKeysCatalog from "@/components/InnerKeysCatalog";
import ProfilePage from "@/components/ProfilePage";
import Availability from "@/components/Availability";
import Sessions from "@/components/Sessions";
import RoomsManager from "@/components/RoomsManager";
import WhitelistWidget from "@/components/WhitelistWidget";
import { useCeramic } from "@/context/CeramicContext";

export default function DashboardPage() {
  const activeWallet = useActiveWallet();
  const { disconnect: disconnectCeramic } = useCeramic();
  const [activeItem, setActiveItem] = useState('dashboard');
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Desconectar Ceramic y limpiar su estado en memoria
      try { await disconnectCeramic(); } catch (e) { console.warn('Ceramic disconnect error:', e); }

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
      case 'rooms':
        return <RoomsManager />;
      case 'availability':
        return <Availability onLogout={handleLogout} />;
      case 'schedule':
        return <Sessions onLogout={handleLogout} />;
      case 'nfts':
        return <InnerKeysCatalog onLogout={handleLogout} />;
      case 'dao':
        return <DaoWidget onLogout={handleLogout} />;
      case 'whitelist':
        return <WhitelistWidget />;
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
