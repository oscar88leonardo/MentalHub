"use client"
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useActiveAccount, useActiveWallet } from "thirdweb/react";
import { useCeramic } from "@/context/CeramicContext";
import Image from "next/image";
import Header from "./Header";
import DebugWallet from "./DebugWallet";
import EditProfileButton from "./EditProfileButton";
import EditTherapistProfileModal from "./EditTherapistProfileModal";
import EditConsultantProfileModal from "./EditConsultantProfileModal";
import { resolveIpfsUrl } from "@/lib/ipfs";
import { getContract, readContract } from "thirdweb";
import { client } from "@/lib/client";
import { myChain } from "@/config/chain";
import { contracts } from "@/config/contracts";
import { abi } from "@/abicontracts/MembersAirdrop";

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
    adminAccount,
    therapist,
    consultant
  } = useCeramic();
  const aaAccountHook = useActiveAccount();
  const activeWallet = useActiveWallet();
  const eoaAccount = activeWallet ? activeWallet.getAccount() : null;
  const persistedAA = useMemo(() => {
    try {
      const raw = sessionStorage.getItem("thirdweb:account");
      if (!raw) return null;
      const data = JSON.parse(raw) as { address?: string; walletId?: string; chainId?: number };
      if (!data?.address) return null;
      if (data.chainId !== myChain.id) return null;
      if (activeWallet?.id && data.walletId && data.walletId !== activeWallet.id) return null;
      return data.address as string;
    } catch {
      return null;
    }
  }, [activeWallet?.id]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBootLoading, setIsBootLoading] = useState(true);
  const initialLoadDoneRef = useRef(false);
  const lastWalletAddressRef = useRef<string | null>(null);

  // Mis Inner Keys (NFTs del usuario)
  const [userInnerKeys, setUserInnerKeys] = useState<any[]>([]);
  // incializacion del contrato (memoizado para evitar recreación en cada render)
  const contract = useMemo(() => getContract({
    client: client!,
    chain: myChain,
    address: contracts.membersAirdrop,
    // The ABI for the contract is defined here
    abi: abi as [],
  }), []);
  // Control de carga para Inner Keys
  const [isCheckingArrTokenIds, setIsCheckingArrTokenIds] = useState(false);
  const [isTherapistModalOpen, setIsTherapistModalOpen] = useState(false);
  const [isConsultantModalOpen, setIsConsultantModalOpen] = useState(false);

  // Helper: chips renderer
  const Chips = ({ items }: { items?: Array<string | number> }) => {
    if (!items || items.length === 0) return <span>—</span>;
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((it, idx) => (
          <span
            key={idx}
            className="px-2 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs"
          >
            {String(it)}
          </span>
        ))}
      </div>
    );
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const candidatesRaw = [
          aaAccountHook?.address || null,
          persistedAA || null,
          eoaAccount?.address || null,
          account?.address || null,
        ].filter((x): x is string => !!x);

        const seenAddr = new Set<string>();
        const candidates = candidatesRaw.filter((a) => {
          const k = a.toLowerCase();
          if (seenAddr.has(k)) return false;
          seenAddr.add(k);
          return true;
        });

        if (candidates.length === 0) {
          setUserInnerKeys([]);
          return;
        }

        setIsCheckingArrTokenIds(true);
        setUserInnerKeys([]);

        const allItems: any[] = [];
        for (const addr of candidates) {
          try {
            const tokenIds = await readContract({
              contract,
              method: "function walletOfOwner(address _owner) view returns (uint256[])",
              params: [addr],
            });
            if (!Array.isArray(tokenIds) || tokenIds.length === 0) continue;

            const items = await Promise.all(
              tokenIds.map(async (TkId: any) => {
                try {
                  const urlGateway = await readContract({
                    contract: contract,
                    method: "function gatewayURI(uint256 tokenId) view returns (string)",
                    params: [TkId],
                  });
                  if (typeof urlGateway === "string" && urlGateway) {
                    const resp = await fetch(urlGateway);
                    const meta = await resp.json();
                    const tokenIdStr = typeof TkId === "bigint" ? TkId.toString() : String(TkId);
                    return { ...meta, tokenId: tokenIdStr };
                  }
                } catch (e) {
                  console.error(e);
                }
                return null;
              })
            );
            (items.filter(Boolean) as any[]).forEach((x) => allItems.push(x));
          } catch (e) {
            console.warn("walletOfOwner failed for", addr, e);
          }
        }

        if (cancelled) return;
        const uniq = new Map<string, any>();
        for (const it of allItems) {
          const key = it?.tokenId || it?.pathImage || it?.name;
          if (!key) continue;
          if (!uniq.has(key)) uniq.set(key, it);
        }
        setUserInnerKeys(Array.from(uniq.values()));
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          setUserInnerKeys([]);
        }
      } finally {
        if (!cancelled) setIsCheckingArrTokenIds(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [aaAccountHook?.address, persistedAA, eoaAccount?.address, account?.address, contract]);

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
    const currentAddr = (account?.address || "").toLowerCase();
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
  }, [account?.address, refreshProfile]);

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
          <div className="flex items-center space-x-3">
            {profile?.rol === "Terapeuta" && (
              <button
                onClick={() => setIsTherapistModalOpen(true)}
                disabled={!profile}
                className="px-4 py-3 rounded-xl text-white font-medium transition-colors disabled:opacity-50"
                style={{ background: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.3)' }}
              >
                Info. Terapeuta
              </button>
            )}
            {profile?.rol === "Consultante" && (
              <button
                onClick={() => setIsConsultantModalOpen(true)}
                disabled={!profile}
                className="px-4 py-3 rounded-xl text-white font-medium transition-colors disabled:opacity-50"
                style={{ background: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.3)' }}
              >
                Info. Consultante
              </button>
            )}
            <EditProfileButton isNewUser={!profile} />
          </div>
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
                  {profile.email && (
                    <p className="text-white/90 text-lg mb-2" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                      {profile.email}
                    </p>
                  )}
                  <div className="flex items-center flex-wrap gap-2">
                    {profile.rol && (
                      <span className="px-2 py-1 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs">
                        {profile.rol}
                      </span>
                    )}
                    {profile.createdAt && (
                      <span className="text-white/80 text-sm">
                        Creado: {formatDate(profile.createdAt)}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-white/60 text-xs mb-1">Género</p>
                      <div className="p-2 rounded-lg border border-white/20 text-white/90" style={{ background:'rgba(255,255,255,0.05)'}}>
                        {profile.gender || '—'}
                      </div>
                    </div>
                    <div>
                      <p className="text-white/60 text-xs mb-1">Monedas</p>
                      <Chips items={profile.currencies || []} />
                    </div>
                    <div>
                      <p className="text-white/60 text-xs mb-1">Tarifas</p>
                      <Chips items={profile.ratesByCurrency || []} />
                    </div>
                    <div>
                      <p className="text-white/60 text-xs mb-1">Fecha de nacimiento</p>
                      <div className="p-2 rounded-lg border border-white/20 text-white/90" style={{ background:'rgba(255,255,255,0.05)'}}>
                        {profile.birthDate ? formatDate(profile.birthDate) : '—'}
                      </div>
                    </div>
                    <div>
                      <p className="text-white/60 text-xs mb-1">País</p>
                      <div className="p-2 rounded-lg border border-white/20 text-white/90" style={{ background:'rgba(255,255,255,0.05)'}}>
                        {profile.country || '—'}
                      </div>
                    </div>
                    <div>
                      <p className="text-white/60 text-xs mb-1">Ciudad</p>
                      <div className="p-2 rounded-lg border border-white/20 text-white/90" style={{ background:'rgba(255,255,255,0.05)'}}>
                        {profile.city || '—'}
                      </div>
                    </div>
                    <div>
                      <p className="text-white/60 text-xs mb-1">Zona horaria</p>
                      <div className="p-2 rounded-lg border border-white/20 text-white/90" style={{ background:'rgba(255,255,255,0.05)'}}>
                        {profile.timezone || '—'}
                      </div>
                    </div>
                    <div>
                      <p className="text-white/60 text-xs mb-1">Idiomas</p>
                      <Chips items={profile.languages || []} />
                    </div>
                    <div>
                      <p className="text-white/60 text-xs mb-1">Idioma principal</p>
                      <div className="p-2 rounded-lg border border-white/20 text-white/90" style={{ background:'rgba(255,255,255,0.05)'}}>
                        {profile.primaryLanguage || '—'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Se elimina la sección 'Información del Perfil'; info básica se muestra en la tarjeta superior */}

            {/* TherapistProfile Summary */}
            {therapist && (
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
                  Perfil Terapeuta 
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-white/80 text-sm font-medium block mb-2">Años de experiencia</label>
                    <div className="p-4 rounded-xl text-white font-medium" style={{ background:'rgba(255,255,255,0.05)', backdropFilter:'blur(5px)' }}>
                      {typeof therapist.yearsExperience === "number" ? therapist.yearsExperience : '—'}
                    </div>
                  </div>
                  <div>
                    <label className="text-white/80 text-sm font-medium block mb-2">Enfoques</label>
                    <div className="p-4 rounded-xl text-white" style={{ background:'rgba(255,255,255,0.05)', backdropFilter:'blur(5px)' }}>
                      <Chips items={therapist.approaches} />
                    </div>
                  </div>
                  <div>
                    <label className="text-white/80 text-sm font-medium block mb-2">Especialidades</label>
                    <div className="p-4 rounded-xl text-white" style={{ background:'rgba(255,255,255,0.05)', backdropFilter:'blur(5px)' }}>
                      <Chips items={therapist.specialties} />
                    </div>
                  </div>
                  <div>
                    <label className="text-white/80 text-sm font-medium block mb-2">Acepta nuevos consultantes</label>
                    <div className="p-4 rounded-xl text-white font-medium" style={{ background:'rgba(255,255,255,0.05)', backdropFilter:'blur(5px)' }}>
                      {therapist.acceptingNewClients === true ? 'Sí' : therapist.acceptingNewClients === false ? 'No' : '—'}
                    </div>
                  </div>
                  <div>
                    <label className="text-white/80 text-sm font-medium block mb-2">Mi sala</label>
                    <div className="p-4 rounded-xl text-white font-medium flex items-center justify-between" style={{ background:'rgba(255,255,255,0.05)', backdropFilter:'blur(5px)' }}>
                      <span>{therapist.roomId || '—'}</span>
                      {therapist.roomId && (
                        <a
                          href={`https://innerverse.huddle01.app/room/${therapist.roomId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 rounded bg-blue-600 text-white"
                        >
                          Abrir sala
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-white/80 text-sm font-medium block mb-2">Bio corta</label>
                    <div className="p-4 rounded-xl text-white" style={{ background:'rgba(255,255,255,0.05)', backdropFilter:'blur(5px)' }}>
                      {therapist.bioShort || '—'}
                    </div>
                  </div>
                  {therapist.bioLong && (
                    <div className="md:col-span-2">
                      <label className="text-white/80 text-sm font-medium block mb-2">Bio larga</label>
                      <div className="p-4 rounded-xl text-white whitespace-pre-wrap" style={{ background:'rgba(255,255,255,0.05)', backdropFilter:'blur(5px)' }}>
                        {therapist.bioLong}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ConsultantProfile Summary */}
            {consultant && (
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
                  Perfil Consultante
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="text-white/80 text-sm font-medium block mb-2">Motivo breve</label>
                    <div className="p-4 rounded-xl text-white" style={{ background:'rgba(255,255,255,0.05)', backdropFilter:'blur(5px)' }}>
                      {consultant.presentingProblemShort || '—'}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-white/80 text-sm font-medium block mb-2">Objetivos</label>
                    <div className="p-4 rounded-xl text-white" style={{ background:'rgba(255,255,255,0.05)', backdropFilter:'blur(5px)' }}>
                      <Chips items={consultant.goals} />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-white/80 text-sm font-medium block mb-2">Emergencia (nombre)</label>
                    <div className="p-4 rounded-xl text-white font-medium" style={{ background:'rgba(255,255,255,0.05)', backdropFilter:'blur(5px)' }}>
                      {consultant.emergencyContactName || '—'}
                    </div>
                  </div>
                  <div>
                    <label className="text-white/80 text-sm font-medium block mb-2">Emergencia (tel)</label>
                    <div className="p-4 rounded-xl text-white font-medium" style={{ background:'rgba(255,255,255,0.05)', backdropFilter:'blur(5px)' }}>
                      {consultant.emergencyContactPhoneE164 || '—'}
                    </div>
                  </div>
                </div>
              </div>
            )}

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

            {/* Mis Inner Keys */}
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
                Mis Inner Keys
              </h3>
              {isCheckingArrTokenIds ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              ) : userInnerKeys.length === 0 ? (
                <p className="text-white/80">Aún no tienes Inner Keys asociadas.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userInnerKeys.map((item: any, idx: number) => (
                    <div key={idx} className="rounded-2xl overflow-hidden bg-white/10 border border-white/20 shadow-xl">
                      <div className="relative w-full h-0 pb-[56.25%] overflow-hidden rounded-b-none">
                        {item?.pathImage ? (
                          <video controls className="absolute inset-0 w-full h-full object-cover">
                            <source src={item.pathImage} type="video/mp4" />
                          </video>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-white/80">Sin vista previa</div>
                        )}
                      </div>
                      <div className="p-5 text-white">
                        <h4 className="text-lg font-semibold mb-1">{item?.name || 'Inner Key'}</h4>
                        {item?.contSessions !== undefined && (
                          <p className="text-white/80 text-sm">Sesiones: {item.contSessions}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Salas (Huddle) - movidas al menú lateral */}
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
        {/* Modales */}
        <EditTherapistProfileModal isOpen={isTherapistModalOpen} onClose={() => setIsTherapistModalOpen(false)} />
        <EditConsultantProfileModal isOpen={isConsultantModalOpen} onClose={() => setIsConsultantModalOpen(false)} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;