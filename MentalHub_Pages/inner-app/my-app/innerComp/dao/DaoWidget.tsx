"use client";
import React, { useEffect, useMemo, useState } from "react";
import { TransactionButton } from "thirdweb/react";
import { getContract, prepareContractCall, getContractEvents, prepareEvent, readContract, defineChain } from "thirdweb";
import { client } from "../client";
import { ethers, formatEther, parseEther, isAddress, id } from "ethers";

const governorAddress = process.env.NEXT_PUBLIC_GOV_ADDRESS as string;

const proposalCreated = prepareEvent({
  signature:
    "event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 voteStart, uint256 voteEnd, string description)"
});

export default function DaoWidget() {
  const shibuyaChain = defineChain({ id: 81, rpc: "https://evm.shibuya.astar.network" });
  const governor = useMemo(() => getContract({ client, chain: shibuyaChain, address: governorAddress }), []);
  const [proposals, setProposals] = useState<Array<{
    id: string;
    description: string;
    voteStart: bigint;
    voteEnd: bigint;
    targets?: string[];
    values?: bigint[];
    calldatas?: string[];
    forVotes?: bigint;
    againstVotes?: bigint;
    abstainVotes?: bigint;
  }>>([]);
  const [balanceWei, setBalanceWei] = useState<bigint | null>(null);
  const [description, setDescription] = useState<string>("Propuesta demo");
  const [to, setTo] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [currentBlock, setCurrentBlock] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const provider = new ethers.JsonRpcProvider("https://evm.shibuya.astar.network");
        const latest = await provider.getBlockNumber();
        setCurrentBlock(latest);
        const span = 20000;
        const from = latest > span ? latest - span : 0;
        let events = await getContractEvents({
          contract: governor,
          events: [proposalCreated],
          fromBlock: BigInt(String(from)),
          toBlock: "latest",
        });
        if (!events || events.length === 0 && from > 0) {
          // fallback a ventana más pequeña
          const smallSpan = 5000;
          const from2 = latest > smallSpan ? latest - smallSpan : 0;
          events = await getContractEvents({
            contract: governor,
            events: [proposalCreated],
            fromBlock: BigInt(String(from2)),
            toBlock: "latest",
          });
        }
        const parsed = (events || [])
          .map((e: any) => ({
            id: e.args?.proposalId?.toString(),
            description: e.args?.description ?? "",
            voteStart: e.args?.voteStart ?? BigInt(0),
            voteEnd: e.args?.voteEnd ?? BigInt(0),
            targets: (e.args?.targets || []) as string[],
            values: ((e.args?.values || []) as any[]).map((v: any) => BigInt(String(v))),
            calldatas: (e.args?.calldatas || []) as string[],
          }))
          .filter((p: any) => !!p.id);
        // dedupe by id
        const map = new Map<string, { id: string; description: string; voteStart: bigint; voteEnd: bigint }>();
        for (const p of parsed) map.set(p.id, p);
        setProposals(Array.from(map.values()) as any);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [governor]);

  // Cargar votos por propuesta y refrescar periódicamente
  useEffect(() => {
    let mounted = true;
    const loadVotes = async () => {
      try {
        const updated = await Promise.all(
          proposals.map(async (p) => {
            try {
              const [againstVotes, forVotes, abstainVotes] = (await readContract({
                contract: governor,
                method: "function proposalVotes(uint256) view returns (uint256 againstVotes, uint256 forVotes, uint256 abstainVotes)",
                params: [BigInt(p.id)],
              })) as unknown as [bigint, bigint, bigint];
              return { ...p, forVotes, againstVotes, abstainVotes };
            } catch {
              return { ...p };
            }
          })
        );
        if (mounted) setProposals(updated);
      } catch (e) {
        console.error(e);
      }
    };
    if (proposals.length) {
      loadVotes();
      const t = setInterval(loadVotes, 10000);
      return () => {
        mounted = false;
        clearInterval(t);
      };
    }
  }, [governor, proposals.length]);

  useEffect(() => {
    (async () => {
      try {
        const provider = new ethers.JsonRpcProvider("https://evm.shibuya.astar.network");
        const bal = await provider.getBalance(governorAddress);
        setBalanceWei(bal);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <div className="my-8 mx-auto max-w-4xl p-6 border rounded-xl shadow-sm bg-surface">
      

      <h3 className="text-2xl font-semibold mb-3">Crear propuesta</h3>
      <div className="flex flex-col gap-3 mb-8 p-4 rounded-lg border bg-white/50">
        <textarea
          rows={4}
          className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-900 placeholder-gray-500 resize-y whitespace-pre-wrap"
          placeholder="Escribe la descripción de tu propuesta (puedes usar saltos de línea)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-900 placeholder-gray-500"
          placeholder="Dirección destino (0x...)"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <input
          className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-900 placeholder-gray-500"
          placeholder="Monto SBY (ej: 0.1)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <div className="text-xs text-gray-500">
          Tesorería actual: {balanceWei !== null ? `${formatEther(balanceWei)} SBY` : "-"}
        </div>
        <TransactionButton
          transaction={() =>
            {
              if (!isAddress(to)) {
                throw new Error("Dirección destino inválida");
              }
              let wei: bigint;
              try {
                wei = parseEther((amount || "").trim());
              } catch {
                throw new Error("Monto inválido");
              }
              if (wei <= BigInt(0)) {
                throw new Error("El monto debe ser mayor a 0");
              }
              if (balanceWei !== null && wei > balanceWei) {
                throw new Error("Tesorería insuficiente en el Governor");
              }
              return prepareContractCall({
                contract: governor,
                method: "function propose(address[] targets, uint256[] values, bytes[] calldatas, string description)",
                params: [[to], [wei], ["0x"], description],
              });
            }
          }
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-white hover:bg-primary-dark transition"
        >Crear propuesta</TransactionButton>
      </div>

      <h3 className="text-2xl font-semibold mb-3">Propuestas</h3>
      <div className="grid gap-4">
        {proposals.map((p) => {
          const idShort = `#${p.id.slice(0, 6)}…${p.id.slice(-4)}`;
          const status = currentBlock === null
            ? "-"
            : (currentBlock < Number(p.voteStart)
                ? "Pendiente"
                : currentBlock <= Number(p.voteEnd)
                  ? "Activa"
                  : "Finalizada");
          const badgeColor = status === "Activa" ? "bg-green-100 text-green-700" : status === "Pendiente" ? "bg-yellow-100 text-yellow-700" : "bg-gray-200 text-gray-700";
          const valueHuman = (p.values && p.values[0] !== undefined) ? `${formatEther(p.values[0])} SBY` : undefined;
          const dest = (p.targets && p.targets[0]) || undefined;
          const total = (p.forVotes ?? BigInt(0)) + (p.againstVotes ?? BigInt(0)) + (p.abstainVotes ?? BigInt(0));
          const pct = (x?: bigint) => {
            const v = x ?? BigInt(0);
            if (total === BigInt(0)) return "0%";
            const num = Number(v) / Number(total) * 100;
            return `${num.toFixed(1)}%`;
          };
          return (
            <div key={p.id} className="rounded-lg border p-4 bg-white/60 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm text-gray-500">{idShort}</div>
                  <div className="mt-1 font-medium text-base break-words whitespace-pre-wrap">{p.description || "(Sin descripción)"}</div>
                  {(valueHuman || dest) && (
                    <div className="mt-2 text-xs text-gray-600">
                      {valueHuman ? `Payout: ${valueHuman}` : null}
                      {valueHuman && dest ? " · " : null}
                      {dest ? `Destino: ${dest}` : null}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-500">Bloques: inicio {p.voteStart.toString()} · fin {p.voteEnd.toString()}</div>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${badgeColor}`}>{status}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {total > BigInt(0) && (
                  <div className="mr-3 text-xs text-gray-600">
                    For: {pct(p.forVotes)} · Contra: {pct(p.againstVotes)} · Abstención: {pct(p.abstainVotes)}
                  </div>
                )}
                <TransactionButton
                  transaction={() =>
                    prepareContractCall({
                      contract: governor,
                      method: "function castVote(uint256 proposalId, uint8 support)",
                      params: [BigInt(p.id), 0],
                    })
                  }
                  className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
                >Contra</TransactionButton>
                <TransactionButton
                  transaction={() =>
                    prepareContractCall({
                      contract: governor,
                      method: "function castVote(uint256 proposalId, uint8 support)",
                      params: [BigInt(p.id), 1],
                    })
                  }
                  className="rounded-md bg-primary px-3 py-1 text-sm text-white hover:bg-primary-dark"
                >A favor</TransactionButton>
                <TransactionButton
                  transaction={() =>
                    prepareContractCall({
                      contract: governor,
                      method: "function castVote(uint256 proposalId, uint8 support)",
                      params: [BigInt(p.id), 2],
                    })
                  }
                  className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
                >Abstener</TransactionButton>
                {currentBlock !== null && currentBlock > Number(p.voteEnd) && p.targets && p.values && p.calldatas && (
                  <TransactionButton
                    transaction={() => {
                      const targets = (p.targets || []) as unknown as readonly `0x${string}`[];
                      const values = (p.values || []) as unknown as readonly bigint[];
                      const calldatas = ((p.calldatas || []).map((d) => (d as string).startsWith("0x") ? (d as `0x${string}`) : ("0x" as `0x${string}`))) as readonly `0x${string}`[];
                      const descHash = id(p.description || "") as `0x${string}`;
                      return prepareContractCall({
                        contract: governor,
                        method: "function execute(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash)",
                        params: [targets as any, values as any, calldatas as any, descHash],
                      });
                    }}
                    className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
                  >Ejecutar</TransactionButton>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <h3 className="text-2xl font-semibold mt-8 mb-3">Tesorería</h3>
      <div className="text-sm p-4 rounded-lg border bg-white/50">
        Governor: {governorAddress}
        <br />
        Balance SBY: {balanceWei !== null ? formatEther(balanceWei) : "-"}
      </div>
    </div>
  );
}


