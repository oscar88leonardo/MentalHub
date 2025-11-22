"use client"
import React, { useEffect, useState } from "react";
import { useCeramic, TherapistProfile } from "@/context/CeramicContext";
import { countries } from "@/lib/countries";
import { mentalHealthDegrees } from "@/lib/mentalHealthDegrees";
import { isTherapistProfileComplete } from "@/lib/profileValidation";
import { therapeuticApproaches } from "@/lib/therapeuticApproaches";
import { therapistSpecialties } from "@/lib/therapistSpecialties";
import { therapistPopulations } from "@/lib/therapistPopulations";

interface EditTherapistProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  isForced?: boolean;
  onSave?: () => void; // Callback opcional que se llama solo cuando se guarda exitosamente
}

const EditTherapistProfileModal: React.FC<EditTherapistProfileModalProps> = ({ isOpen, onClose, isForced = false, onSave }) => {
  const { profile, therapist, upsertTherapistProfile, authenticateForWrite, adminAccount } = useCeramic() as any;

  const MAX_DEGREES = 6;
  const MAX_APPROACHES = 9;
  const MAX_SPECIALTIES = 8;
  const MAX_POPULATIONS = 9;

  const [degrees, setDegrees] = useState<string[]>([]);
  const [customDegree, setCustomDegree] = useState("");
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
  // Inputs para chips
  const [approachInput, setApproachInput] = useState("");
  const [specialtyInput, setSpecialtyInput] = useState("");
  const [populationInput, setPopulationInput] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setDegrees(therapist?.degrees || []);
    setCustomDegree("");
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
  const sanitize = (s: string) => s.trim().replace(/\s+/g, " ");
  const addChip = (
    value: string,
    current: string,
    setFn: (s: string) => void,
    limit: number
  ) => {
    const token = sanitize(value);
    if (!token) return;
    const list = parseList(current);
    if (list.length >= limit) return;
    if (list.includes(token)) return;
    if (token.length > 32) return; // respeta @string(maxLength: 32)
    setFn([...list, token].join(", "));
  };
  const removeChip = (value: string, current: string, setFn: (s: string) => void) => {
    const next = parseList(current).filter(x => x !== value);
    setFn(next.join(", "));
  };
  const toggleChip = (
    token: string,
    current: string,
    setFn: (s: string) => void,
    limit: number
  ) => {
    const list = parseList(current);
    if (list.includes(token)) {
      setFn(list.filter(x => x !== token).join(", "));
    } else if (list.length < limit) {
      setFn([...list, token].join(", "));
    }
  };

  const handleDegreeToggle = (degree: string) => {
    setDegrees(prev => {
      if (prev.includes(degree)) return prev.filter(d => d !== degree);
      if (prev.length >= MAX_DEGREES) return prev;
      return [...prev, degree];
    });
  };

  const handleAddCustomDegree = () => {
    const token = customDegree.trim();
    if (!token) return;
    if (degrees.includes(token)) return;
    if (degrees.length >= MAX_DEGREES) return;
    setDegrees(prev => [...prev, token]);
    setCustomDegree("");
  };

  const handleRemoveDegree = (degree: string) => {
    setDegrees(prev => prev.filter(d => d !== degree));
  };

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
      
      // Verificar y crear sala automáticamente si no existe
      let finalRoomId = roomId;
      if (!finalRoomId) {
        try {
          const title = profile?.name?.trim() ? `Sala de ${profile.name}` : "Mi sala";
          const res = await fetch("/api/huddle/createRoom", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title }),
          });
          const json = await res.json();
          if (res.ok && json?.roomId) {
            finalRoomId = json.roomId;
            setRoomId(finalRoomId); // Actualizar estado para mostrar en UI
          } else {
            console.warn("No se pudo crear la sala automáticamente:", json?.error);
            // Continuar con el guardado aunque falle la creación de sala
          }
        } catch (roomError) {
          console.error("Error creando sala automáticamente:", roomError);
          // Continuar con el guardado aunque falle la creación de sala
        }
      }
      
      const updatedTherapistId = await upsertTherapistProfile({
        profileId: profile.id,
        degrees: degrees,
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
        roomId: finalRoomId,
        // Guardado invisible de AdminAccount (EOA)
        adminAddress: (() => {
          const addr = String(adminAccount?.address || "").toLowerCase();
          return /^0x[a-f0-9]{40}$/.test(addr) ? addr : therapist?.adminAddress;
        })(),
      });
      
      // Construir el objeto TherapistProfile con los datos guardados para validación
      const updatedTherapist: TherapistProfile | null = updatedTherapistId ? {
        id: updatedTherapistId,
        profileId: profile.id,
        degrees: degrees,
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
        roomId: finalRoomId,
      } : null;
      
      // Verificar si el perfil está completo después de guardar
      const profileComplete = isTherapistProfileComplete(updatedTherapist);
      
      // Mostrar advertencia si no se pudo crear la sala
      if (!finalRoomId) {
        setError("Perfil guardado, pero no se pudo crear la sala. Es importante tener una sala para las videollamadas. Por favor, usa 'Renovar sala' después de guardar.");
      } else {
        setSuccess(true);
      }
      
      // Solo cerrar si el perfil está completo o si no está forzado
      if (profileComplete || !isForced) {
        // Llamar onSave si existe (solo cuando se guarda exitosamente)
        if (onSave) {
          onSave();
        }
        if (finalRoomId) {
          setTimeout(() => {
            onClose();
            setSuccess(false);
          }, 1200);
        }
      } else {
        // Si está forzado y no está completo, mostrar mensaje
        setError("Por favor completa todos los campos requeridos (bio corta)");
        setSuccess(false);
      }
    } catch (e: any) {
      setError(e?.message || "Error al guardar el perfil de terapeuta.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenewRoom = async () => {
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
        throw new Error(json?.error || "No se pudo renovar la sala");
      }
      const newRoomId = json.roomId;
      setRoomId(newRoomId);
      
      // Actualizar automáticamente en Ceramic
      try {
        await upsertTherapistProfile({
          profileId: profile.id,
          roomId: newRoomId,
        });
        setRoomToast("Sala renovada y guardada correctamente");
      } catch (saveError: any) {
        console.error("Error guardando sala renovada:", saveError);
        setRoomError("Sala renovada pero no se pudo guardar. Por favor, guarda el perfil manualmente.");
        setRoomToast("Sala renovada (pendiente de guardar)");
      }
      setTimeout(() => setRoomToast(null), 3000);
    } catch (e: any) {
      setRoomError(e?.message || "Error renovando la sala");
    } finally {
      setCreatingRoom(false);
    }
  };

  const handleClose = () => {
    // Si está forzado, verificar que el perfil esté completo antes de permitir cerrar
    if (isForced) {
      if (!bioShort || !bioShort.trim()) {
        setError("Por favor completa todos los campos requeridos (bio corta) antes de continuar");
        return;
      }
    }
    
    setError(null);
    setSuccess(false);
    onClose();
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
            {!isForced && (
              <button onClick={handleClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            {isForced && (
              <div className="w-8 h-8 flex items-center justify-center">
                <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            )}
          </div>
          <p className="text-white/80 mt-2">
            {isForced 
              ? 'Completa tu perfil de terapeuta para continuar. Este paso es obligatorio.'
              : 'Actualiza tu información profesional'}
          </p>
        </div>
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-white/90 mb-2">Titulaciones</label>
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  {mentalHealthDegrees.map((degree) => {
                    const isSelected = degrees.includes(degree);
                    return (
                      <label
                        key={degree}
                        className="flex items-center space-x-2 text-white/90 cursor-pointer p-2 rounded-lg hover:bg-white/5"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleDegreeToggle(degree)}
                          disabled={!isSelected && degrees.length >= MAX_DEGREES}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-sm">{degree}</span>
                      </label>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customDegree}
                    onChange={(e) => setCustomDegree(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomDegree();
                      }
                    }}
                    placeholder="Escribe una titulación personalizada"
                    className="flex-1 px-4 py-2 rounded-xl border-0 text-white placeholder-white/60 text-sm"
                    style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomDegree}
                    disabled={!customDegree.trim() || degrees.includes(customDegree.trim()) || degrees.length >= MAX_DEGREES}
                    className="px-4 py-2 rounded-xl text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}
                  >
                    Agregar
                  </button>
                </div>
                {degrees.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {degrees.map((degree) => (
                      <span
                        key={degree}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm text-white"
                        style={{ background: 'rgba(255,255,255,0.2)' }}
                      >
                        {degree}
                        <button
                          type="button"
                          onClick={() => handleRemoveDegree(degree)}
                          className="ml-1 hover:text-red-300"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-white/60 text-xs">Máximo {MAX_DEGREES}</p>
              </div>
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
              <select
                value={licenseCountry}
                onChange={(e) => setLicenseCountry(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-0 text-white"
                style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                <option value="" className="bg-gray-800 text-white">Selecciona un país</option>
                {countries.map((c) => (
                  <option key={c.code} value={c.code} className="bg-gray-800 text-white">
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white/90 mb-2">Años de experiencia</label>
              <input type="number" className="w-full px-4 py-3 rounded-xl border-0 text-white placeholder-white/60" value={yearsExperience} onChange={e=>setYearsExperience(e.target.value === "" ? "" : Number(e.target.value))} style={{ background:'rgba(255,255,255,0.1)' }} />
            </div>
            {/* Enfoques (sugerencias + chips, máx 9) */}
            <div className="md:col-span-2">
              <label className="block text-white/90 mb-2">Enfoques</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                {therapeuticApproaches.map((opt) => {
                  const list = parseList(approaches);
                  const isSelected = list.includes(opt);
                  const atCap = list.length >= MAX_APPROACHES;
                  return (
                    <label key={opt} className="flex items-center space-x-2 text-white/90 cursor-pointer p-2 rounded-lg hover:bg-white/5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={!isSelected && atCap}
                        onChange={() => toggleChip(opt, approaches, setApproaches, MAX_APPROACHES)}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm">{opt}</span>
                    </label>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {parseList(approaches).map((item) => (
                  <span key={item} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm text-white" style={{ background: 'rgba(255,255,255,0.2)' }}>
                    {item}
                    <button
                      type="button"
                      onClick={() => removeChip(item, approaches, setApproaches)}
                      className="ml-1 hover:text-red-300"
                      aria-label={`Quitar ${item}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={approachInput}
                  onChange={(e) => setApproachInput(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === ",") && approachInput.trim()) {
                      e.preventDefault();
                      addChip(approachInput, approaches, setApproaches, MAX_APPROACHES);
                      setApproachInput("");
                    }
                  }}
                  maxLength={32}
                  placeholder="Agregar enfoque y presiona Enter"
                  className="flex-1 px-4 py-2 rounded-xl border-0 text-white placeholder-white/60 text-sm"
                  style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}
                />
                <button
                  type="button"
                  onClick={() => { addChip(approachInput, approaches, setApproaches, MAX_APPROACHES); setApproachInput(""); }}
                  disabled={!approachInput.trim() || parseList(approaches).length >= MAX_APPROACHES}
                  className="px-4 py-2 rounded-xl text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}
                >
                  Agregar
                </button>
              </div>
              <p className="text-white/60 text-xs mt-1">Máximo {MAX_APPROACHES}</p>
            </div>
            {/* Especialidades (sugerencias + chips, máx 8 por el modelo) */}
            <div className="md:col-span-2">
              <label className="block text-white/90 mb-2">Especialidades</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                {therapistSpecialties.map((opt) => {
                  const list = parseList(specialties);
                  const isSelected = list.includes(opt);
                  const atCap = list.length >= MAX_SPECIALTIES;
                  return (
                    <label key={opt} className="flex items-center space-x-2 text-white/90 cursor-pointer p-2 rounded-lg hover:bg-white/5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={!isSelected && atCap}
                        onChange={() => toggleChip(opt, specialties, setSpecialties, MAX_SPECIALTIES)}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm">{opt}</span>
                    </label>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {parseList(specialties).map((item) => (
                  <span key={item} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm text-white" style={{ background: 'rgba(255,255,255,0.2)' }}>
                    {item}
                    <button
                      type="button"
                      onClick={() => removeChip(item, specialties, setSpecialties)}
                      className="ml-1 hover:text-red-300"
                      aria-label={`Quitar ${item}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={specialtyInput}
                  onChange={(e) => setSpecialtyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === ",") && specialtyInput.trim()) {
                      e.preventDefault();
                      addChip(specialtyInput, specialties, setSpecialties, MAX_SPECIALTIES);
                      setSpecialtyInput("");
                    }
                  }}
                  maxLength={32}
                  placeholder="Agregar especialidad y presiona Enter"
                  className="flex-1 px-4 py-2 rounded-xl border-0 text-white placeholder-white/60 text-sm"
                  style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}
                />
                <button
                  type="button"
                  onClick={() => { addChip(specialtyInput, specialties, setSpecialties, MAX_SPECIALTIES); setSpecialtyInput(""); }}
                  disabled={!specialtyInput.trim() || parseList(specialties).length >= MAX_SPECIALTIES}
                  className="px-4 py-2 rounded-xl text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}
                >
                  Agregar
                </button>
              </div>
              <p className="text-white/60 text-xs mt-1">Máximo {MAX_SPECIALTIES}</p>
            </div>
            {/* Poblaciones (sugerencias + chips, máx 9) */}
            <div className="md:col-span-2">
              <label className="block text-white/90 mb-2">Poblaciones</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                {therapistPopulations.map((opt) => {
                  const list = parseList(populations);
                  const isSelected = list.includes(opt);
                  const atCap = list.length >= MAX_POPULATIONS;
                  return (
                    <label key={opt} className="flex items-center space-x-2 text-white/90 cursor-pointer p-2 rounded-lg hover:bg-white/5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={!isSelected && atCap}
                        onChange={() => toggleChip(opt, populations, setPopulations, MAX_POPULATIONS)}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm">{opt}</span>
                    </label>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {parseList(populations).map((item) => (
                  <span key={item} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm text-white" style={{ background: 'rgba(255,255,255,0.2)' }}>
                    {item}
                    <button
                      type="button"
                      onClick={() => removeChip(item, populations, setPopulations)}
                      className="ml-1 hover:text-red-300"
                      aria-label={`Quitar ${item}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={populationInput}
                  onChange={(e) => setPopulationInput(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === ",") && populationInput.trim()) {
                      e.preventDefault();
                      addChip(populationInput, populations, setPopulations, MAX_POPULATIONS);
                      setPopulationInput("");
                    }
                  }}
                  maxLength={32}
                  placeholder="Agregar población y presiona Enter"
                  className="flex-1 px-4 py-2 rounded-xl border-0 text-white placeholder-white/60 text-sm"
                  style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}
                />
                <button
                  type="button"
                  onClick={() => { addChip(populationInput, populations, setPopulations, MAX_POPULATIONS); setPopulationInput(""); }}
                  disabled={!populationInput.trim() || parseList(populations).length >= MAX_POPULATIONS}
                  className="px-4 py-2 rounded-xl text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}
                >
                  Agregar
                </button>
              </div>
              <p className="text-white/60 text-xs mt-1">Máximo {MAX_POPULATIONS}</p>
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
                  placeholder={roomId ? roomId : "Se creará automáticamente al guardar"}
                  style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)' }}
                />
                {roomId && (
                  <button
                    type="button"
                    onClick={handleRenewRoom}
                    disabled={creatingRoom || !profile}
                    className="px-4 py-3 rounded-xl bg-orange-600 text-white disabled:opacity-50 hover:bg-orange-700 transition-colors"
                    title="Renovar la sala (útil si hay problemas con la actual)"
                  >
                    {creatingRoom ? "Renovando..." : "Renovar sala"}
                  </button>
                )}
              </div>
              {roomError && <div className="mt-2 text-sm text-red-200">{roomError}</div>}
              {!roomId && (
                <div className="mt-2 p-3 rounded-lg border border-yellow-400/50 bg-yellow-500/10">
                  <p className="text-yellow-200 text-sm">
                    <strong>⚠️ Importante:</strong> La sala de videollamadas es esencial para tu práctica. 
                    Se creará automáticamente al guardar. Si no se crea, usa &quot;Renovar sala&quot; después de guardar.
                  </p>
                </div>
              )}
              {roomId && (
                <p className="text-white/60 text-xs mt-1">
                  Tu sala está configurada. Usa &quot;Renovar sala&quot; solo si hay problemas técnicos con la sala actual.
                </p>
              )}
            </div>
          </div>

          {error && <div className="p-3 rounded border border-red-400 bg-red-50/20 text-red-200">{error}</div>}
          {success && <div className="p-3 rounded border border-green-400 bg-green-50/20 text-green-200">Guardado</div>}
        </div>
        <div className="p-6 border-t flex justify-end space-x-3" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
          {!isForced && (
            <button onClick={handleClose} className="px-6 py-3 rounded-xl border border-white/30 text-white hover:bg-white/10">Cancelar</button>
          )}
          <button onClick={handleSave} disabled={isLoading || !bioShort} className="px-6 py-3 rounded-xl text-white" style={{ background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.3)' }}>
            {isLoading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTherapistProfileModal;


