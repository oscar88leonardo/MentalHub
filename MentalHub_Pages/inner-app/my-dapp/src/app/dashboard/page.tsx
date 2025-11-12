"use client"
import React, { useState, useEffect } from "react";
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
import Workshops from "@/components/Workshops";
import { useCeramic } from "@/context/CeramicContext";
import { 
  isBasicProfileComplete, 
  isTherapistProfileComplete, 
  isConsultantProfileComplete,
  getRequiredModal 
} from "@/lib/profileValidation";

export default function DashboardPage() {
  const activeWallet = useActiveWallet();
  const { disconnect: disconnectCeramic, profile, therapist, consultant, isConnected, isLoading } = useCeramic();
  const [activeItem, setActiveItem] = useState('dashboard');
  const [requiredModal, setRequiredModal] = useState<'basic' | 'therapist' | 'consultant' | null>(null);
  const router = useRouter();

  // Validar perfil al cargar
  useEffect(() => {
    if (!isLoading && isConnected) {
      const modal = getRequiredModal(profile, therapist, consultant);
      if (modal) {
        setRequiredModal(modal);
        setActiveItem('profile'); // Cambiar a vista de perfil
      } else {
        setRequiredModal(null);
      }
    }
  }, [profile, therapist, consultant, isConnected, isLoading]);

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
    // Si hay un modal requerido, solo permitir navegar a 'profile'
    if (requiredModal && item !== 'profile') {
      setActiveItem('profile');
      return;
    }
    
    // Verificar validaciones antes de permitir navegación
    if (!isBasicProfileComplete(profile)) {
      setRequiredModal('basic');
      setActiveItem('profile');
      return;
    }
    
    if (profile?.rol === 'Terapeuta' && !isTherapistProfileComplete(therapist)) {
      if (item !== 'profile') {
        setRequiredModal('therapist');
        setActiveItem('profile');
        return;
      }
    }
    
    if (profile?.rol === 'Consultante' && !isConsultantProfileComplete(consultant)) {
      if (item !== 'profile') {
        setRequiredModal('consultant');
        setActiveItem('profile');
        return;
      }
    }
    
    setActiveItem(item);
  };

  const handleModalComplete = () => {
    // Cuando se completa un modal, verificar si hay otro requerido
    // Solo actualizar el estado del modal requerido, sin cambiar la página activa
    const nextModal = getRequiredModal(profile, therapist, consultant);
    setRequiredModal(nextModal);
    // No cambiar activeItem - el usuario permanece en la página donde está
  };

  const renderContent = () => {
    switch (activeItem) {
      case 'profile':
        return (
          <ProfilePage 
            onLogout={handleLogout}
            requiredModal={requiredModal}
            onModalComplete={handleModalComplete}
          />
        );
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
      case 'workshops':
        return <Workshops />;
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
        <Sidebar 
          activeItem={requiredModal ? 'profile' : activeItem} 
          onItemClick={handleItemClick}
          profile={profile}
          therapist={therapist}
          consultant={consultant}
          isProfileComplete={
            isBasicProfileComplete(profile) && 
            (profile?.rol === 'Terapeuta' 
              ? isTherapistProfileComplete(therapist) 
              : isConsultantProfileComplete(consultant))
          }
        />
      </div>
      
      {/* Área de contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
}
