"use client"
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useCeramic } from "@/context/CeramicContext";

type HuddEdge = {
  node: {
    id: string;
    name: string;
    roomId: string;
    created: string;
    state: "Active" | "Archived";
  };
};

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose, onCreated }) => {
  const { profile, executeQuery, authenticateForWrite } = useCeramic();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setIsLoading(false);
      setError(null);
    }
  }, [isOpen]);

  const handleCreate = async () => {
    if (!name.trim() || !profile?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      await authenticateForWrite();
      const res = await fetch("/api/huddle/createRoom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: name }),
      });
      const json = await res.json();
      if (!res.ok || !json?.roomId) {
        throw new Error(json?.error || "No se pudo crear la sala");
      }
      const now = new Date().toISOString();
      const safeName = name.replace(/\"/g, '\\\"').replace(/"/g, '\\"');
      const mutation = `
        mutation {
          createHuddle01(input: { content: { name: "${safeName}", roomId: "${json.roomId}", profileId: "${profile.id}", created: "${now}", state: Active } }) {
            document { id name }
          }
        }
      `;
      const gql = await executeQuery(mutation);
      if (gql?.errors?.length) throw new Error(gql.errors.map((e: any) => e.message).join(" | "));
      onCreated();
      onClose();
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-md rounded-2xl shadow-2xl" style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)" }}>
        <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Crear sala</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-white/80 mt-2">Asigna un nombre a la sala</p>
        </div>
        <div className="p-6 space-y-4">
          <input
            className="w-full px-4 py-3 rounded-xl border-0 text-white placeholder-white/60"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
            placeholder="Nombre de la sala"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {error && (
            <div className="p-3 rounded bg-red-500/20 border border-red-500/30 text-red-200 text-sm">{error}</div>
          )}
          <div className="flex justify-end gap-3">
            <button onClick={onClose} disabled={isLoading} className="px-5 py-2 rounded-xl border border-white/30 text-white hover:bg-white/10 disabled:opacity-50">Cancelar</button>
            <button onClick={handleCreate} disabled={isLoading || !name.trim()} className="px-5 py-2 rounded-xl bg-blue-600 text-white disabled:opacity-50">
              {isLoading ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RoomsManager: React.FC = () => {
  const { profile, executeQuery, authenticateForWrite, refreshProfile } = useCeramic();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rooms, setRooms] = useState<HuddEdge[]>([]);

  const fetchRooms = useCallback(async () => {
    if (!profile?.id) return;
    const q = `
      query($id: ID!) {
        node(id: $id) {
          ... on InnerverProfile {
            id
            hudds(last: 100) {
              edges { node { id name roomId created state } }
            }
          }
        }
      }
    `;
    const res: any = await executeQuery(q, { id: profile.id });
    const edges = res?.data?.node?.hudds?.edges || [];
    setRooms(edges as HuddEdge[]);
  }, [executeQuery, profile?.id]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchRooms();
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchRooms]);

  const openRoom = useCallback((roomId: string) => {
    window.open(`https://innerverse.huddle01.app/room/${roomId}`, "_blank", 'noopener,noreferrer');
  }, []);

  const toggleState = useCallback(async (edge: HuddEdge) => {
    try {
      await authenticateForWrite();
      const now = new Date().toISOString();
      const newState = edge.node.state === 'Active' ? 'Archived' : 'Active';
      const mutation = `
        mutation {
          updateHuddle01(input: { id: "${edge.node.id}", content: { name: "${edge.node.name}", roomId: "${edge.node.roomId}", profileId: "${profile?.id}", created: "${edge.node.created}", edited: "${now}", state: ${newState} } }) {
            document { id }
          }
        }
      `;
      await executeQuery(mutation);
      await fetchRooms();
    } catch (e) {
      console.error(e);
    }
  }, [authenticateForWrite, executeQuery, profile?.id, fetchRooms]);

  useEffect(() => {
    (async () => {
      if (!profile) {
        try { await refreshProfile(); } catch {}
      }
      if (profile?.id) {
        await fetchRooms();
      }
    })();
  }, [profile?.id, profile, fetchRooms, refreshProfile]);

  if (!profile) return null;

  if (profile.rol !== 'Terapeuta') return null;

  return (
    <div className="rounded-2xl p-8 shadow-xl mt-6" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-white">Salas</h3>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsModalOpen(true)} className="px-5 py-2 rounded-xl bg-white/20 text-white border border-white/30">Crear sala</button>
          <button onClick={refresh} disabled={isRefreshing} className="px-5 py-2 rounded-xl border border-white/30 text-white hover:bg-white/10 disabled:opacity-50">{isRefreshing ? 'Actualizando...' : 'Actualizar'}</button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-white/20">
        <table className="min-w-full text-left text-white/90">
          <thead className="bg-white/10">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rooms.length === 0 ? (
              <tr><td className="px-4 py-4" colSpan={3}>No hay salas creadas.</td></tr>
            ) : (
              rooms.map((edge) => (
                <tr key={edge.node.id} className="border-t border-white/10">
                  <td className="px-4 py-3">{edge.node.name}</td>
                  <td className="px-4 py-3">{edge.node.state}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button onClick={() => openRoom(edge.node.roomId)} className="px-3 py-1 rounded bg-blue-600 text-white">Abrir</button>
                    <button onClick={() => toggleState(edge)} className="px-3 py-1 rounded bg-white/20 text-white border border-white/30">
                      {edge.node.state === 'Active' ? 'Archivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CreateRoomModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreated={fetchRooms} />
    </div>
  );
};

export default RoomsManager;


