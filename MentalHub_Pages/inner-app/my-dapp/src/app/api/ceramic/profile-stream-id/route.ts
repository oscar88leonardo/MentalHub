/**
 * Devuelve el stream ID para un perfil dado su DID.
 * Corre en Node (sha256 sync). En browser getDeterministicStreamID falla.
 */
import { NextResponse } from "next/server";
import { getDeterministicStreamID } from "@ceramic-sdk/model-instance-protocol";
import { StreamID } from "@ceramic-sdk/identifiers";
import { MODEL_IDS } from "@/lib/ceramicModels";

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
    const header = {
      controllers: [did],
      model: INNERVER_MODEL,
      sep: "model" as const,
    };
    const streamID = getDeterministicStreamID(header as any);
    return NextResponse.json({ streamId: streamID.toString() });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("API ceramic/profile-stream-id error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
