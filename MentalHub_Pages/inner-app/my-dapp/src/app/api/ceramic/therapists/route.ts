/**
 * API para listar terapeutas (innerverProfileIndex con rol=Terapeuta).
 *
 * Fuente única:
 * - Flight SQL (pipeline de ceramic-one)
 */
import { NextResponse } from "next/server";
import { createFlightSqlClient, type ClientOptions } from "@ceramic-sdk/flight-sql-client";
import { StreamID } from "@ceramic-sdk/identifiers";
import { tableFromIPC } from "apache-arrow";
import { CERAMIC_NODE_URL, MODEL_IDS } from "@/lib/ceramicModels";

export const runtime = "nodejs";

type JsonRecord = Record<string, unknown>;
type EdgeNode = { node: JsonRecord };
type DebugInfo = Record<string, unknown>;

function parseBoolean(value: string | undefined, fallback = false): boolean {
  if (!value) return fallback;
  return value.toLowerCase() === "true" || value === "1";
}

function getFlightSqlClientOptions(): ClientOptions {
  const nodeUrl = new URL(CERAMIC_NODE_URL);
  const host = process.env.CERAMIC_FLIGHTSQL_HOST || nodeUrl.hostname;
  const port = process.env.CERAMIC_FLIGHTSQL_PORT
    ? parseInt(process.env.CERAMIC_FLIGHTSQL_PORT, 10)
    : 5102;
  const tls =
    process.env.CERAMIC_FLIGHTSQL_TLS !== undefined
      ? parseBoolean(process.env.CERAMIC_FLIGHTSQL_TLS, false)
      : nodeUrl.protocol === "https:";

  return {
    headers: [],
    host,
    port,
    tls,
    username: process.env.CERAMIC_FLIGHTSQL_USERNAME || undefined,
    password: process.env.CERAMIC_FLIGHTSQL_PASSWORD || undefined,
    token: process.env.CERAMIC_FLIGHTSQL_TOKEN || undefined,
  };
}

function decodeMaybeJson(input: unknown): JsonRecord | null {
  if (!input) return null;
  if (input instanceof Uint8Array) {
    try {
      const text = Buffer.from(input).toString("utf8");
      const parsed = JSON.parse(text);
      return typeof parsed === "object" && parsed && !Array.isArray(parsed)
        ? (parsed as JsonRecord)
        : null;
    } catch {
      return null;
    }
  }
  if (typeof input === "object" && !Array.isArray(input)) {
    return input as JsonRecord;
  }
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      return typeof parsed === "object" && parsed && !Array.isArray(parsed)
        ? (parsed as JsonRecord)
        : null;
    } catch {
      return null;
    }
  }
  return null;
}

function getStringField(row: JsonRecord, candidates: string[]): string | null {
  for (const key of candidates) {
    const value = row[key];
    if (typeof value === "string" && value.length > 0) return value;
    if (value instanceof Uint8Array) {
      const text = Buffer.from(value).toString("utf8");
      if (text) return text;
    }
  }
  return null;
}

function getModelIdFromRow(row: JsonRecord): string | null {
  try {
    const dimensions = row.dimensions as
      | { model?: Uint8Array }
      | undefined;
    if (!dimensions?.model || !(dimensions.model instanceof Uint8Array)) {
      return null;
    }
    return StreamID.fromBytes(dimensions.model).toString();
  } catch {
    return null;
  }
}

function getStreamIdFromRow(row: JsonRecord): string | null {
  try {
    const streamType = row.stream_type;
    const streamCid = row.stream_cid;
    if (typeof streamType !== "number" || !(streamCid instanceof Uint8Array)) {
      return null;
    }
    return StreamID.fromPayload(streamType as any, streamCid).toString();
  } catch {
    return null;
  }
}

function getContentFromRow(row: JsonRecord): JsonRecord | null {
  const contentCandidates = ["content", "data", "document", "payload"];
  for (const key of contentCandidates) {
    const parsed = decodeMaybeJson(row[key]);
    if (!parsed) continue;
    if (parsed.content && typeof parsed.content === "object") {
      return parsed.content as JsonRecord;
    }
    return parsed;
  }
  return null;
}

function getCidFromStreamId(id: string): string | null {
  try {
    return StreamID.fromString(id).cid.toString();
  } catch {
    return null;
  }
}

