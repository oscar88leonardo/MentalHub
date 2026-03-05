"use client";

import React, { useEffect, useState } from "react";
import { CeramicClient } from "@ceramic-sdk/http-client";
import { CERAMIC_NODE_URL } from "@/lib/ceramicModels";

/**
 * Página de verificación: Fase 0 de la migración a Ceramic SDK.
 * Prueba si el nodo ceramicnode.innerverse.care es compatible con ceramic-one.
 * Acceder a: /ceramic-sdk-verify
 */
export default function CeramicSdkVerifyPage() {
  const [result, setResult] = useState<{
    status: "pending" | "success" | "error";
    message?: string;
    version?: unknown;
  }>({ status: "pending" });

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const client = new CeramicClient({ url: CERAMIC_NODE_URL });
        const versionInfo = await client.getVersion();

        if (!cancelled) {
          setResult({
            status: "success",
            message: "✅ El nodo responde correctamente a la API de ceramic-one.",
            version: versionInfo,
          });
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : String(err);
          setResult({
            status: "error",
            message: `❌ Error: ${message}`,
          });
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen p-8" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Verificación Ceramic SDK (Fase 0)</h1>
        <p className="text-gray-600 mb-6">
          Comprobando si el nodo <code className="bg-gray-100 px-1 rounded">{CERAMIC_NODE_URL}</code> es
          compatible con la API de ceramic-one.
        </p>

        {result.status === "pending" && (
          <div className="flex items-center gap-2 text-blue-600">
            <span className="animate-spin inline-block w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full" />
            Conectando...
          </div>
        )}

        {result.status === "success" && (
          <div className="rounded-xl p-6 bg-green-50 border border-green-200">
            <p className="text-green-800 font-medium mb-4">{result.message}</p>
            <pre className="text-sm bg-white p-4 rounded border overflow-auto">
              {JSON.stringify(result.version, null, 2)}
            </pre>
          </div>
        )}

        {result.status === "error" && (
          <div className="rounded-xl p-6 bg-red-50 border border-red-200">
            <p className="text-red-800 font-medium">{result.message}</p>
            <p className="text-sm text-red-600 mt-2">
              Si el nodo usa la API de js-ceramic (antigua), podría ser necesario actualizar el nodo
              a ceramic-one antes de continuar la migración.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
