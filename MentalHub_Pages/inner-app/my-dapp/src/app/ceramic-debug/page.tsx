"use client"
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { ComposeClient } from "@composedb/client";
import { RuntimeCompositeDefinition } from "@composedb/types";
import { DIDSession } from "did-session";
import { EthereumWebAuth, getAccountId } from "@didtools/pkh-ethereum";
import { ConnectEmbed, useActiveWallet, useAdminWallet } from "thirdweb/react";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import { EIP1193 } from "thirdweb/wallets";
import { client } from "@/lib/client";
import { myChain } from "@/config/chain";
import { definition } from "@/__generated__/definition.js";

type Profile = {
  id?: string
  name?: string
  displayName?: string
  rol?: "Terapeuta" | "Consultante"
  pfp?: string
}

export default function CeramicDebugPage() {
  const activeWallet = useActiveWallet();
  const adminWallet = useAdminWallet();
  const selectedWallet = adminWallet || activeWallet;
  const account = selectedWallet ? selectedWallet.getAccount() : null;

  const [ceramic, setCeramic] = useState<CeramicClient | null>(null);
  const [compose, setCompose] = useState<ComposeClient | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logAnchor, setLogAnchor] = useState(0); // forces re-render so logs interleave visually

  const [profile, setProfile] = useState<Profile>({});
  const [formName, setFormName] = useState("");
  const [formRol, setFormRol] = useState<"Terapeuta" | "Consultante" | "">("");
  const [formPfp, setFormPfp] = useState("");

  const provider = useMemo(() => {
    if (!selectedWallet) return null;
    return EIP1193.toProvider({ wallet: selectedWallet, chain: myChain, client });
  }, [selectedWallet]);

  useEffect(() => {
    console.log("[CD] wallet state", {
      activeWallet: !!activeWallet,
      adminWallet: !!adminWallet,
      selectedWallet: !!selectedWallet,
      account: account?.address,
    });
  }, [activeWallet, adminWallet, selectedWallet, account]);

  useEffect(() => {
    if (!ceramic && provider) {
      console.log("[CD] init clients...");
      const c = new CeramicClient("https://ceramicnode.innerverse.care");
      const comp = new ComposeClient({
        ceramic: (c as unknown) as any, // ensure same instance is used internally
        definition: (definition as unknown) as RuntimeCompositeDefinition,
      });
      setCeramic(c);
      setCompose(comp);
      try { console.log("[CD] compose resources", comp.resources); } catch {}
    }
  }, [provider, ceramic]);

  const ensureChainAndAccount = useCallback(async () => {
    if (!provider || !account) throw new Error("Provider/account not ready");
    const chainHex = "0xe9fe"; // 59902
    const currentChainId = await provider.request?.({ method: "eth_chainId" });
    console.log("[CD] chainId", currentChainId);
    if ((currentChainId || "").toLowerCase() !== chainHex) {
      try {
        console.log("[CD] switching chain", chainHex);
        await provider.request?.({ method: "wallet_switchEthereumChain", params: [{ chainId: chainHex }] });
      } catch (e) {
        console.warn("[CD] wallet_switchEthereumChain failed; using wallet.switchChain",e);
        await selectedWallet?.switchChain?.(myChain);
      }
    }
    const accounts = (await provider.request?.({ method: "eth_accounts" })) as string[] | undefined;
    console.log("[CD] eth_accounts", accounts);
    const expected = account.address.toLowerCase();
    const ok = (accounts || []).some((a) => a.toLowerCase() === expected);
    if (!ok) {
      const req = (await provider.request?.({ method: "eth_requestAccounts" })) as string[] | undefined;
      console.log("[CD] eth_requestAccounts", req);
      const ok2 = (req || []).some((a) => a.toLowerCase() === expected);
      if (!ok2) throw new Error("El provider no firma con la cuenta admin esperada");
    }
  }, [provider, account, selectedWallet]);

  const authenticate = useCallback(async () => {
    if (!compose || !ceramic) throw new Error("Clients not ready");
    if (!provider || !account) throw new Error("Provider/account not ready");
    setBusy("authenticating"); setError(null);
    try {
      await ensureChainAndAccount();
      const accountId = await getAccountId(provider, account.address);
      console.log("[CD] accountId", accountId);
      const authMethod = await EthereumWebAuth.getAuthMethod(provider, accountId);
      console.log("[CD] authMethod ready");
      try { localStorage.removeItem("did-session"); sessionStorage.removeItem("ceramic:eth_did"); } catch {}
      if (!compose.resources || compose.resources.length === 0) throw new Error("Compose resources empty");
      console.log("[CD] resources", compose.resources);
      const session = await (DIDSession as any).authorize(authMethod, {
        resources: compose.resources,
        domain: window.location.hostname,
        expiresInSecs: 60 * 60 * 24,
      });
      compose.setDID(session.did);
      ceramic.did = session.did;
      setIsAuth(true);
      console.log("[CD] DID", session.did.id);
      try { console.log("[CD] compose.ceramic.did", (compose as any)?.ceramic?.did?.id); } catch {}
    } catch (e: any) {
      console.error("[CD] authenticate error", e);
      setError(String(e?.message || e));
    } finally {
      setBusy(null); setLogAnchor((n) => n + 1);
    }
  }, [compose, ceramic, provider, account, ensureChainAndAccount]);

  // Re-auth including the specific profile stream as a resource
  const authenticateForStream = useCallback(async () => {
    if (!compose || !ceramic) throw new Error("Clients not ready");
    if (!provider || !account) throw new Error("Provider/account not ready");
    if (!profile?.id) throw new Error("Profile id is required for stream auth");
    setBusy("authenticating"); setError(null);
    try {
      await ensureChainAndAccount();
      const accountId = await getAccountId(provider, account.address);
      console.log("[CD] accountId(stream)", accountId);
      const authMethod = await EthereumWebAuth.getAuthMethod(provider, accountId);
      console.log("[CD] authMethod ready(stream)");
      try { localStorage.removeItem("did-session"); sessionStorage.removeItem("ceramic:eth_did"); } catch {}
      const extra = `ceramic://${profile.id}`;
      const resources = [...(compose?.resources || []), extra];
      console.log("[CD] resources(stream)", resources);
      const session = await (DIDSession as any).authorize(authMethod, {
        resources,
        domain: window.location.hostname,
        expiresInSecs: 60 * 60 * 24,
      });
      compose.setDID(session.did);
      ceramic.did = session.did;
      setIsAuth(true);
      console.log("[CD] DID(stream)", session.did.id, (session as any)?.did?.capability || (session as any)?.capability);
      try { console.log("[CD] compose.ceramic.did(stream)", (compose as any)?.ceramic?.did?.id); } catch {}
    } catch (e: any) {
      console.error("[CD] authenticateForStream error", e);
      setError(String(e?.message || e));
    } finally {
      setBusy(null); setLogAnchor((n) => n + 1);
    }
  }, [compose, ceramic, provider, account, ensureChainAndAccount, profile?.id]);

  const readProfile = useCallback(async () => {
    if (!compose) throw new Error("Compose not ready");
    setBusy("reading"); setError(null);
    try {
      const q = `
        query { viewer { innerverProfile { id name displayName rol pfp } } }
      `;
      const res: any = await compose.executeQuery(q);
      console.log("[CD] read result", res);
      const p = res?.data?.viewer?.innerverProfile as Profile | undefined;
      if (p) {
        setProfile(p);
        setFormName(p.name || "");
        setFormRol((p.rol as any) || "");
        setFormPfp(p.pfp || "");
      } else {
        setProfile({});
      }
    } catch (e: any) {
      console.error("[CD] read error", e);
      setError(String(e?.message || e));
    } finally {
      setBusy(null); setLogAnchor((n) => n + 1);
    }
  }, [compose]);

  const writeProfile = useCallback(async () => {
    if (!compose) throw new Error("Compose not ready");
    if (!isAuth) await authenticate();
    setBusy("writing"); setError(null);
    try {
      const safeName = (formName || "").replace(/"/g, '\\"');
      const safePfp = (formPfp || "").replace(/"/g, '\\"');
      const rolToken = formRol || "Terapeuta"; // default
      const mutation = profile.id
        ? `mutation { updateInnerverProfile(input: { id: "${profile.id}" content: { name: "${safeName}" displayName: "${safeName}" rol: ${rolToken} pfp: "${safePfp}" } }) { document { id name displayName rol pfp } } }`
        : `mutation { createInnerverProfile(input: { content: { name: "${safeName}" displayName: "${safeName}" rol: ${rolToken} pfp: "${safePfp}" } }) { document { id name displayName rol pfp } } }`;
      console.log("[CD] mutation", mutation);
      const res = await compose.executeQuery(mutation);
      console.log("[CD] write result", res);
      if (res?.errors?.length) throw new Error(res.errors.map((x: any) => x.message).join(" | "));
      await readProfile();
    } catch (e: any) {
      console.error("[CD] write error", e);
      setError(String(e?.message || e));
    } finally {
      setBusy(null); setLogAnchor((n) => n + 1);
    }
  }, [compose, isAuth, authenticate, formName, formPfp, formRol, profile.id, readProfile]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Ceramic Debug Page</h1>

      {!selectedWallet && (
        <div className="p-4 rounded border">
          <h2 className="font-semibold mb-2">Connect Wallet</h2>
          <div className="max-w-md">
            <ConnectEmbed
              client={client}
              wallets={[
                inAppWallet({ auth: { options: ["google", "email", "x", "passkey", "phone"] } }),
                createWallet("io.metamask"),
                createWallet("com.coinbase.wallet"),
                createWallet("me.rainbow"),
                createWallet("io.rabby"),
                createWallet("io.zerion.wallet"),
              ]}
              accountAbstraction={{ chain: myChain, sponsorGas: true }}
              theme="light"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded border">
          <h2 className="font-semibold mb-2">Wallet</h2>
          <div className="text-sm space-y-1">
            <div>account: {account?.address || "-"}</div>
            <div>walletType: {adminWallet ? "adminWallet" : activeWallet ? "activeWallet" : "-"}</div>
            <div>provider: {provider ? "ready" : "-"}</div>
          </div>
        </div>
        <div className="p-4 rounded border">
          <h2 className="font-semibold mb-2">Ceramic/Compose</h2>
          <div className="text-sm space-y-1">
            <div>ceramic: {ceramic ? "ready" : "-"}</div>
            <div>compose: {compose ? "ready" : "-"}</div>
            <div>auth: {isAuth ? "yes" : "no"}</div>
            <div>busy: {busy || "idle"}</div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <button disabled={!provider || !compose || !!busy} onClick={authenticate} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50">Authenticate Ceramic</button>
        <button disabled={!provider || !compose || !profile?.id || !!busy} onClick={authenticateForStream} className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50">Auth With Stream</button>
        <button disabled={!compose || !!busy} onClick={readProfile} className="px-4 py-2 rounded bg-gray-700 text-white disabled:opacity-50">Read Profile</button>
      </div>

      <div className="p-4 rounded border space-y-3">
        <h2 className="font-semibold">Edit Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="border rounded px-3 py-2" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="name" />
          <select className="border rounded px-3 py-2" value={formRol} onChange={(e) => setFormRol(e.target.value as any)}>
            <option value="">select rol</option>
            <option value="Terapeuta">Terapeuta</option>
            <option value="Consultante">Consultante</option>
          </select>
          <input className="border rounded px-3 py-2" value={formPfp} onChange={(e) => setFormPfp(e.target.value)} placeholder="pfp (ipfs hash | url)" />
        </div>
        <button disabled={!compose || !!busy} onClick={writeProfile} className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50">Write Profile</button>
        <div className="text-sm text-gray-600">current profile: {JSON.stringify(profile)}</div>
      </div>

      {error && (
        <div className="p-3 rounded border border-red-400 bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      <div className="text-xs text-gray-500">logAnchor: {logAnchor}</div>
    </div>
  );
}


