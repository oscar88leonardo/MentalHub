/**
 * Servicio para leer y escribir perfiles InnerverProfile, TherapistProfile y ConsultantProfile en ceramic-one.
 * Usa ModelInstanceClient para operaciones reales contra el nodo.
 */
import { CeramicClient } from "@ceramic-sdk/http-client";
import { ModelInstanceClient } from "@ceramic-sdk/model-instance-client";
import { StreamID } from "@ceramic-sdk/identifiers";
import { getDeterministicStreamID } from "@ceramic-sdk/model-instance-protocol";
import { MODEL_IDS } from "./ceramicModels";
import type {
  InnerverProfile,
  TherapistProfile,
  ConsultantProfile,
} from "@/context/CeramicContext";

const INNERVER_MODEL = StreamID.fromString(MODEL_IDS.InnerverProfile);
const THERAPIST_MODEL = StreamID.fromString(MODEL_IDS.TherapistProfile);
const CONSULTANT_MODEL = StreamID.fromString(MODEL_IDS.ConsultantProfile);

/** Construye DID pkh desde address y chainId.
 * Ceramic requiere address en minúsculas para creación determinística de streams (CAIP-10). */
export function didFromAddress(address: string, chainId: number): string {
  return `did:pkh:eip155:${chainId}:${address.toLowerCase()}`;
}

function requirePkhDid(did: string, label: string): void {
  if (!did.startsWith("did:pkh:")) {
    throw new Error(
      `${label} requiere did:pkh (ej. did:pkh:eip155:100:0x...). Recibido: ${did.slice(0, 20)}...`
    );
  }
}

/** Obtiene el stream ID del perfil para un controller (DID).
 * Requiere did:pkh (CAIP-10); did:key causa "Invalid digest" en getDeterministicStreamID. */
export function getProfileStreamID(controllerDid: string): StreamID {
  requirePkhDid(controllerDid, "getProfileStreamID");
  const header = {
    controllers: [controllerDid],
    model: INNERVER_MODEL,
    sep: "model" as const,
  };
  return getDeterministicStreamID(header as any);
}

function getStreamIDForModel(controllerDid: string, model: StreamID): StreamID {
  requirePkhDid(controllerDid, "getStreamIDForModel");
  const header = {
    controllers: [controllerDid],
    model,
    sep: "model" as const,
  };
  return getDeterministicStreamID(header as any);
}

/** Mapea content del documento a InnerverProfile */
function toInnerverProfile(
  streamId: string,
  content: Record<string, unknown> | null
): InnerverProfile | null {
  if (!content || typeof content !== "object") return null;
  const c = content as Record<string, unknown>;
  return {
    id: streamId,
    name: (c.name as string) ?? "",
    displayName: (c.displayName as string) ?? (c.name as string) ?? "",
    rol: (c.rol as "Terapeuta" | "Consultante") ?? "Consultante",
    pfp: c.pfp as string | undefined,
    email: c.email as string | undefined,
    gender: c.gender as "Masculino" | "Femenino" | undefined,
    birthDate: c.birthDate as string | undefined,
    country: c.country as string | undefined,
    city: c.city as string | undefined,
    timezone: c.timezone as string | undefined,
    languages: c.languages as string[] | undefined,
    primaryLanguage: c.primaryLanguage as string | undefined,
    created: c.created as string | undefined,
    createdAt: c.createdAt as string | undefined,
    currencies: c.currencies as string[] | undefined,
    ratesByCurrency: c.ratesByCurrency as string[] | undefined,
    socialInstagram: c.socialInstagram as string | undefined,
    socialLinkedin: c.socialLinkedin as string | undefined,
    socialFacebook: c.socialFacebook as string | undefined,
    socialX: c.socialX as string | undefined,
  };
}

function toTherapistProfile(
  streamId: string,
  content: Record<string, unknown> | null,
  profileId: string
): TherapistProfile | null {
  if (!content || typeof content !== "object") return null;
  const c = content as Record<string, unknown>;
  return {
    id: streamId,
    profileId: (c.profileId as string) || profileId,
    degrees: c.degrees as string[] | undefined,
    licenseNumber: c.licenseNumber as string | undefined,
    licenseJurisdiction: c.licenseJurisdiction as string | undefined,
    licenseCountry: c.licenseCountry as string | undefined,
    yearsExperience: c.yearsExperience as number | undefined,
    approaches: c.approaches as string[] | undefined,
    specialties: c.specialties as string[] | undefined,
    populations: c.populations as string[] | undefined,
    bioShort: (c.bioShort as string) ?? "",
    bioLong: c.bioLong as string | undefined,
    introVideoUrl: c.introVideoUrl as string | undefined,
    acceptingNewClients: c.acceptingNewClients as boolean | undefined,
    roomId: c.roomId as string | undefined,
  };
}

