/**
 * Adapter para reemplazar executeQuery de ComposeDB.
 * Usa loadProfile para consultas viewer.innerverProfile.
 */
import type { CeramicClient } from "@ceramic-sdk/http-client";
import { loadProfile } from "./ceramicProfileService";

const emptyEdges = { edges: [] };

export function createCeramicQueryAdapter(
  ceramic: CeramicClient | null,
  getDid: () => string | null
) {
  return async function executeQuery(
    query: string,
    _variables?: Record<string, unknown>
  ): Promise<unknown> {
    if (!ceramic) {
      throw new Error("Ceramic SDK no inicializado");
    }

    const isQuery = /query\s*\{/i.test(query);
    const isViewerProfile = /viewer|innerverProfile/i.test(query);

    if (isQuery && isViewerProfile) {
      const did = getDid();
      if (!did) {
        return {
          data: { viewer: { innerverProfile: null }, node: null, innerverProfileIndex: emptyEdges, workshopIndex: emptyEdges },
          errors: undefined,
        };
      }
      const profile = await loadProfile(ceramic, did);
      return {
        data: {
          viewer: { innerverProfile: profile },
          node: null,
          innerverProfileIndex: emptyEdges,
          workshopIndex: emptyEdges,
        },
        errors: undefined,
      };
    }

    if (/mutation\s*\{/i.test(query) && /InnerverProfile|innerverProfile/i.test(query)) {
      throw new Error("Usa upsertProfile() del contexto para crear/actualizar perfil");
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
