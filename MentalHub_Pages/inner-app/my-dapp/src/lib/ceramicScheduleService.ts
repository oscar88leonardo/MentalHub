/**
 * Servicio para Schedule, ScheduleTherapist, SessionResponse y SessionCredit.
 * Usa ModelInstanceClient para operaciones contra el nodo Ceramic.
 * Modelos LIST: createInstance para crear, updateDocument para actualizar.
 */
import { CeramicClient } from "@ceramic-sdk/http-client";
import { ModelInstanceClient } from "@ceramic-sdk/model-instance-client";
import { StreamID } from "@ceramic-sdk/identifiers";
import { MODEL_IDS } from "./ceramicModels";

const SCHEDULE_MODEL = StreamID.fromString(MODEL_IDS.Schedule);
const SCHEDULE_THERAPIST_MODEL = StreamID.fromString(MODEL_IDS.ScheduleTherapist);
const SESSION_RESPONSE_MODEL = StreamID.fromString(MODEL_IDS.SessionResponse);
const SESSION_CREDIT_MODEL = StreamID.fromString(MODEL_IDS.SessionCredit);

// --- Tipos según modelos GraphQL ---

export interface ScheduleContent {
  date_init: string;
  date_finish: string;
  profileId: string;
  therapistId: string;
  roomId: string;
  created: string;
  edited?: string;
}

export interface ScheduleTherapistContent {
  date_init: string;
  date_finish: string;
  profileId: string;
  state: "Active" | "Archived";
  created: string;
  edited?: string;
}

export type SessionStatus =
  | "CONFIRMED"
  | "REJECTED"
  | "RESCHEDULE_REQUESTED"
  | "COMPLETED"
  | "CANCELLED";

export interface SessionResponseContent {
  scheduleId: string;
  status: SessionStatus;
  note?: string;
  created: string;
}

export interface SessionCreditContent {
  amount: number;
  reason: string;
  balanceSnapshot: number;
  profileId: string;
  created: string;
}

// --- Crear instancias (LIST models) ---

/** Crea un Schedule. Requiere DID autenticado. */
export async function createSchedule(
  ceramic: CeramicClient,
  did: { id: string },
  content: ScheduleContent
): Promise<{ id: string }> {
  const client = new ModelInstanceClient({ ceramic, did: did as any });
  const commitID = await client.createInstance({
    model: SCHEDULE_MODEL,
    content: content as unknown as Record<string, unknown>,
    controller: did as any,
    shouldIndex: true,
  });
  return { id: commitID.baseID.toString() };
}

/** Actualiza un Schedule existente. */
export async function updateSchedule(
  ceramic: CeramicClient,
  did: { id: string },
  streamId: string,
  content: Partial<ScheduleContent>
): Promise<{ id: string }> {
  const client = new ModelInstanceClient({ ceramic, did: did as any });
  const state = await client.getDocumentState(streamId);
  const merged = { ...(state.content as object || {}), ...content };
  const updated = await client.updateDocument({
    streamID: streamId,
    newContent: merged,
    shouldIndex: true,
  });
  return { id: updated.commitID.baseID.toString() };
}

/** Crea un ScheduleTherapist (disponibilidad del terapeuta). */
export async function createScheduleTherapist(
  ceramic: CeramicClient,
  did: { id: string },
  content: ScheduleTherapistContent
): Promise<{ id: string }> {
  const client = new ModelInstanceClient({ ceramic, did: did as any });
  const commitID = await client.createInstance({
    model: SCHEDULE_THERAPIST_MODEL,
    content: content as unknown as Record<string, unknown>,
    controller: did as any,
    shouldIndex: true,
  });
  return { id: commitID.baseID.toString() };
}

/** Actualiza un ScheduleTherapist. */
export async function updateScheduleTherapist(
  ceramic: CeramicClient,
  did: { id: string },
  streamId: string,
  content: Partial<ScheduleTherapistContent>
): Promise<{ id: string }> {
  const client = new ModelInstanceClient({ ceramic, did: did as any });
  const state = await client.getDocumentState(streamId);
  const merged = { ...(state.content as object || {}), ...content };
  const updated = await client.updateDocument({
    streamID: streamId,
    newContent: merged,
    shouldIndex: true,
  });
  return { id: updated.commitID.baseID.toString() };
}

/** Crea un SessionResponse (respuesta del terapeuta a una cita). */
export async function createSessionResponse(
  ceramic: CeramicClient,
  did: { id: string },
  content: SessionResponseContent
): Promise<{ id: string }> {
  const client = new ModelInstanceClient({ ceramic, did: did as any });
  const commitID = await client.createInstance({
    model: SESSION_RESPONSE_MODEL,
    content: content as unknown as Record<string, unknown>,
    controller: did as any,
    shouldIndex: true,
  });
  return { id: commitID.baseID.toString() };
}

/** Crea un SessionCredit (crédito de sesión). */
export async function createSessionCredit(
  ceramic: CeramicClient,
  did: { id: string },
  content: SessionCreditContent
): Promise<{ id: string }> {
  const client = new ModelInstanceClient({ ceramic, did: did as any });
  const commitID = await client.createInstance({
    model: SESSION_CREDIT_MODEL,
    content: content as unknown as Record<string, unknown>,
    controller: did as any,
    shouldIndex: true,
  });
  return { id: commitID.baseID.toString() };
}

// --- Cargar por ID (para resolver node(id) y relaciones) ---

/** Carga un Schedule por stream ID. */
export async function loadSchedule(
  ceramic: CeramicClient,
  streamId: string
): Promise<{ id: string; content: ScheduleContent } | null> {
  try {
    const client = new ModelInstanceClient({ ceramic });
    const state = await client.getDocumentState(streamId);
    return {
      id: state.commitID.baseID.toString(),
      content: state.content as unknown as ScheduleContent,
    };
  } catch (err) {
    const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
    if (msg.includes("404") || msg.includes("not found")) return null;
    throw err;
  }
}

/** Carga un ScheduleTherapist por stream ID. */
export async function loadScheduleTherapist(
  ceramic: CeramicClient,
  streamId: string
): Promise<{ id: string; content: ScheduleTherapistContent } | null> {
  try {
    const client = new ModelInstanceClient({ ceramic });
    const state = await client.getDocumentState(streamId);
    return {
      id: state.commitID.baseID.toString(),
      content: state.content as unknown as ScheduleTherapistContent,
    };
  } catch (err) {
    const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
    if (msg.includes("404") || msg.includes("not found")) return null;
    throw err;
  }
}

/** Carga un SessionResponse por stream ID. */
export async function loadSessionResponse(
  ceramic: CeramicClient,
  streamId: string
): Promise<{ id: string; content: SessionResponseContent } | null> {
  try {
    const client = new ModelInstanceClient({ ceramic });
    const state = await client.getDocumentState(streamId);
    return {
      id: state.commitID.baseID.toString(),
      content: state.content as unknown as SessionResponseContent,
    };
  } catch (err) {
    const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
    if (msg.includes("404") || msg.includes("not found")) return null;
    throw err;
  }
}
