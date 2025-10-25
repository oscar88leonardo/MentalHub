"use client"
import React, { useEffect, useState } from "react";
import Header from "./Header";
import DebugWallet from "./DebugWallet";
import { useCeramic } from "@/context/CeramicContext";
import SessionsConsultant from "./SessionsConsultant";
import SessionsTherapist from "./SessionsTherapist";

interface SessionsProps { onLogout: () => void }

const Sessions: React.FC<SessionsProps> = ({ onLogout }) => {
  const { profile, composeClient, refreshProfile } = useCeramic();
  const [ready, setReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingKeys, setIsLoadingKeys] = useState(false);

  useEffect(() => { setReady(true); }, []);

  // Cargar perfil de Ceramic al entrar a "Mis Sesiones" (una vez cuando composeClient esté listo)
  useEffect(() => {
    if (!composeClient) { setIsLoading(false); return; }
    let cancelled = false;
    setIsLoading(true);
    (async () => {
      try { await refreshProfile(); } catch {}
      finally { if (!cancelled) setIsLoading(false); }
    })();
    return () => { cancelled = true; };
    // Intencionalmente sin dependencia de refreshProfile para evitar bucles por cambio de referencia
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [composeClient]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title="Mis Sesiones" 
        subtitle="Agenda y gestiona tus sesiones"
        onLogout={onLogout}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <DebugWallet />

          <div className="relative min-h-[40vh]">
            {(!ready) ? null : (
              profile?.rol === 'Terapeuta' 
                ? <SessionsTherapist />
                : <SessionsConsultant onLoadingKeysChange={setIsLoadingKeys} />
            )}
            {(isLoading || isLoadingKeys) && (
              <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(2px)' }}>
                <div className="text-center rounded-2xl p-6 text-white"
                     style={{ background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-3"></div>
                  <p className="text-sm">Cargando tus datos…</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sessions;









