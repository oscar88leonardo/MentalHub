"use client"
import React, { useEffect, useState } from "react";
import { useCeramic } from "@/context/CeramicContext";

interface EditTherapistProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditTherapistProfileModal: React.FC<EditTherapistProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, therapist, upsertTherapistProfile, authenticateForWrite } = useCeramic();

  const [degrees, setDegrees] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseJurisdiction, setLicenseJurisdiction] = useState("");
  const [licenseCountry, setLicenseCountry] = useState("");
  const [yearsExperience, setYearsExperience] = useState<number | "">("");
  const [approaches, setApproaches] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [populations, setPopulations] = useState("");
  const [bioShort, setBioShort] = useState("");
  const [bioLong, setBioLong] = useState("");
  const [introVideoUrl, setIntroVideoUrl] = useState("");
  const [acceptingNewClients, setAcceptingNewClients] = useState<boolean>(false);
  const [roomId, setRoomId] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  // Estados para creación de sala (Huddle)
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [roomToast, setRoomToast] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setDegrees((therapist?.degrees || []).join(", "));
    setLicenseNumber(therapist?.licenseNumber || "");
    setLicenseJurisdiction(therapist?.licenseJurisdiction || "");
    setLicenseCountry(therapist?.licenseCountry || "");
    setYearsExperience(therapist?.yearsExperience ?? "");
    setApproaches((therapist?.approaches || []).join(", "));
    setSpecialties((therapist?.specialties || []).join(", "));
    setPopulations((therapist?.populations || []).join(", "));
    setBioShort(therapist?.bioShort || "");
    setBioLong(therapist?.bioLong || "");
    setIntroVideoUrl(therapist?.introVideoUrl || "");
    setAcceptingNewClients(!!therapist?.acceptingNewClients);
    setRoomId(therapist?.roomId || "");
    setError(null);
    setSuccess(false);
  }, [isOpen, therapist, profile]);

  const parseList = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
  const toInt = (v: number | "" | undefined | null) => (v === "" || v === undefined || v === null ? undefined : Number(v));

  const handleSave = async () => {
    if (!profile?.id) {
      setError("Debes crear primero el perfil base.");
      return;
    }
    if (!bioShort.trim()) {
      setError("La bio corta es requerida.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await authenticateForWrite();
      await upsertTherapistProfile({
        profileId: profile.id,
        degrees: parseList(degrees),
        licenseNumber,
        licenseJurisdiction,
        licenseCountry,
        yearsExperience: toInt(yearsExperience),
        approaches: parseList(approaches),
        specialties: parseList(specialties),
        populations: parseList(populations),
        bioShort,
        bioLong,
        introVideoUrl,
        acceptingNewClients,
        roomId,
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1200);
    } catch (e: any) {
      setError(e?.message || "Error al guardar el perfil de terapeuta.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (creatingRoom) return;
    setRoomError(null);
    setRoomToast(null);
    if (!profile?.id) {
      setError("Debes crear primero el perfil base.");
      return;
    }
    try {
      setCreatingRoom(true);
      await authenticateForWrite();
      const title = profile?.name?.trim() ? `Sala de ${profile.name}` : "Mi sala";
      const res = await fetch("/api/huddle/createRoom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const json = await res.json();
      if (!res.ok || !json?.roomId) {
        throw new Error(json?.error || "No se pudo crear la sala");
      }
      setRoomId(json.roomId);
      setRoomToast("Sala creada correctamente");
      setTimeout(() => setRoomToast(null), 3000);
    } catch (e: any) {
      setRoomError(e?.message || "Error creando la sala");
    } finally {
      setCreatingRoom(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-4xl rounded-2xl shadow-2xl" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
        {roomToast && (
          <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded shadow">
            {roomToast}
          </div>
        )}
        <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Perfil de Terapeuta</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/90 mb-2">Titulaciones (coma-separados)</label>
              <input className="w-full px-4 py-3 rounded-xl border-0 text-white placeholder-white/60" value={degrees} onChange={e=>setDegrees(e.target.value)} placeholder="Psicóloga, ..." style={{ background:'rgba(255,255,255,0.1)' }} />
            </div>
            <div>
              <label className="block text-white/90 mb-2">Nº Licencia</label>
              <input className="w-full px-4 py-3 rounded-xl border-0 text-white placeholder-white/60" value={licenseNumber} onChange={e=>setLicenseNumber(e.target.value)} style={{ background:'rgba(255,255,255,0.1)' }} />
            </div>
            <div>
              <label className="block text-white/90 mb-2">Jurisdicción Licencia</label>
              <input className="w-full px-4 py-3 rounded-xl border-0 text-white placeholder-white/60" value={licenseJurisdiction} onChange={e=>setLicenseJurisdiction(e.target.value)} style={{ background:'rgba(255,255,255,0.1)' }} />
            </div>
            <div>
              <label className="block text-white/90 mb-2">País Licencia (ISO-2)</label>
              <input className="w-full px-4 py-3 rounded-xl border-0 text-white placeholder-white/60" value={licenseCountry} onChange={e=>setLicenseCountry(e.target.value)} placeholder="AR, CO, US, ..." style={{ background:'rgba(255,255,255,0.1)' }} />
            </div>
            <div>
              <label className="block text-white/90 mb-2">Años de experiencia</label>
              <input type="number" className="w-full px-4 py-3 rounded-xl border-0 text-white placeholder-white/60" value={yearsExperience} onChange={e=>setYearsExperience(e.target.value === "" ? "" : Number(e.target.value))} style={{ background:'rgba(255,255,255,0.1)' }} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-white/90 mb-2">Bio corta (≤280) *</label>
              <input className="w-full px-4 py-3 rounded-xl border-0 text-white placeholder-white/60" value={bioShort} onChange={e=>setBioShort(e.target.value)} maxLength={280} style={{ background:'rgba(255,255,255,0.1)' }} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-white/90 mb-2">Bio larga (≤1200)</label>
              <textarea className="w-full px-4 py-3 rounded-xl border-0 text-white placeholder-white/60 min-h-[120px]" value={bioLong} onChange={e=>setBioLong(e.target.value)} maxLength={1200} style={{ background:'rgba(255,255,255,0.1)' }} />
            </div>
            <div>
              <label className="block text-white/90 mb-2">Video de presentación (URL)</label>
              <input className="w-full px-4 py-3 rounded-xl border-0 text-white placeholder-white/60" value={introVideoUrl} onChange={e=>setIntroVideoUrl(e.target.value)} placeholder="https://..." style={{ background:'rgba(255,255,255,0.1)' }} />
            </div>
            <div>
              <label className="block text-white/90 mb-2">Acepta nuevos consultantes</label>
              <input type="checkbox" checked={acceptingNewClients} onChange={e=>setAcceptingNewClients(e.target.checked)} />
              <p className="text-white/60 text-xs mt-1">Activa esta opción para recibir solicitudes de nuevos consultantes.</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-white/90 mb-2">Mi sala</label>
              <div className="flex items-center gap-3">
                <input
                  className="flex-1 w-full px-4 py-3 rounded-xl border-0 text-white placeholder-white/60"
                  value={roomId}
                  readOnly
                  placeholder="Ej.: abc-xyz-123"
                  style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)' }}
                />
                <button
                  type="button"
                  onClick={handleCreateRoom}
                  disabled={creatingRoom || !profile || !!roomId}
                  className="px-4 py-3 rounded-xl bg-blue-600 text-white disabled:opacity-50"
                  title={roomId ? "La sala ya fue creada" : "Crear una nueva sala en Huddle"}
                >
                  {creatingRoom ? "Creando..." : "Crear sala"}
                </button>
              </div>
              {roomError && <div className="mt-2 text-sm text-red-200">{roomError}</div>}
              <p className="text-white/60 text-xs mt-1">
                Usa “Crear sala” para generar un Room ID.
              </p>
            </div>
          </div>

          {error && <div className="p-3 rounded border border-red-400 bg-red-50/20 text-red-200">{error}</div>}
          {success && <div className="p-3 rounded border border-green-400 bg-green-50/20 text-green-200">Guardado</div>}
        </div>
        <div className="p-6 border-t flex justify-end space-x-3" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
          <button onClick={onClose} className="px-6 py-3 rounded-xl border border-white/30 text-white hover:bg-white/10">Cancelar</button>
          <button onClick={handleSave} disabled={isLoading || !bioShort} className="px-6 py-3 rounded-xl text-white" style={{ background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.3)' }}>
            {isLoading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTherapistProfileModal;


