"use client"
import React, { useState, useCallback } from "react";
import { ConnectEmbed, useActiveWallet, useAdminWallet } from "thirdweb/react";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import { client } from "@/lib/client";
import { myChain } from "@/config/chain";
import { useCeramic } from "@/context/CeramicContext";

type Profile = {
  id?: string;
  name?: string;
  displayName?: string;
  rol?: "Terapeuta" | "Consultante";
  pfp?: string;
};

export default function CeramicDebugPage() {
  const activeWallet = useActiveWallet();
  const adminWallet = useAdminWallet();
  const selectedWallet = adminWallet || activeWallet;
  const aaAccount = activeWallet ? activeWallet.getAccount() : null;

  const {
    ceramic,
    isConnected: isAuth,
    profile: ctxProfile,
    connect,
    refreshProfile,
    upsertProfile,
  } = useCeramic();

  const [formName, setFormName] = useState("");
  const [formRol, setFormRol] = useState<"Terapeuta" | "Consultante" | "">("");
  const [formPfp, setFormPfp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string>("");

  const profile: Profile = ctxProfile
    ? {
        id: ctxProfile.id,
        name: ctxProfile.name,
        displayName: ctxProfile.displayName,
        rol: ctxProfile.rol,
        pfp: ctxProfile.pfp,
      }
    : {};

  const readProfile = useCallback(async () => {
    setLastAction("");
    if (!ceramic) {
      setError("Ceramic SDK no está listo");
      return;
    }
    setBusy("reading");
    setError(null);
    setLastAction("Leyendo perfil desde nodo Ceramic...");
    try {
      const profileData = await refreshProfile();
      if (profileData) {
        setFormName(profileData.name || "");
        setFormRol(profileData.rol || "");
        setFormPfp(profileData.pfp || "");
        setLastAction("Perfil leído correctamente");
      } else {
        setLastAction("Sin perfil (crea uno con Write Profile)");
      }
    } catch (e: any) {
      const msg = e?.message || String(e);
      setError(msg);
      setLastAction(`Error: ${msg}`);
    } finally {
      setBusy(null);
    }
  }, [ceramic, refreshProfile]);

  const writeProfile = useCallback(async () => {
    setLastAction("");
    if (!ceramic) {
      setError("Ceramic SDK no está listo");
      return;
    }
    if (!isAuth) {
      setLastAction("Autenticando primero...");
      try {
        await connect();
      } catch (e: any) {
        setError(e?.message || "Error al conectar");
        setLastAction(`Error: ${e?.message || "connect failed"}`);
        return;
      }
    }
    setBusy("writing");
    setError(null);
    setLastAction("Escribiendo perfil en nodo Ceramic...");
    try {
      await upsertProfile({
        name: formName || "Usuario",
        displayName: formName || "Usuario",
        rol: (formRol as "Terapeuta" | "Consultante") || "Consultante",
        pfp: formPfp || undefined,
      });
      setLastAction("Perfil guardado correctamente");
    } catch (e: any) {
      const msg = e?.message || String(e);
      setError(msg);
      setLastAction(`Error: ${msg}`);
    } finally {
      setBusy(null);
    }
  }, [ceramic, isAuth, connect, upsertProfile, formName, formPfp, formRol]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Ceramic Debug (Ceramic SDK)</h1>
      <p className="text-sm text-gray-600">
        Migrado a Ceramic SDK. ComposeDB removido. En Network verás: POST /interests → 204 (éxito), GET /feed/events → 200 con JSON.
      </p>

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
            <div>account (AA): {aaAccount?.address || "-"}</div>
            <div>walletType: {adminWallet ? "adminWallet" : activeWallet ? "activeWallet" : "-"}</div>
          </div>
        </div>
        <div className="p-4 rounded border">
          <h2 className="font-semibold mb-2">Ceramic SDK</h2>
          <div className="text-sm space-y-1">
            <div>ceramic: {ceramic ? "ready" : "-"}</div>
            <div>auth: {isAuth ? "yes" : "no"}</div>
            <div>busy: {busy || "idle"}</div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <button
          type="button"
          disabled={!selectedWallet || !ceramic || !!busy}
          onClick={connect}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
        >
          Authenticate Ceramic
        </button>
        <button
          type="button"
          disabled={!ceramic || !!busy}
          onClick={() => readProfile()}
          className="px-4 py-2 rounded bg-gray-700 text-white disabled:opacity-50"
        >
          Read Profile
        </button>
      </div>
      {!ceramic && (
        <p className="text-sm text-amber-600">
          Ceramic no listo. Recarga la página. Si persiste, revisa la consola del navegador.
        </p>
      )}
      {lastAction && (
        <div className="p-4 rounded border bg-blue-50 text-blue-800 text-sm">
          Última acción: {lastAction}
        </div>
      )}

      <div className="p-4 rounded border space-y-3">
        <h2 className="font-semibold">Edit Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            className="border rounded px-3 py-2"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="name"
          />
          <select
            className="border rounded px-3 py-2"
            value={formRol}
            onChange={(e) => setFormRol(e.target.value as any)}
          >
            <option value="">select rol</option>
            <option value="Terapeuta">Terapeuta</option>
            <option value="Consultante">Consultante</option>
          </select>
          <input
            className="border rounded px-3 py-2"
            value={formPfp}
            onChange={(e) => setFormPfp(e.target.value)}
            placeholder="pfp (ipfs hash | url)"
          />
        </div>
        <button
          type="button"
          disabled={!ceramic || !!busy}
          onClick={() => writeProfile()}
          className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50"
        >
          Write Profile
        </button>
        <div className="text-sm text-gray-600">current profile: {JSON.stringify(profile)}</div>
      </div>

      {error && (
        <div className="p-3 rounded border border-red-400 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
