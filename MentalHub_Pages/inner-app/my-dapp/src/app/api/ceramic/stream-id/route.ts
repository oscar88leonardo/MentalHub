/**
 * Devuelve el stream ID determinístico para un modelo dado su DID.
 * model: profile | therapist | consultant
 */
import { NextResponse } from "next/server";
import { getDeterministicStreamID } from "@ceramic-sdk/model-instance-protocol";
import { StreamID } from "@ceramic-sdk/identifiers";
import { MODEL_IDS } from "@/lib/ceramicModels";

const MODELS: Record<string, StreamID> = {
  profile: StreamID.fromString(MODEL_IDS.InnerverProfile),
  therapist: StreamID.fromString(MODEL_IDS.TherapistProfile),
  consultant: StreamID.fromString(MODEL_IDS.ConsultantProfile),
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const did = searchParams.get("did");
  const model = searchParams.get("model") || "profile";
  if (!did || !did.startsWith("did:pkh:")) {
    return NextResponse.json(
      { error: "Se requiere ?did=did:pkh:eip155:chainId:address" },
      { status: 400 }
    );
  }
  const modelStream = MODELS[model];
  if (!modelStream) {
    return NextResponse.json(
      { error: "model debe ser profile, therapist o consultant" },
      { status: 400 }
    );
  }
  try {
    const header = {
      controllers: [did],
      model: modelStream,
      sep: "model" as const,
    };
    const streamID = getDeterministicStreamID(header as any);
    return NextResponse.json({ streamId: streamID.toString() });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("API ceramic/stream-id error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
