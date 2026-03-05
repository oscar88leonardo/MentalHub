/**
 * API para cargar perfil de Ceramic.
 * Se ejecuta en Node donde sha256.digest es síncrono.
 * En el navegador, getDeterministicStreamID falla con "Invalid digest" porque
 * crypto.subtle.digest es async y el SDK lo usa como sync.
 */
import { NextResponse } from "next/server";
import { CeramicClient } from "@ceramic-sdk/http-client";
import { ModelInstanceClient } from "@ceramic-sdk/model-instance-client";
import { getDeterministicStreamID } from "@ceramic-sdk/model-instance-protocol";
import { StreamID } from "@ceramic-sdk/identifiers";
import { MODEL_IDS, CERAMIC_NODE_URL } from "@/lib/ceramicModels";

const INNERVER_MODEL = StreamID.fromString(MODEL_IDS.InnerverProfile);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const did = searchParams.get("did");
  if (!did || !did.startsWith("did:pkh:")) {
    return NextResponse.json(
      { error: "Se requiere ?did=did:pkh:eip155:chainId:address" },
      { status: 400 }
    );
  }
  try {
    const ceramic = new CeramicClient({ url: CERAMIC_NODE_URL });
    const header = {
      controllers: [did],
      model: INNERVER_MODEL,
      sep: "model" as const,
    };
    const streamID = getDeterministicStreamID(header as any);
    const client = new ModelInstanceClient({ ceramic });
    const state = await client.getDocumentState(streamID.toString());
    return NextResponse.json({
      id: state.commitID.baseID.toString(),
      content: state.content,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const lower = msg.toLowerCase();
    // Stream no existe o nodo no tiene datos → perfil vacío (no error)
    if (
      lower.includes("404") ||
      lower.includes("not found") ||
      lower.includes("failed to fetch stream state") ||
      lower.includes("stream state")
    ) {
      return NextResponse.json({ id: null, content: null }, { status: 200 });
    }
    console.error("API ceramic/profile error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
