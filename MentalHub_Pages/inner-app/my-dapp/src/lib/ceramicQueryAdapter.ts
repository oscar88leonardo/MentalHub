/**
 * Adapter para reemplazar executeQuery de ComposeDB.
 * Usa loadProfile para consultas viewer.innerverProfile.
 * Delega mutaciones de agendamiento a ceramicScheduleService.
 */
import type { CeramicClient } from "@ceramic-sdk/http-client";
import { loadProfile, loadProfileById } from "./ceramicProfileService";
import {
  createSchedule,
  createScheduleTherapist,
  updateSchedule,
  updateScheduleTherapist,
  createSessionResponse,
  createSessionCredit,
} from "./ceramicScheduleService";

const emptyEdges = { edges: [] };

/** Extrae content de una mutation createSchedule(input: {content: {...}}) */
function parseCreateScheduleMutation(query: string): Record<string, string> | null {
  const m = query.match(/createSchedule\s*\(\s*input:\s*\{\s*content:\s*\{([^}]+)\}\s*\}\s*\)/);
  if (!m) return null;
  const content = m[1];
  const out: Record<string, string> = {};
  for (const part of content.split(",")) {
    const [key, val] = part.split(":").map((s) => s.trim());
    if (key && val) out[key] = val.replace(/^"|"$/g, "");
  }
  return out;
}

/** Extrae input de updateSchedule(input: {id: "...", content: {...}}) */
function parseUpdateScheduleMutation(query: string): { id: string; content: Record<string, string> } | null {
  const idM = query.match(/updateSchedule\s*\(\s*input:\s*\{\s*id:\s*"([^"]+)"/);
  const contentM = query.match(/content:\s*\{([^}]+)\}\s*\}\s*\)/);
  if (!idM || !contentM) return null;
  const out: Record<string, string> = {};
  for (const part of contentM[1].split(",")) {
    const [key, val] = part.split(":").map((s) => s.trim());
    if (key && val) out[key] = val.replace(/^"|"$/g, "");
  }
  return { id: idM[1], content: out };
}

/** Extrae content de createScheduleTherapist */
function parseCreateScheduleTherapistMutation(query: string): Record<string, string> | null {
  const m = query.match(/createScheduleTherapist\s*\(\s*input:\s*\{\s*content:\s*\{([^}]+)\}\s*\}\s*\)/);
  if (!m) return null;
  const content = m[1];
  const out: Record<string, string> = {};
  for (const part of content.split(",")) {
    const [key, val] = part.split(":").map((s) => s.trim());
    if (key && val) out[key] = val.replace(/^"|"$/g, "");
  }
  return out;
}

/** Extrae input de updateScheduleTherapist */
function parseUpdateScheduleTherapistMutation(query: string): { id: string; content: Record<string, string> } | null {
  const idM = query.match(/updateScheduleTherapist\s*\(\s*input:\s*\{\s*id:\s*"([^"]+)"/);
  const contentM = query.match(/content:\s*\{([^}]+)\}\s*\}\s*\)/);
  if (!idM || !contentM) return null;
  const out: Record<string, string> = {};
  for (const part of contentM[1].split(",")) {
    const [key, val] = part.split(":").map((s) => s.trim());
    if (key && val) out[key] = val.replace(/^"|"$/g, "");
  }
  return { id: idM[1], content: out };
}

/** Extrae content de createSessionResponse */
function parseCreateSessionResponseMutation(query: string): Record<string, string> | null {
  const m = query.match(/createSessionResponse\s*\(\s*input:\s*\{\s*content:\s*\{([^}]+)\}\s*\}\s*\)/);
  if (!m) return null;
  const content = m[1];
  const out: Record<string, string> = {};
  for (const part of content.split(",")) {
    const [key, val] = part.split(":").map((s) => s.trim());
    if (key && val) out[key] = val.replace(/^"|"$/g, "");
  }
  return out;
}

/** Extrae content de createSessionCredit */
function parseCreateSessionCreditMutation(query: string): Record<string, string> | null {
  const m = query.match(/createSessionCredit\s*\(\s*input:\s*\{\s*content:\s*\{([^}]+)\}\s*\}\s*\)/);
  if (!m) return null;
  const content = m[1];
  const out: Record<string, string> = {};
  for (const part of content.split(",")) {
    const [key, val] = part.split(":").map((s) => s.trim());
    if (key && val) out[key] = val.replace(/^"|"$/g, "");
  }
  return out;
}

