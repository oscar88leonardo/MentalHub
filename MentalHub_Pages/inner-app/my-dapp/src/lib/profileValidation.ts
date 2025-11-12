import { InnerverProfile, TherapistProfile, ConsultantProfile } from "@/context/CeramicContext";

/**
 * Valida si el perfil básico está completo
 * Campos requeridos: name (≥3 caracteres), rol (Terapeuta o Consultante)
 */
export const isBasicProfileComplete = (profile: InnerverProfile | null): boolean => {
  if (!profile) return false;
  const trimmedName = profile.name?.trim() || "";
  return (
    trimmedName.length >= 3 &&
    !!profile.rol &&
    (profile.rol === "Terapeuta" || profile.rol === "Consultante")
  );
};

/**
 * Valida si el perfil de terapeuta está completo
 * Campos requeridos: bioShort (no vacío)
 */
export const isTherapistProfileComplete = (therapist: TherapistProfile | null): boolean => {
  if (!therapist) return false;
  return !!(therapist.bioShort && therapist.bioShort.trim().length > 0);
};

/**
 * Valida si el perfil de consultante está completo
 * Campos requeridos: presentingProblemShort (no vacío)
 */
export const isConsultantProfileComplete = (consultant: ConsultantProfile | null): boolean => {
  if (!consultant) return false;
  return !!(consultant.presentingProblemShort && consultant.presentingProblemShort.trim().length > 0);
};

/**
 * Determina qué modal debe mostrarse forzado según el estado del perfil
 * Retorna 'basic' si falta perfil básico, 'therapist' si falta perfil de terapeuta,
 * 'consultant' si falta perfil de consultante, o null si todo está completo
 */
export const getRequiredModal = (
  profile: InnerverProfile | null,
  therapist: TherapistProfile | null,
  consultant: ConsultantProfile | null
): 'basic' | 'therapist' | 'consultant' | null => {
  if (!isBasicProfileComplete(profile)) {
    return 'basic';
  }
  if (profile?.rol === 'Terapeuta' && !isTherapistProfileComplete(therapist)) {
    return 'therapist';
  }
  if (profile?.rol === 'Consultante' && !isConsultantProfileComplete(consultant)) {
    return 'consultant';
  }
  return null;
};

