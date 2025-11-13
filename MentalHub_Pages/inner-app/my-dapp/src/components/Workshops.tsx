"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useCeramic } from "@/context/CeramicContext";
import WorkshopCreation from "@/components/WorkshopCreation";
import { resolveIpfsUrl } from "@/lib/ipfs";
import { getContract, readContract } from "thirdweb";
import { client } from "@/lib/client";
import { myChain } from "@/config/chain";
import { contracts } from "@/config/contracts";
import { abi as membersAbi } from "@/abicontracts/MembersAirdrop";
import Header from "./Header";

interface WorkshopsProps {
  onLogout?: () => Promise<void> | void;
}

const Workshops: React.FC<WorkshopsProps> = ({ onLogout }) => {
  
   // Obtener perfil del usuarii
  const { profile, refreshProfile, account, executeQuery, authenticateForWrite } = useCeramic();
   const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [tagsFilter, setTagsFilter] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [editState, setEditState] = useState<{ title: string; description: string; image: string; fechaHora: string; capacity: string; tags: string; status: string }>({
    title: "",
    description: "",
    image: "",
    fechaHora: "",
    capacity: "",
    tags: "",
    status: "Upcoming",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const initialProfileLoadRef = useRef(false);
  const initialWorkshopsLoadRef = useRef(false);
   
   useEffect(() => {    
    if (initialProfileLoadRef.current) return;
    initialProfileLoadRef.current = true;

    let cancelled = false;
    (async () => {
        setIsLoadingProfile(true);
        try{
            await refreshProfile();
        } catch (error) {
            console.error("Error al obtener el perfil del usuario:", error);
        } finally {
          if (!cancelled) {
            setIsLoadingProfile(false);
          }
        }
    })();
    return () => { cancelled = true; };
   }, []);
   
  const fetchWorkshops = useCallback(async () => {
    try {
      const q = `
        query {
          workshopIndex(last: 100) {
            edges {
              node {
                id
                title
                description
                image
                status
                startAt
                roomId
                capacity
                tags
                creator {
                  id
                  name
                  displayName
                }
                creatorId
              }
            }
          }
        }
      `;
      const res: any = await executeQuery(q);
      const edges = res?.data?.workshopIndex?.edges || [];
      setWorkshops(edges.map((e: any) => e.node));
    } catch (e) {
      console.error(e);
    }
  }, [executeQuery]);

  useEffect(() => {
    if (initialWorkshopsLoadRef.current) return;
    initialWorkshopsLoadRef.current = true;
    (async () => {
      try { await fetchWorkshops(); } catch {}
    })();
  }, []);

  // Aplicar filtros y paginación en cliente
  const normalizedTags = tagsFilter
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const filtered = workshops.filter((w) => {
    const statusOk = !statusFilter || (w.status || "").toLowerCase() === statusFilter.toLowerCase();
    const tagsOk =
      normalizedTags.length === 0 ||
      Array.isArray(w.tags) && w.tags.some((tg: string) => normalizedTags.includes((tg || "").toLowerCase()));
    return statusOk && tagsOk;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const pageItems = filtered.slice(startIdx, startIdx + pageSize);

  const resetAndApplyFilters = () => setPage(1);

  const handleOpenRoom = async (w: any) => {
    try {
      // Validar hora
      const now = Date.now();
      const start = Date.parse(w.startAt);
      if (Number.isFinite(start) && now < start) {
        setToast({ text: "Este workshop aún no ha iniciado", type: "info" });
        setTimeout(() => setToast(null), 3000);
        return;
      }

      // Validar NFT de membresía
      const addr = account?.address;
      if (!addr) {
        setToast({ text: "Conecta tu wallet para continuar", type: "error" });
        setTimeout(() => setToast(null), 3000);
        return;
      }
      const contract = getContract({ client: client!, chain: myChain, address: contracts.membersAirdrop, abi: membersAbi as [] });
      const tokenIds = await readContract({ contract, method: "function walletOfOwner(address _owner) view returns (uint256[])", params: [addr] });
      if (!Array.isArray(tokenIds) || tokenIds.length === 0) {
        setToast({ text: "Necesitas una Inner Key para acceder", type: "error" });
        setTimeout(() => setToast(null), 3500);
        return;
      }

      // Abrir sala
      const url = `https://innerverse.huddle01.app/room/${w.roomId}`;
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      console.error(e);
      setToast({ text: String(e?.message || e), type: "error" });
      setTimeout(() => setToast(null), 4000);
    }
  };

  const canEdit = (w: any) => {
    const creatorId = w?.creatorId || w?.creator?.id;
    return !!profile?.id && creatorId === profile.id;
  };

  const openEdit = (w: any) => {
    if (!canEdit(w)) return;
    setEditing(w);
    setEditState({
      title: w.title || "",
      description: w.description || "",
      image: w.image || "",
      fechaHora: w.startAt ? new Date(w.startAt).toISOString().slice(0, 16) : "",
      capacity: typeof w.capacity === "number" ? String(w.capacity) : "",
      tags: Array.isArray(w.tags) ? w.tags.join(", ") : "",
      status: w.status || "Upcoming",
    });
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setIsEditOpen(false);
    setEditing(null);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditState((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/uploadFile", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok || !json?.IpfsHash) throw new Error(json?.error || "No se pudo subir la imagen");
      setEditState((prev) => ({ ...prev, image: `ipfs://${json.IpfsHash}` }));
      setToast({ text: "Imagen actualizada", type: "success" });
      setTimeout(() => setToast(null), 2500);
    } catch (err: any) {
      setToast({ text: String(err?.message || err), type: "error" });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setIsUploading(false);
    }
  };

  const saveEdit = async () => {
    if (!editing?.id) return;
    setIsSaving(true);
    try {
      await authenticateForWrite();
      const mutation = `
        mutation UpdateWorkshop($id: ID!, $content: UpdateWorkshopInput!) {
          updateWorkshop(input: { id: $id, content: $content }) {
            document { id title description image status startAt roomId capacity tags }
          }
        }
      `;
      const tagsArr = (editState.tags || "").split(",").map((t) => t.trim()).filter(Boolean);
      const capacityInt = editState.capacity ? parseInt(editState.capacity, 10) : undefined;
      const variables: any = {
        id: editing.id,
        content: {
          title: editState.title,
          description: editState.description,
          image: editState.image || null,
          status: editState.status,
          startAt: editState.fechaHora ? new Date(editState.fechaHora).toISOString() : null,
          capacity: Number.isFinite(capacityInt as any) ? capacityInt : null,
          tags: tagsArr.length ? tagsArr : null,
        },
      };
      const res: any = await executeQuery(mutation, variables);
      if (res?.errors?.length) throw new Error(res.errors.map((e: any) => e.message).join(" | "));
      setToast({ text: "Workshop actualizado", type: "success" });
      setTimeout(() => setToast(null), 2500);
      await fetchWorkshops();
      closeEdit();
    } catch (err: any) {
      console.error(err);
      setToast({ text: String(err?.message || err), type: "error" });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  if(!profile) {
    if (isLoadingProfile) {
      return (
        <div className="flex-1 overflow-y-auto p-8 text-white">
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <span className="ml-4 text-lg">Cargando información del perfil...</span>
          </div>
        </div>
      );
    }
  } 
  const esTerapeuta = profile?.rol === "Terapeuta";

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header fijo */}
      <Header
        title="Workshops"
        subtitle="Talleres de la comunidad"
        onLogout={(onLogout as any) || (() => {})}
      />

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto p-8 text-white">
        {/* Banner de bienvenida - ancho completo */}
        <div className="w-full bg-white/10 border border-white/20 rounded-3xl p-10 shadow-xl backdrop-blur">
          <h2 className="text-3xl font-bold mb-4 text-white" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.25)" }}>
            Bienvenido a los Workshops de nuestra comunidad
          </h2>
          <p className="text-white/80 text-lg">
            Aquí encontrarás actividades, sesiones y recursos especialmente diseñados para impulsar tu aprendizaje colectivo.
          </p>
        </div>

        {/* Filtros */}
        <div className="max-w-6xl mx-auto mt-8 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-white/80 mb-2">Estado</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); resetAndApplyFilters(); }}
                className="w-full px-4 py-3 rounded-xl bg-white/90 text-gray-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              >
                <option value="">Todos</option>
                <option value="Upcoming">Próximamente</option>
                <option value="Active">Activo</option>
                <option value="Archived">Archivado</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white/80 mb-2">Tags (coma separados)</label>
              <input
                type="text"
                value={tagsFilter}
                onChange={(e) => { setTagsFilter(e.target.value); resetAndApplyFilters(); }}
                placeholder="mindfulness, grupo, beginner"
                className="w-full px-4 py-3 rounded-xl bg-white/90 text-gray-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-white/80 mb-2">Por página</label>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(1); }}
                className="w-full px-4 py-3 rounded-xl bg-white/90 text-gray-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              >
                <option value={4}>4</option>
                <option value={6}>6</option>
                <option value={8}>8</option>
                <option value={12}>12</option>
              </select>
            </div>
          </div>
        </div>

        {/* Listado de workshops (primero) */}
        <div className="max-w-6xl mx-auto mt-10">
          <h3 className="text-2xl font-bold mb-4" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>Workshops disponibles</h3>
          {filtered.length === 0 ? (
            <p className="text-white/70">Aún no hay workshops creados.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pageItems.map((w) => (
                <div key={w.id} className="rounded-2xl overflow-hidden bg-white/10 border border-white/20 shadow-xl">
                  {w.image ? (
                    <div className="relative w-full h-48 bg-black/20">
                      <img src={resolveIpfsUrl(w.image)} alt={w.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center bg-white/5 text-white/60">Sin imagen</div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xl font-semibold">{w.title}</h4>
                      <span className="text-xs px-2 py-1 rounded-full border border-white/30 text-white/80">{w.status}</span>
                    </div>
                    {w?.creator && (
                      <p className="text-white/70 text-sm mb-1">
                        Por {w.creator.displayName || w.creator.name}
                      </p>
                    )}
                    <p className="text-white/80 text-sm mb-4 line-clamp-3">{w.description}</p>
                    {Array.isArray(w.tags) && w.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {w.tags.map((tg: string, idx: number) => (
                          <span key={idx} className="text-xs px-2 py-1 rounded-full border border-white/20 text-white/70 bg-white/5">{tg}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-white/70 text-sm">Inicio: {new Date(w.startAt).toLocaleString('es-ES')}</span>
                      <div className="flex items-center gap-2">
                        {canEdit(w) && (
                          <button onClick={() => openEdit(w)} className="px-4 py-2 rounded-xl bg-white/20 text-white border border-white/30 hover:bg-white/30">Editar</button>
                        )}
                        <button onClick={() => handleOpenRoom(w)} className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700">Abrir sala</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Paginación */}
          {filtered.length > pageSize && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                className="px-3 py-2 rounded-xl border border-white/30 text-white hover:bg-white/10 disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
              >
                Anterior
              </button>
              <span className="text-white/80 text-sm">
                Página {safePage} de {totalPages}
              </span>
              <button
                className="px-3 py-2 rounded-xl border border-white/30 text-white hover:bg-white/10 disabled:opacity-50"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>

        {/* Crear nuevo Workshop (después) */}
        {esTerapeuta && (
          <div className="w-full mt-10">
            <WorkshopCreation onCreated={async () => { await fetchWorkshops(); }} />
          </div>
        )}

        {toast && (
          <div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-3 rounded-xl border shadow-lg z-50"
            style={{
              background: toast.type === "error"
                ? "rgba(239, 68, 68, 0.95)"
                : toast.type === "success"
                  ? "rgba(16, 185, 129, 0.95)"
                  : "rgba(59, 130, 246, 0.95)",
              borderColor: 'rgba(255,255,255,0.3)',
              color: '#fff'
            }}
          >
            <p className="text-sm font-medium">{toast.text}</p>
          </div>
        )}

        {/* Modal de edición */}
        {isEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
            <div className="w-full max-w-2xl rounded-2xl shadow-2xl" style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Editar Workshop</h2>
                  <button onClick={closeEdit} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-5 text-white">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Título</label>
                  <input name="title" value={editState.title} onChange={handleEditChange} className="w-full px-4 py-3 rounded-xl bg-white/90 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Descripción</label>
                  <textarea name="description" value={editState.description} onChange={handleEditChange} rows={5} className="w-full px-4 py-3 rounded-xl bg-white/90 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Imagen</label>
                  <div className="flex items-center gap-4">
                    <input type="file" accept="image/*" onChange={handleEditImage} className="block w-full text-sm text-white/90 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-white/80 file:text-gray-800 hover:file:bg-white" />
                    {editState.image && <img src={resolveIpfsUrl(editState.image)} alt="preview" className="w-16 h-16 rounded-lg object-cover border border-white/30" />}
                  </div>
                  {isUploading && (<p className="text-white/70 text-sm mt-2">Subiendo imagen...</p>)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Fecha y hora</label>
                    <input type="datetime-local" name="fechaHora" value={editState.fechaHora} onChange={handleEditChange} className="w-full px-4 py-3 rounded-xl bg-white/90 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Capacidad</label>
                    <input type="number" min={1} name="capacity" value={editState.capacity} onChange={handleEditChange} className="w-full px-4 py-3 rounded-xl bg-white/90 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Tags (coma separados)</label>
                    <input name="tags" value={editState.tags} onChange={handleEditChange} placeholder="mindfulness, grupo, beginner" className="w-full px-4 py-3 rounded-xl bg-white/90 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Estado</label>
                    <select name="status" value={editState.status} onChange={handleEditChange} className="w-full px-4 py-3 rounded-xl bg-white/90 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400">
                      <option value="Upcoming">Próximamente</option>
                      <option value="Active">Activo</option>
                      <option value="Archived">Archivado</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={closeEdit} className="px-5 py-2 rounded-xl border border-white/30 text-white hover:bg-white/10">Cancelar</button>
                  <button onClick={saveEdit} disabled={isSaving} className="px-5 py-2 rounded-xl bg-blue-600 text-white disabled:opacity-50">{isSaving ? "Guardando..." : "Guardar"}</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Workshops;