/** Extrae node id de query node(id: "...") */
function parseNodeId(query: string): string | null {
  const m = query.match(/node\s*\(\s*id:\s*"([^"]+)"/);
  return m ? m[1] : null;
}

export function createCeramicQueryAdapter(
  ceramic: CeramicClient | null,
  getDid: () => string | null,
  getSessionDid?: () => { id: string } | null
) {
  return async function executeQuery(
    query: string,
    _variables?: Record<string, unknown>
  ): Promise<unknown> {
    if (!ceramic) {
      throw new Error("Ceramic SDK no inicializado");
    }

    const isQuery = /query\s*\{/i.test(query);
    const isMutation = /mutation\s*\{/i.test(query);

    // --- Mutaciones de agendamiento ---
    if (isMutation) {
      const sessionDid = getSessionDid?.() ?? (ceramic as { did?: { id: string } }).did;
      if (!sessionDid?.id) {
        return {
          data: null,
          errors: [{ message: "Debes autenticarte primero (Authenticate Ceramic)" }],
        };
      }

      if (/createSchedule\s*\(/i.test(query) && !/createScheduleTherapist/i.test(query)) {
        const content = parseCreateScheduleMutation(query);
        if (content?.date_init && content?.date_finish && content?.profileId && content?.therapistId && content?.roomId && content?.created) {
          try {
            const result = await createSchedule(ceramic, sessionDid, {
              date_init: content.date_init,
              date_finish: content.date_finish,
              profileId: content.profileId,
              therapistId: content.therapistId,
              roomId: content.roomId,
              created: content.created,
              edited: content.edited,
            });
            return { data: { createSchedule: { document: { id: result.id } } }, errors: undefined };
          } catch (err) {
            return { data: null, errors: [{ message: err instanceof Error ? err.message : String(err) }] };
          }
        }
      }

      if (/updateSchedule\s*\(/i.test(query)) {
        const parsed = parseUpdateScheduleMutation(query);
        if (parsed?.id && parsed.content) {
          try {
            const result = await updateSchedule(ceramic, sessionDid, parsed.id, parsed.content as any);
            return { data: { updateSchedule: { document: { id: result.id } } }, errors: undefined };
          } catch (err) {
            return { data: null, errors: [{ message: err instanceof Error ? err.message : String(err) }] };
          }
        }
      }

      if (/createScheduleTherapist\s*\(/i.test(query)) {
        const content = parseCreateScheduleTherapistMutation(query);
        if (content?.date_init && content?.date_finish && content?.profileId && content?.created && content?.state) {
          try {
            const result = await createScheduleTherapist(ceramic, sessionDid, {
              date_init: content.date_init,
              date_finish: content.date_finish,
              profileId: content.profileId,
              state: content.state as "Active" | "Archived",
              created: content.created,
              edited: content.edited,
            });
            return { data: { createScheduleTherapist: { document: { id: result.id } } }, errors: undefined };
          } catch (err) {
            return { data: null, errors: [{ message: err instanceof Error ? err.message : String(err) }] };
          }
        }
      }

      if (/updateScheduleTherapist\s*\(/i.test(query)) {
        const parsed = parseUpdateScheduleTherapistMutation(query);
        if (parsed?.id && parsed.content) {
          try {
            const result = await updateScheduleTherapist(ceramic, sessionDid, parsed.id, parsed.content as any);
            return { data: { updateScheduleTherapist: { document: { id: result.id } } }, errors: undefined };
          } catch (err) {
            return { data: null, errors: [{ message: err instanceof Error ? err.message : String(err) }] };
          }
        }
      }

      if (/createSessionResponse\s*\(/i.test(query)) {
        const content = parseCreateSessionResponseMutation(query);
        if (content?.scheduleId && content?.status && content?.created) {
          try {
            const result = await createSessionResponse(ceramic, sessionDid, {
              scheduleId: content.scheduleId,
              status: content.status as any,
              note: content.note,
              created: content.created,
            });
            return { data: { createSessionResponse: { document: { id: result.id } } }, errors: undefined };
          } catch (err) {
            return { data: null, errors: [{ message: err instanceof Error ? err.message : String(err) }] };
          }
        }
      }

      if (/createSessionCredit\s*\(/i.test(query)) {
        const content = parseCreateSessionCreditMutation(query);
        if (content?.amount && content?.reason && content?.balanceSnapshot !== undefined && content?.profileId && content?.created) {
          try {
            const result = await createSessionCredit(ceramic, sessionDid, {
              amount: parseInt(content.amount, 10),
              reason: content.reason,
              balanceSnapshot: parseInt(content.balanceSnapshot, 10),
              profileId: content.profileId,
              created: content.created,
            });
            return { data: { createSessionCredit: { document: { id: result.id } } }, errors: undefined };
          } catch (err) {
            return { data: null, errors: [{ message: err instanceof Error ? err.message : String(err) }] };
          }
        }
      }
    }

    if (isMutation && /InnerverProfile|innerverProfile/i.test(query)) {
      throw new Error("Usa upsertProfile() del contexto para crear/actualizar perfil");
    }

    // --- Queries ---
    const isViewerProfile = /viewer|innerverProfile/i.test(query);
    const isInnerverProfileIndex = /innerverProfileIndex/i.test(query);
    const did = getDid();

    // innerverProfileIndex (lista de terapeutas para nueva cita)
    if (isQuery && isInnerverProfileIndex) {
      try {
        const base = typeof window !== "undefined" ? window.location.origin : "";
        const res = await fetch(`${base}/api/ceramic/therapists`);
        const data = await res.json();
        const edges = data?.edges ?? [];
        return {
          data: {
            innerverProfileIndex: { edges },
            viewer: { innerverProfile: null },
            node: null,
            workshopIndex: emptyEdges,
          },
          errors: undefined,
        };
      } catch (err) {
        console.warn("Error fetching therapists:", err);
        return {
          data: {
            innerverProfileIndex: emptyEdges,
            viewer: { innerverProfile: null },
            node: null,
            workshopIndex: emptyEdges,
          },
          errors: undefined,
        };
      }
    }

    if (isQuery && isViewerProfile) {
      if (!did) {
        return {
          data: {
            viewer: { innerverProfile: null },
            node: null,
            innerverProfileIndex: emptyEdges,
            workshopIndex: emptyEdges,
          },
          errors: undefined,
        };
      }
      const profile = await loadProfile(ceramic, did);
      // Añadir schedules, sched_therap, therapist_sched, credits como vacíos por ahora.
      // Un indexer (Flight SQL o ComposeDB) podría poblar estos datos.
      const profileWithEmpty = profile
        ? {
            ...profile,
            schedules: emptyEdges,
            sched_therap: emptyEdges,
            therapist_sched: emptyEdges,
            credits: emptyEdges,
          }
        : null;
      return {
        data: {
          viewer: { innerverProfile: profileWithEmpty },
          node: null,
          innerverProfileIndex: emptyEdges,
          workshopIndex: emptyEdges,
        },
        errors: undefined,
      };
    }

    // node(id: "profileId") con schedules, sched_therap, therapist_sched, credits
    const nodeId = parseNodeId(query);
    if (isQuery && nodeId) {
      const profile = await loadProfileById(ceramic, nodeId);
      if (!profile) {
        return {
          data: { node: null, viewer: { innerverProfile: null }, innerverProfileIndex: emptyEdges, workshopIndex: emptyEdges },
          errors: undefined,
        };
      }
      // Retornar perfil con relaciones vacías (index no disponible en ceramic-one).
      return {
        data: {
          node: {
            ...profile,
            sched_therap: emptyEdges,
            therapist_sched: emptyEdges,
            schedules: emptyEdges,
            credits: emptyEdges,
          },
          viewer: { innerverProfile: null },
          innerverProfileIndex: emptyEdges,
          workshopIndex: emptyEdges,
        },
        errors: undefined,
      };
    }

    return {
      data: {
        viewer: { innerverProfile: null },
        node: null,
        innerverProfileIndex: emptyEdges,
        workshopIndex: emptyEdges,
      },
      errors: undefined,
    };
  };
}
