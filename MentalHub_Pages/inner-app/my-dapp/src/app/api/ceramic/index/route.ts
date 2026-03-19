/**
 * API para consultar streams indexados por modelo y relación.
 * Ceramic-one no expone un índice GraphQL como ComposeDB; esta API intenta
 * obtener streams por modelo. Si el nodo no tiene índice, retorna vacío.
 *
 * Query params:
 * - model: Schedule | ScheduleTherapist | SessionResponse | SessionCredit
 * - profileId: filtrar por profileId (relationFrom)
 * - therapistId: filtrar por therapistId (solo Schedule)
 * - state: filtrar por state (solo ScheduleTherapist, Active | Archived)
 */
import { NextResponse } from "next/server";
import { CeramicClient } from "@ceramic-sdk/http-client";
import { ModelInstanceClient } from "@ceramic-sdk/model-instance-client";
import { StreamID } from "@ceramic-sdk/identifiers";
import { MODEL_IDS, CERAMIC_NODE_URL } from "@/lib/ceramicModels";
const MODEL_IDS_MAP: Record<string, string> = {
  Schedule: MODEL_IDS.Schedule,
  ScheduleTherapist: MODEL_IDS.ScheduleTherapist,
  SessionResponse: MODEL_IDS.SessionResponse,
  SessionCredit: MODEL_IDS.SessionCredit,
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const model = searchParams.get("model");
  const profileId = searchParams.get("profileId");
  const therapistId = searchParams.get("therapistId");
  const state = searchParams.get("state");

  if (!model || !MODEL_IDS_MAP[model]) {
    return NextResponse.json(
      { error: "model debe ser Schedule, ScheduleTherapist, SessionResponse o SessionCredit" },
      { status: 400 }
    );
  }

  try {
    const ceramic = new CeramicClient({ url: CERAMIC_NODE_URL });
    const client = new ModelInstanceClient({ ceramic });

    // Intentar usar el feed de eventos para obtener stream IDs del modelo.
    // registerInterestModel + getEventsFeed solo devuelve eventos NUEVOS,
    // no históricos. Sin un índice real, no podemos listar todos los streams.
    // Por ahora retornamos vacío; un indexer externo podría poblar esta API.
    const modelStreamId = StreamID.fromString(MODEL_IDS_MAP[model]);
    try {
      await ceramic.registerInterestModel(modelStreamId.toString());
    } catch {
      // Ignorar si el nodo no soporta interests
    }

    // getEventsFeed devuelve eventos recientes, no todos los streams.
    // Sin índice ComposeDB/ceramic index, no hay forma estándar de listar
    // streams por relationFrom. Retornamos [] hasta tener indexer.
    const streams: Array<{ id: string; content: Record<string, unknown> }> = [];

    // Si tenemos profileId y es un perfil conocido, podríamos intentar
    // cargar perfiles relacionados desde un índice externo. Por ahora vacío.
    if (profileId && model === "SessionCredit") {
      // SessionCredit: profileId es el consultante. Sin índice, no podemos listar.
    }
    if (profileId && model === "ScheduleTherapist") {
      // ScheduleTherapist: profileId es el terapeuta. Sin índice, no podemos listar.
    }
    if (profileId && model === "Schedule") {
      // Schedule: profileId = consultante, therapistId = terapeuta. Sin índice, no podemos listar.
    }

    return NextResponse.json({ streams });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("API ceramic/index error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
