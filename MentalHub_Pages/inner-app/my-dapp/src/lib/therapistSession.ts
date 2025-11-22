import type { ComposeClient } from "@composedb/client";
import { Cacao } from "@didtools/cacao";
import { DIDSession, createDIDKey } from "did-session";
import { didPkhFromAddress } from "./did";

type ScheduleState = "Pending" | "Confirmed" | "Active" | "Finished" | "Cancelled";

function ensureResources(cacao: Cacao, scheduleId?: string) {
  if (!cacao.p) (cacao as any).p = {};
  if (!Array.isArray((cacao as any).p.resources) || (cacao as any).p.resources.length === 0) {
    if (scheduleId) (cacao as any).p.resources = [`ceramic://${scheduleId}`];
  }
}

export async function buildTherapistSessionWithCacao(params: {
  cacao: Cacao;
  scheduleId?: string;
  provider: any;            // providerThirdweb (EIP-1193) - no se usa en este flujo
  adminAddress: string;     // EOA del terapeuta (solo para logs)
}) {
  const { cacao, scheduleId, adminAddress } = params;
  if (!adminAddress) throw new Error("adminAddress requerido");

  ensureResources(cacao, scheduleId);

  // Crear DID efímero did:key y adjuntar directamente el CACAO delegado
  const didKey = await createDIDKey();
  const session = await DIDSession.initDID(didKey, cacao);
  const did = (session as any).did ?? session;
  console.log("[Session][Parent]", {
    parentViaId: (did as any)?.parent,      // did:pkh del emisor (delegador)
    parentViaDid: (did as any)?.parent,     // mismo valor
    sessionDid: did.id,                     // did:key efímero que firmará los commits
    issuerFromCacao: (cacao as any)?.p?.iss,
  });

  // Comprobación rápida: el aud del CACAO debe coincidir con el DID del terapeuta
  const expectedAud = didPkhFromAddress(adminAddress);
  const audInCacao = (cacao as any)?.p?.aud;
  // Logs comparando issuer/aud de la capability vs la sesión y el parent esperado
  console.log("[Session][Auth] did", did.id);
  console.log("[CACAO][Sanity][Consume]", {
    cacao_iss: (cacao as any)?.p?.iss,
    cacao_aud: audInCacao,
    expectedParent: expectedAud,
    sessionDid: did.id,
    sessionParent: (did as any)?.parent,
  });
  if (audInCacao !== expectedAud) {
    console.warn("[CACAO][Sanity][Consume] aud != expected", { audInCacao, expectedAud });
  }
  return did;
}

export async function updateScheduleStateWithSession(params: {
  compose: ComposeClient;
  cacao: Cacao;
  scheduleId: string;
  newState: ScheduleState;
  provider: any;            // providerThirdweb
  adminAddress: string;     // EOA del terapeuta
}) {
  const { compose, cacao, scheduleId, newState, provider, adminAddress } = params;

  const did = await buildTherapistSessionWithCacao({
    cacao,
    scheduleId,
    provider,
    adminAddress,
  });

  // Debug: inspeccionar JWS de la firma
  const clientAny = (did as any)?._client;
  if (clientAny?.createJWS) {
    const origCreateJWS = clientAny.createJWS.bind(clientAny);
    clientAny.createJWS = async (payload: any, opts: any) => {
      const jws = await origCreateJWS(payload, opts);
      try {
        const prot = JSON.parse(Buffer.from(jws.signatures[0].protected, 'base64url').toString());
        console.log("[JWS][prot]", prot);  // Espera: { alg: 'EdDSA', kid: 'did:key:...#z6M...', cap: {...} }
      } catch (e) {
        console.warn("[JWS][prot][parse-error]", e);
      }
      return jws;
    };
  }
  // Setea la DID de la sesión (did:pkh con capability) en Compose/Ceramic
  compose.setDID(did);
  const ceramicClient = (compose as any).ceramic;
  if (ceramicClient && typeof ceramicClient === "object") {
    ceramicClient.did = did;
  }

  const mutation = `
    mutation UpdateSchedule($id: ID!, $state: ScheduleState!, $edited: DateTime) {
      updateSchedule(input: { id: $id, content: { state: $state, edited: $edited } }) {
        document { id state }
      }
    }
  `;
  const res = await compose.executeQuery(mutation, {
    id: scheduleId,
    state: newState,
    edited: new Date().toISOString(),
  });

  if (res?.errors?.length) {
    console.error("[Schedule][CACAO] errors:", JSON.stringify(res.errors, null, 2));
    throw new Error(res.errors.map((e: any) => e.message).join(" | "));
  }
  const doc = (res as any)?.data?.updateSchedule?.document;
  if (!doc?.id) throw new Error("No se pudo actualizar el estado");
  return doc.state as string;
}