function toConsultantProfile(
  streamId: string,
  content: Record<string, unknown> | null,
  profileId: string
): ConsultantProfile | null {
  if (!content || typeof content !== "object") return null;
  const c = content as Record<string, unknown>;
  return {
    id: streamId,
    profileId: (c.profileId as string) || profileId,
    presentingProblemShort: (c.presentingProblemShort as string) ?? "",
    goals: c.goals as string[] | undefined,
    therapistGenderPreference: c.therapistGenderPreference as string | undefined,
    emergencyContactName: c.emergencyContactName as string | undefined,
    emergencyContactPhoneE164: c.emergencyContactPhoneE164 as string | undefined,
    consentTerms: c.consentTerms as boolean | undefined,
    consentPrivacy: c.consentPrivacy as boolean | undefined,
    consentTelehealthRisks: c.consentTelehealthRisks as boolean | undefined,
    consentedAt: c.consentedAt as string | undefined,
    priorTherapy: c.priorTherapy as boolean | undefined,
    priorPsychiatry: c.priorPsychiatry as boolean | undefined,
    medicationsUsed: c.medicationsUsed as boolean | undefined,
    medicationsNote: c.medicationsNote as string | undefined,
    diagnoses: c.diagnoses as string[] | undefined,
  };
}

/**
 * Carga el perfil de Ceramic para un controller (DID).
 * En el navegador usa la API /api/ceramic/profile porque getDeterministicStreamID
 * falla con "Invalid digest" (sha256.digest es async en browser, el SDK lo usa sync).
 */
