import { generateNonce } from 'siwe';
import { Cacao } from '@didtools/cacao';
import { SiweMessage as CacaoSiweMessage } from '@didtools/cacao';
import { didPkhFromAddress } from './did';
import { myChain } from '@/config/chain';

type AdminAccount = { address: string; signMessage: (args: { message: string | Uint8Array }) => Promise<string> };

export async function delegateScheduleToTherapist(params: {
  scheduleId: string;
  therapistEOA: string;
  adminAccount: AdminAccount;
  executeQuery: (q: string, vars?: any) => Promise<any>;
  expiresInMins?: number;
}): Promise<{ cacao: Cacao; docId: string }> {
  const { scheduleId, therapistEOA, adminAccount, executeQuery, expiresInMins = 60 * 24 } = params;

  const issDid = didPkhFromAddress(adminAccount.address);
  const audDid = didPkhFromAddress(therapistEOA);
  const expirationTime = new Date(Date.now() + expiresInMins * 60 * 1000).toISOString();

  const chainId = Number((myChain as any)?.id ?? (myChain as any)?.chainId ?? 1);
  const domain = window.location.host;
  const nonce = generateNonce();
  const issuedAt = new Date().toISOString();
  const resource = `ceramic://${scheduleId}`;

  const siwe = new CacaoSiweMessage({
    domain,
    address: adminAccount.address,
    statement: `Schedule update permission for therapist: ${audDid}`,
    uri: audDid,
    version: '1',
    chainId:String(chainId),
    nonce,
    issuedAt,
    expirationTime,
    resources: [resource],
  });
  const messageToSign = siwe.toMessageEip55();
  const signature = await adminAccount.signMessage({ message: messageToSign });
  (siwe as any).signature = signature;

  const cacao = Cacao.fromSiweMessage(siwe);
  // Logs de campos clave del CACAO
  const issInCacao = (cacao as any)?.p?.iss;
  const audInCacao = (cacao as any)?.p?.aud;
  const resList = (cacao as any)?.p?.resources;
  console.log("[CACAO][Fields][Create]", {
    issuer: issInCacao,
    aud: audInCacao,
    expectedParent: audDid,
    resources: resList,
  });
    // sanity check (evita cadenas inválidas que causan "issuer and parent not equal")
  if (audInCacao !== audDid) {
    throw new Error(`CACAO.aud inesperado. Esperado ${audDid}, recibido ${audInCacao}`);
  }
  if (!Array.isArray(resList) || !resList.includes(resource)) {
    console.warn("[CACAO][Sanity][Create] resource missing", { resList, expected: resource });
  }
  console.log("[CACAO][CreateGrant] prepared", {
    scheduleId,
    issDid,
    audDid,
    resources: [resource],
    expirationTime,
  });

  const m = `
    mutation($input: CreateScheduleGrantInput!) {
      createScheduleGrant(input: $input) { document { id } }
    }
  `;
  const input = {
    content: {
      scheduleId,
      audDid: audDid,
      cacao: JSON.stringify(cacao),
      expires: expirationTime,
      created: new Date().toISOString(),
    },
  };
  const res = await executeQuery(m, { input });
  const gqlErrors = (res as any)?.errors;
  if (Array.isArray(gqlErrors) && gqlErrors.length) {
    const msg = gqlErrors.map((e: any) => e?.message || String(e)).join(" | ");
    console.warn("[CACAO][CreateGrant] GraphQL errors:", msg);
    throw new Error(`CreateScheduleGrant failed: ${msg}`);
  }
  const docId: string | undefined = (res as any)?.data?.createScheduleGrant?.document?.id;
  if (!docId) {
    console.warn("[CACAO][CreateGrant] no docId returned", res);
    throw new Error("CreateScheduleGrant did not return document id");
  }
  console.log("[CACAO][CreateGrant] result docId:", docId);

  return { cacao, docId };
}