async function loadFromFlightSql(debug = false): Promise<{ edges: EdgeNode[]; debugInfo: DebugInfo }> {
  try {
    const options = getFlightSqlClientOptions();
    const client = await createFlightSqlClient(options);

    // event_states mantiene estado agregado por stream. Traemos stream_type=3 (documentos)
    // y filtramos por modelo (dimensions.model) en aplicación.
    const maxRows = process.env.CERAMIC_FLIGHTSQL_MAX_ROWS
      ? parseInt(process.env.CERAMIC_FLIGHTSQL_MAX_ROWS, 10)
      : 50000;
    const rowsLimit = Number.isFinite(maxRows) && maxRows > 0 ? maxRows : 50000;
    const buffer = await client.query(
      `SELECT "index", stream_type, stream_cid, dimensions, data
       FROM event_states
       WHERE stream_type = 3
       ORDER BY "index" DESC
       LIMIT ${rowsLimit}`
    );
    const table = tableFromIPC(buffer);

    const profileById = new Map<string, JsonRecord>();
    const profileCidToId = new Map<string, string>();
    const therapistByProfileId = new Map<string, JsonRecord>();
    const therapistByProfileCid = new Map<string, JsonRecord>();
    let rowsWithModel = 0;
    let rowsWithContent = 0;
    let profileModelRows = 0;
    let therapistModelRows = 0;
    let profileTherapistRows = 0;
    let therapistRowsWithProfileId = 0;
    const profileIdSamples: string[] = [];
    const therapistProfileIdSamples: string[] = [];

    for (let i = 0; i < table.numRows; i++) {
      const row = table.get(i) as unknown as JsonRecord;
      const modelId = getModelIdFromRow(row);
      if (!modelId) continue;
      rowsWithModel++;
      const content = getContentFromRow(row);
      if (!content) continue;
      rowsWithContent++;

      if (modelId === MODEL_IDS.InnerverProfile) {
        profileModelRows++;
        if (content.rol !== "Terapeuta") continue;
        profileTherapistRows++;
        const profileId =
          getStringField(row, ["stream_id", "streamId", "id"]) ||
          getStreamIdFromRow(row) ||
          (typeof content.id === "string" ? content.id : null);
        if (!profileId) continue;
        if (profileIdSamples.length < 5) profileIdSamples.push(profileId);
        profileById.set(profileId, content);
        const cid = getCidFromStreamId(profileId);
        if (cid) profileCidToId.set(cid, profileId);
      } else if (modelId === MODEL_IDS.TherapistProfile) {
        therapistModelRows++;
        const profileId = typeof content.profileId === "string" ? content.profileId : null;
        if (!profileId) continue;
        therapistRowsWithProfileId++;
        if (therapistProfileIdSamples.length < 5) therapistProfileIdSamples.push(profileId);
        therapistByProfileId.set(profileId, content);
        const cid = getCidFromStreamId(profileId);
        if (cid) therapistByProfileCid.set(cid, content);
      }
    }

    const edges: EdgeNode[] = [];
    let matchedDirect = 0;
    let matchedByCid = 0;
    let withoutTherapistNode = 0;
    for (const [profileId, profile] of profileById.entries()) {
      let therapistNode = therapistByProfileId.get(profileId);
      if (therapistNode) {
        matchedDirect++;
      } else {
        const profileCid = getCidFromStreamId(profileId);
        if (profileCid) {
          therapistNode = therapistByProfileCid.get(profileCid);
          if (therapistNode) matchedByCid++;
        }
      }
      if (!therapistNode) withoutTherapistNode++;
      edges.push({
        node: {
          id: profileId,
          displayName: profile.displayName,
          name: profile.name,
          country: profile.country,
          city: profile.city,
          languages: profile.languages,
          pfp: profile.pfp,
          socialInstagram: profile.socialInstagram,
          socialLinkedin: profile.socialLinkedin,
          socialFacebook: profile.socialFacebook,
          socialX: profile.socialX,
          therapist: therapistNode
            ? { edges: [{ node: therapistNode }] }
            : { edges: [] },
        },
      });
    }

    const debugInfo: DebugInfo = {
      rowsLimit,
      fetchedRows: table.numRows,
      rowsWithModel,
      rowsWithContent,
      profileModelRows,
      profileTherapistRows,
      therapistModelRows,
      therapistRowsWithProfileId,
      profileByIdSize: profileById.size,
      therapistByProfileIdSize: therapistByProfileId.size,
      therapistByProfileCidSize: therapistByProfileCid.size,
      matchedDirect,
      matchedByCid,
      withoutTherapistNode,
      resultEdges: edges.length,
      profileIdSamples,
      therapistProfileIdSamples,
    };
    if (debug) {
      console.log("FlightSQL therapists debug:", debugInfo);
    }
    return { edges, debugInfo };
  } catch (err) {
    throw new Error(
      `No se pudo consultar Flight SQL para listar terapeutas: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }
}

export async function GET() {
  try {
    const debug =
      parseBoolean(process.env.CERAMIC_FLIGHTSQL_DEBUG, false);
    const { edges, debugInfo } = await loadFromFlightSql(debug);
    if (debug) {
      return NextResponse.json({ edges, debug: debugInfo });
    }
    return NextResponse.json({ edges });
  } catch (err) {
    console.error("API ceramic/therapists error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