export async function loadProfile(
  ceramic: CeramicClient,
  controllerDid: string
): Promise<InnerverProfile | null> {
  if (!controllerDid.startsWith("did:pkh:")) {
    return null;
  }
  // En browser: usar API que corre en Node (sha256 sync)
  if (typeof window !== "undefined") {
    try {
      const base = typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`${base}/api/ceramic/profile?did=${encodeURIComponent(controllerDid)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      if (!data.id) return null;
      return toInnerverProfile(data.id, data.content);
    } catch (err) {
      const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
      if (
        msg.includes("404") ||
        msg.includes("not found") ||
        msg.includes("failed to fetch stream state")
      )
        return null;
      throw err;
    }
  }
  // En Node (SSR): usar SDK directo
  const streamID = getProfileStreamID(controllerDid);
  try {
    const streamClient = new ModelInstanceClient({ ceramic });
    const state = await streamClient.getDocumentState(streamID.toString());
    return toInnerverProfile(state.commitID.baseID.toString(), state.content);
  } catch (err) {
    const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
    if (msg.includes("404") || msg.includes("not found")) return null;
    throw err;
  }
}

/** Carga InnerverProfile por stream ID (para node(id) queries). */
export async function loadProfileById(
  ceramic: CeramicClient,
  streamId: string
): Promise<InnerverProfile | null> {
  const result = await loadProfileByIdWithController(ceramic, streamId);
  return result?.profile ?? null;
}

/** Carga perfil y controller (para cargar TherapistProfile asociado). */
export async function loadProfileByIdWithController(
  ceramic: CeramicClient,
  streamId: string
): Promise<{ profile: InnerverProfile; controllerDid: string } | null> {
  try {
    const client = new ModelInstanceClient({ ceramic });
    const state = await client.getDocumentState(streamId);
    const profile = toInnerverProfile(state.commitID.baseID.toString(), state.content);
    if (!profile) return null;
    const controllerDid = (state.metadata as { controller?: string })?.controller;
    if (!controllerDid) return { profile, controllerDid: "" };
    return { profile, controllerDid };
  } catch (err) {
    const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
    if (
      msg.includes("404") ||
      msg.includes("not found") ||
      msg.includes("failed to fetch stream state")
    )
      return null;
    throw err;
  }
}

async function getProfileStreamIDInBrowser(controllerDid: string): Promise<string> {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const res = await fetch(
    `${base}/api/ceramic/profile-stream-id?did=${encodeURIComponent(controllerDid)}`
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener stream ID");
  return data.streamId;
}

async function getStreamIDInBrowser(
  controllerDid: string,
  modelKey: "profile" | "therapist" | "consultant"
): Promise<string> {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const res = await fetch(
    `${base}/api/ceramic/stream-id?did=${encodeURIComponent(controllerDid)}&model=${modelKey}`
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener stream ID");
  return data.streamId;
}

/** Carga TherapistProfile para un controller (DID). profileIdBase: stream ID de InnerverProfile. */
export async function loadTherapistProfile(
  ceramic: CeramicClient,
  controllerDid: string,
  profileIdBase: string
): Promise<TherapistProfile | null> {
  if (!controllerDid.startsWith("did:pkh:")) return null;
  const getStreamId =
    typeof window !== "undefined"
      ? () => getStreamIDInBrowser(controllerDid, "therapist")
      : () => getStreamIDForModel(controllerDid, THERAPIST_MODEL).toString();
  try {
    const streamIDStr = await getStreamId();
    const client = new ModelInstanceClient({ ceramic });
    const state = await client.getDocumentState(streamIDStr);
    return toTherapistProfile(
      state.commitID.baseID.toString(),
      state.content,
      profileIdBase
    );
  } catch (err) {
    const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
    if (
      msg.includes("404") ||
      msg.includes("not found") ||
      msg.includes("failed to fetch stream state")
    )
      return null;
    throw err;
  }
}

/** Carga ConsultantProfile para un controller (DID). profileIdBase: stream ID de InnerverProfile. */
export async function loadConsultantProfile(
  ceramic: CeramicClient,
  controllerDid: string,
  profileIdBase: string
): Promise<ConsultantProfile | null> {
  if (!controllerDid.startsWith("did:pkh:")) return null;
  const getStreamId =
    typeof window !== "undefined"
      ? () => getStreamIDInBrowser(controllerDid, "consultant")
      : () => getStreamIDForModel(controllerDid, CONSULTANT_MODEL).toString();
  try {
    const streamIDStr = await getStreamId();
    const client = new ModelInstanceClient({ ceramic });
    const state = await client.getDocumentState(streamIDStr);
    return toConsultantProfile(
      state.commitID.baseID.toString(),
      state.content,
      profileIdBase
    );
  } catch (err) {
    const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
    if (
      msg.includes("404") ||
      msg.includes("not found") ||
      msg.includes("failed to fetch stream state")
    )
      return null;
    throw err;
  }
}

/** Contenido para InnerverProfile según modelo GraphQL */
export type InnerverProfileContent = {
  name: string;
  displayName: string;
  rol: "Terapeuta" | "Consultante";
  pfp?: string;
  email?: string;
  gender?: string;
  birthDate?: string;
  country?: string;
  city?: string;
  timezone?: string;
  languages?: string[];
  primaryLanguage?: string;
  currencies?: string[];
  ratesByCurrency?: string[];
  socialInstagram?: string;
  socialLinkedin?: string;
  socialFacebook?: string;
  socialX?: string;
  created?: string;
};

/**
 * Crea o actualiza el perfil. Requiere DID autenticado para firmar.
 * controllerDidForStream: did:pkh para el stream ID (evita "Invalid digest" en browser).
 */
export async function saveProfile(
  ceramic: CeramicClient,
  did: { id: string },
  content: InnerverProfileContent,
  controllerDidForStream?: string
): Promise<InnerverProfile> {
  const modelClient = new ModelInstanceClient({ ceramic, did: did as any });
  const streamDid = controllerDidForStream?.startsWith("did:pkh:") ? controllerDidForStream : did.id;
  if (!streamDid.startsWith("did:pkh:")) {
    throw new Error("saveProfile requiere did:pkh para el stream. Usa la wallet que autenticó.");
  }
  const streamIDStr =
    typeof window !== "undefined"
      ? await getProfileStreamIDInBrowser(streamDid)
      : getProfileStreamID(streamDid).toString();

  try {
    const existing = await modelClient.getDocumentState(streamIDStr);
    const updated = await modelClient.updateDocument({
      streamID: streamIDStr,
      newContent: { ...(existing.content as object || {}), ...content },
      shouldIndex: true,
    });
    return toInnerverProfile(updated.commitID.baseID.toString(), updated.content)!;
  } catch (err) {
    const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
    const isStreamMissing =
      msg.includes("404") ||
      msg.includes("not found") ||
      msg.includes("failed to fetch stream state");
    if (!isStreamMissing) throw err;
    // Stream no existe, crear con createSingleton. Controller debe ser la instancia DID autenticada (con authenticate, createDagJWS).
    const commitID = await modelClient.createSingleton({
      model: INNERVER_MODEL,
      controller: did as any,
    });
    await modelClient.postData({
      controller: did as any,
      currentID: commitID,
      newContent: content,
      currentContent: undefined,
      shouldIndex: true,
    });
    const state = await modelClient.getDocumentState(streamIDStr);
    return toInnerverProfile(state.commitID.baseID.toString(), state.content)!;
  }
}

/** Contenido para TherapistProfile según modelo GraphQL */
export type TherapistProfileContent = {
  profileId: string;
  degrees?: string[];
  licenseNumber?: string;
  licenseJurisdiction?: string;
  licenseCountry?: string;
  yearsExperience?: number;
  approaches?: string[];
  specialties?: string[];
  populations?: string[];
  bioShort: string;
  bioLong?: string;
  introVideoUrl?: string;
  acceptingNewClients?: boolean;
  roomId?: string;
};

/** Crea o actualiza TherapistProfile. Requiere profileId (stream ID de InnerverProfile). */
export async function saveTherapistProfile(
  ceramic: CeramicClient,
  did: { id: string },
  profileId: string,
  content: TherapistProfileContent,
  controllerDidForStream?: string
): Promise<TherapistProfile> {
  const modelClient = new ModelInstanceClient({ ceramic, did: did as any });
  const streamDid =
    controllerDidForStream?.startsWith("did:pkh:") ? controllerDidForStream : did.id;
  if (!streamDid.startsWith("did:pkh:")) {
    throw new Error("saveTherapistProfile requiere did:pkh. Usa la wallet que autenticó.");
  }
  const streamIDStr =
    typeof window !== "undefined"
      ? await getStreamIDInBrowser(streamDid, "therapist")
      : getStreamIDForModel(streamDid, THERAPIST_MODEL).toString();

  const payload = {
    ...content,
    profileId,
    bioShort: content.bioShort || "",
  };

  try {
    const existing = await modelClient.getDocumentState(streamIDStr);
    const updated = await modelClient.updateDocument({
      streamID: streamIDStr,
      newContent: { ...(existing.content as object || {}), ...payload },
      shouldIndex: true,
    });
    return toTherapistProfile(
      updated.commitID.baseID.toString(),
      updated.content,
      profileId
    )!;
  } catch (err) {
    const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
    const isStreamMissing =
      msg.includes("404") ||
      msg.includes("not found") ||
      msg.includes("failed to fetch stream state");
    if (!isStreamMissing) throw err;
    const commitID = await modelClient.createSingleton({
      model: THERAPIST_MODEL,
      controller: did as any,
    });
    await modelClient.postData({
      controller: did as any,
      currentID: commitID,
      newContent: payload,
      currentContent: undefined,
      shouldIndex: true,
    });
    const state = await modelClient.getDocumentState(streamIDStr);
    return toTherapistProfile(state.commitID.baseID.toString(), state.content, profileId)!;
  }
}

/** Contenido para ConsultantProfile según modelo GraphQL */
export type ConsultantProfileContent = {
  profileId: string;
  presentingProblemShort: string;
  goals?: string[];
  therapistGenderPreference?: string;
  emergencyContactName?: string;
  emergencyContactPhoneE164?: string;
  consentTerms?: boolean;
  consentPrivacy?: boolean;
  consentTelehealthRisks?: boolean;
  consentedAt?: string;
  priorTherapy?: boolean;
  priorPsychiatry?: boolean;
  medicationsUsed?: boolean;
  medicationsNote?: string;
  diagnoses?: string[];
};

/** Crea o actualiza ConsultantProfile. Requiere profileId (stream ID de InnerverProfile). */
export async function saveConsultantProfile(
  ceramic: CeramicClient,
  did: { id: string },
  profileId: string,
  content: ConsultantProfileContent,
  controllerDidForStream?: string
): Promise<ConsultantProfile> {
  const modelClient = new ModelInstanceClient({ ceramic, did: did as any });
  const streamDid =
    controllerDidForStream?.startsWith("did:pkh:") ? controllerDidForStream : did.id;
  if (!streamDid.startsWith("did:pkh:")) {
    throw new Error("saveConsultantProfile requiere did:pkh. Usa la wallet que autenticó.");
  }
  const streamIDStr =
    typeof window !== "undefined"
      ? await getStreamIDInBrowser(streamDid, "consultant")
      : getStreamIDForModel(streamDid, CONSULTANT_MODEL).toString();

  const payload = {
    ...content,
    profileId,
    presentingProblemShort: content.presentingProblemShort || "",
  };

  try {
    const existing = await modelClient.getDocumentState(streamIDStr);
    const updated = await modelClient.updateDocument({
      streamID: streamIDStr,
      newContent: { ...(existing.content as object || {}), ...payload },
      shouldIndex: true,
    });
    return toConsultantProfile(
      updated.commitID.baseID.toString(),
      updated.content,
      profileId
    )!;
  } catch (err) {
    const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
    const isStreamMissing =
      msg.includes("404") ||
      msg.includes("not found") ||
      msg.includes("failed to fetch stream state");
    if (!isStreamMissing) throw err;
    const commitID = await modelClient.createSingleton({
      model: CONSULTANT_MODEL,
      controller: did as any,
    });
    await modelClient.postData({
      controller: did as any,
      currentID: commitID,
      newContent: payload,
      currentContent: undefined,
      shouldIndex: true,
    });
    const state = await modelClient.getDocumentState(streamIDStr);
    return toConsultantProfile(state.commitID.baseID.toString(), state.content, profileId)!;
  }
}
