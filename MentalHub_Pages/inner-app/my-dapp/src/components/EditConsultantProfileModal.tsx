"use client"
import React, { useEffect, useState } from "react";
import { useCeramic } from "@/context/CeramicContext";

interface EditConsultantProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditConsultantProfileModal: React.FC<EditConsultantProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, consultant, upsertConsultantProfile, authenticateForWrite } = useCeramic();

  const [presentingProblemShort, setPresentingProblemShort] = useState("");
  const [goals, setGoals] = useState("");
  const [therapistGenderPreference, setTherapistGenderPreference] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhoneE164, setEmergencyContactPhoneE164] = useState("");
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [consentTelehealthRisks, setConsentTelehealthRisks] = useState(false);
  const [consentedAt, setConsentedAt] = useState("");
  const [priorTherapy, setPriorTherapy] = useState<boolean>(false);
  const [priorPsychiatry, setPriorPsychiatry] = useState<boolean>(false);
  const [medicationsUsed, setMedicationsUsed] = useState<boolean>(false);
  const [medicationsNote, setMedicationsNote] = useState("");
  const [diagnoses, setDiagnoses] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setPresentingProblemShort(consultant?.presentingProblemShort || "");
    setGoals((consultant?.goals || []).join(", "));
    setTherapistGenderPreference(consultant?.therapistGenderPreference || "");
    setEmergencyContactName(consultant?.emergencyContactName || "");
    setEmergencyContactPhoneE164(consultant?.emergencyContactPhoneE164 || "");
    setConsentTerms(!!consultant?.consentTerms);
    setConsentPrivacy(!!consultant?.consentPrivacy);
    setConsentTelehealthRisks(!!consultant?.consentTelehealthRisks);
    setConsentedAt(consultant?.consentedAt ? consultant.consentedAt.substring(0, 16) : "");
    setPriorTherapy(!!consultant?.priorTherapy);
    setPriorPsychiatry(!!consultant?.priorPsychiatry);
    setMedicationsUsed(!!consultant?.medicationsUsed);
    setMedicationsNote(consultant?.medicationsNote || "");
    setDiagnoses((consultant?.diagnoses || []).join(", "));
    setError(null);
    setSuccess(false);
  }, [isOpen, consultant]);

  const parseList = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

  const handleSave = async () => {
    if (!profile?.id) {
      setError("Debes crear primero el perfil base.");
      return;
    }
    if (!presentingProblemShort.trim()) {
      setError("El motivo breve es requerido.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await authenticateForWrite();
      await upsertConsultantProfile({
        profileId: profile.id,
        presentingProblemShort,
        goals: parseList(goals),
        therapistGenderPreference,
        emergencyContactName,
        emergencyContactPhoneE164,
        consentTerms,
        consentPrivacy,
        consentTelehealthRisks,
        consentedAt: consentedAt ? new Date(consentedAt).toISOString() : undefined,
        priorTherapy,
        priorPsychiatry,
        medicationsUsed,
        medicationsNote,
        diagnoses: parseList(diagnoses),
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1200);
    } catch (e: any) {
      setError(e?.message || "Error al guardar el perfil de consultante.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-4xl rounded-2xl shadow-2xl" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
        <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Perfil de Consultante</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-white/90 mb-2">Motivo breve *</label>
              <input className="w-full px-4 py-3 rounded-xl border-0 text-white placeholder-white/60" value={presentingProblemShort} onChange={e=>setPresentingProblemShort(e.target.value)} maxLength={240} placeholder="Ej.: Ansiedad e insomnio." style={{ background:'rgba(255,255,255,0.1)' }} />
            </div>
            <div>
              <label className="block text-white/90 mb-2">Objetivos (coma-separados, máx 3)</label>
              <input className="w-full px-4 py-3 rounded-xl border-0 text-white placeholder-white/60" value={goals} onChange={e=>setGoals(e.target.value)} placeholder="Dormir 7–8 h, Reducir rumiación, ..." style={{ background:'rgba(255,255,255,0.1)' }} />
            </div>
            <div>
              <label className="block text-white/90 mb-2">Preferencia de género terapeuta</label>
              <input className="w-full px-4 py-3 rounded-xl border-0 text-white placeholder-white/60" value={therapistGenderPreference} onChange={e=>setTherapistGenderPreference(e.target.value)} placeholder="F / M / ..." style={{ background:'rgba(255,255,255,0.1)' }} />
            </div>
            <div>
              <label className="block text-white/90 mb-2">Contacto de emergencia (nombre)</label>
              <input className="w-full px-4 py-3 rounded-xl border-0 text-white placeholder-white/60" value={emergencyContactName} onChange={e=>setEmergencyContactName(e.target.value)} style={{ background:'rgba(255,255,255,0.1)' }} />
            </div>
            <div>
              <label className="block text-white/90 mb-2">Contacto de emergencia (tel E.164)</label>
              <input className="w-full px-4 py-3 rounded-xl border-0 text-white placeholder-white/60" value={emergencyContactPhoneE164} onChange={e=>setEmergencyContactPhoneE164(e.target.value)} placeholder="+54911..." style={{ background:'rgba(255,255,255,0.1)' }} />
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="flex items-center space-x-2 text-white/90">
                  <input type="checkbox" checked={consentTerms} onChange={e=>setConsentTerms(e.target.checked)} />
                  <span>Términos</span>
                </label>
                <p className="text-white/60 text-xs mt-1">Confirma que aceptas los términos y condiciones del servicio.</p>
              </div>
              <div>
                <label className="flex items-center space-x-2 text-white/90">
                  <input type="checkbox" checked={consentPrivacy} onChange={e=>setConsentPrivacy(e.target.checked)} />
                  <span>Privacidad</span>
                </label>
                <p className="text-white/60 text-xs mt-1">Autorizas el tratamiento de tus datos personales según la política de privacidad.</p>
              </div>
              <div>
                <label className="flex items-center space-x-2 text-white/90">
                  <input type="checkbox" checked={consentTelehealthRisks} onChange={e=>setConsentTelehealthRisks(e.target.checked)} />
                  <span>Riesgos tele-salud</span>
                </label>
                <p className="text-white/60 text-xs mt-1">Reconoces los riesgos asociados a la atención psicológica a distancia.</p>
              </div>
            </div>
            <div>
              <label className="block text-white/90 mb-2">Fecha/hora de consentimiento</label>
              <input type="datetime-local" className="w-full px-4 py-3 rounded-xl border-0 text-white placeholder-white/60" value={consentedAt} onChange={e=>setConsentedAt(e.target.value)} style={{ background:'rgba(255,255,255,0.1)' }} />
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="flex items-center space-x-2 text-white/90">
                  <input type="checkbox" checked={priorTherapy} onChange={e=>setPriorTherapy(e.target.checked)} />
                  <span>Terapia previa</span>
                </label>
                <p className="text-white/60 text-xs mt-1">Indica si has participado previamente en procesos de psicoterapia.</p>
              </div>
              <div>
                <label className="flex items-center space-x-2 text-white/90">
                  <input type="checkbox" checked={priorPsychiatry} onChange={e=>setPriorPsychiatry(e.target.checked)} />
                  <span>Psiquiatría previa</span>
                </label>
                <p className="text-white/60 text-xs mt-1">Señala si has recibido atención psiquiátrica anteriormente.</p>
              </div>
              <div>
                <label className="flex items-center space-x-2 text-white/90">
                  <input type="checkbox" checked={medicationsUsed} onChange={e=>setMedicationsUsed(e.target.checked)} />
                  <span>Usa medicación</span>
                </label>
                <p className="text-white/60 text-xs mt-1">Indica si actualmente consumes medicación prescrita.</p>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-white/90 mb-2">Nota sobre medicación (≤120)</label>
              <input className="w-full px-4 py-3 rounded-xl border-0 text-white placeholder-white/60" value={medicationsNote} onChange={e=>setMedicationsNote(e.target.value)} maxLength={120} style={{ background:'rgba(255,255,255,0.1)' }} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-white/90 mb-2">Diagnósticos (coma-separados)</label>
              <input className="w-full px-4 py-3 rounded-xl border-0 text-white placeholder-white/60" value={diagnoses} onChange={e=>setDiagnoses(e.target.value)} placeholder="prefiero-no-decir, ..." style={{ background:'rgba(255,255,255,0.1)' }} />
            </div>
          </div>
          {error && <div className="p-3 rounded border border-red-400 bg-red-50/20 text-red-200">{error}</div>}
          {success && <div className="p-3 rounded border border-green-400 bg-green-50/20 text-green-200">Guardado</div>}
        </div>
        <div className="p-6 border-t flex justify-end space-x-3" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
          <button onClick={onClose} className="px-6 py-3 rounded-xl border border-white/30 text-white hover:bg-white/10">Cancelar</button>
          <button onClick={handleSave} disabled={isLoading || !presentingProblemShort} className="px-6 py-3 rounded-xl text-white" style={{ background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.3)' }}>
            {isLoading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditConsultantProfileModal;


