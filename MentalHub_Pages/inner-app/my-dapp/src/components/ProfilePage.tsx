"use client"
import React, { useState, useEffect, useRef } from "react";
import { useCeramic } from "@/context/CeramicContext";
import Image from "next/image";
import Header from "./Header";
import DebugWallet from "./DebugWallet";
import EditProfileButton from "./EditProfileButton";
import { resolveIpfsUrl } from "@/lib/ipfs";

interface ProfilePageProps {
  onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onLogout }) => {
  const { 
    profile, 
    isConnected, 
    error, 
    refreshProfile,    
    account,
    adminAccount
  } = useCeramic();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBootLoading, setIsBootLoading] = useState(true);
  const initialLoadDoneRef = useRef(false);
  const lastWalletAddressRef = useRef<string | null>(null);

  // Carga inicial: sólo una vez con spinner
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (initialLoadDoneRef.current) return;
      setIsBootLoading(true);
      try {
        await refreshProfile();
      } catch (e) {
        console.warn("Auto refreshProfile failed:", e);
      } finally {
        if (!cancelled) {
          initialLoadDoneRef.current = true;
          setIsBootLoading(false);
        }
      }
    };
    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Relectura al cambiar wallet (sin tocar el spinner inicial)
  useEffect(() => {
    const currentAddr = (adminAccount?.address || account?.address || "").toLowerCase();
    if (!currentAddr) return;
    if (lastWalletAddressRef.current === currentAddr) return;
    lastWalletAddressRef.current = currentAddr;

    (async () => {
      try {
        setIsRefreshing(true);
        await refreshProfile();
      } catch (e) {
        console.warn("Refresh on wallet change failed:", e);
      } finally {
        setIsRefreshing(false);
      }
    })();
  }, [account?.address, adminAccount?.address, refreshProfile]);

  // NO auto-conectar - Solo mostrar información del wallet
  useEffect(() => {
    console.log("🔍 ProfilePage - Wallet state:", {
      account: !!account,
      adminAccount: !!adminAccount,
      isConnected: isConnected,
      profile: !!profile
    });
    
    console.log("ℹ️ Ceramic authentication will happen only when editing profile");
  }, [account, adminAccount, isConnected, profile]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshProfile();
    } catch (error) {
      console.error("Error refreshing profile:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isBootLoading) {
    return (
      <div 
        className="flex-1 min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #6666ff 0%, #4d4dcc 50%, #339999 100%)',
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      >
        <div 
          className="text-center rounded-2xl p-8 text-white"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg font-medium" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
            Cargando perfil...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="flex-1 min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #6666ff 0%, #4d4dcc 50%, #339999 100%)',
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      >
        <div 
          className="text-center max-w-md mx-auto p-8 rounded-2xl"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          <div className="flex items-center justify-center mb-6">
            <svg className="w-16 h-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-red-200 text-xl font-semibold mb-4" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
            Error de Conexión
          </h3>
          <p className="text-white/90 text-sm mb-6">
            Hubo un error al conectar con Ceramic: {error}. Por favor, intenta de nuevo.
          </p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium shadow-lg"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header fijo */}
      <Header
        title="Mi Perfil"
        subtitle="Gestiona tu información personal"
        onLogout={onLogout}
      />

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
        <DebugWallet />

        {/* Estado de conexión */}
        <div 
          className="mb-6 rounded-2xl p-6"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
          }}
        >
          <h3 className="text-lg font-semibold text-white mb-4" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
            Estado de Conexión:
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${account ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-white font-medium">
                Account: {account ? account.address.slice(0, 6) + '...' : 'No conectado'}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${adminAccount ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-white font-medium">
                Admin Account: {adminAccount ? adminAccount.address.slice(0, 6) + '...' : 'No conectado'}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-white font-medium">
                Ceramic: {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${profile ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-white font-medium">
                Perfil: {profile ? 'Cargado' : 'No cargado'}
              </span>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex space-x-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
            >
              {isRefreshing && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span className="font-medium">{isRefreshing ? 'Actualizando...' : 'Actualizar Perfil'}</span>
            </button>
          </div>

          {/* Botón de editar perfil (autenticación solo al guardar) */}
          <EditProfileButton isNewUser={!profile} />
        </div>

        {profile ? (
          <div className="space-y-6">
            {/* Profile Header */}
            <div 
              className="rounded-2xl p-8 shadow-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
            >
              <div className="flex items-center space-x-6">
                {profile.pfp ? (
                  <Image
                    src={resolveIpfsUrl(profile.pfp)}
                    alt={profile.name || "pfp"}
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-full object-cover border border-white/40"
                  />
                ) : (
                  <div 
                    className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold text-white"
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    {profile.name || 'Usuario'}
                  </h2>
                  <p className="text-white/90 text-lg mb-2" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                    {profile.email || 'usuario@innerverse.com'}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-white/80 text-sm font-medium">Perfil verificado</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div 
              className="rounded-2xl p-8 shadow-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
              }}
            >
              <h3 className="text-2xl font-bold text-white mb-6" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                Información del Perfil
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-white/80 text-sm font-medium block mb-2">Nombre Completo</label>
                  <div 
                    className="p-4 rounded-xl text-white font-medium"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(5px)'
                    }}
                  >
                    {profile.name || 'No especificado'}
                  </div>
                </div>
                <div>
                  <label className="text-white/80 text-sm font-medium block mb-2">Email</label>
                  <div 
                    className="p-4 rounded-xl text-white font-medium"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(5px)'
                    }}
                  >
                    {profile.email || 'No especificado'}
                  </div>
                </div>
                <div>
                  <label className="text-white/80 text-sm font-medium block mb-2">Teléfono</label>
                  <div 
                    className="p-4 rounded-xl text-white font-medium"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(5px)'
                    }}
                  >
                    {profile.phone || 'No especificado'}
                  </div>
                </div>
                <div>
                  <label className="text-white/80 text-sm font-medium block mb-2">Fecha de Registro</label>
                  <div 
                    className="p-4 rounded-xl text-white font-medium"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(5px)'
                    }}
                  >
                    {profile.createdAt ? formatDate(profile.createdAt) : 'No disponible'}
                  </div>
                </div>
              </div>
            </div>

            {/* Wallet Information */}
            {account && (
              <div 
                className="rounded-2xl p-8 shadow-xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
                }}
              >
                <h3 className="text-2xl font-bold text-white mb-6" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                  Información de Wallet
                </h3>
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    {account.address.slice(2, 3).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white/80 text-sm font-medium mb-1">Dirección de Wallet</p>
                    <p className="text-white font-mono text-lg">{account.address}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[30vh]">
            <div 
              className="text-center max-w-md mx-auto p-8 rounded-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
            >
              <div className="flex items-center justify-center mb-6">
                <svg className="w-16 h-16 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-yellow-200 text-xl font-semibold mb-4" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                Perfil No Encontrado
              </h3>
              <p className="text-white/90 text-sm mb-6">
                No se encontró un perfil de Innerverse asociado a tu wallet. Puedes crear uno o verificar tu conexión.
              </p>
              <EditProfileButton isNewUser />
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;