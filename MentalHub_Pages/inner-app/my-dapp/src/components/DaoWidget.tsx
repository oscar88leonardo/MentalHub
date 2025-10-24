"use client";
import React, { useEffect, useMemo, useState } from "react";
import { TransactionButton } from "thirdweb/react";
import { getContract, prepareContractCall, getContractEvents, prepareEvent, readContract } from "thirdweb";
import { client } from "@/lib/client";
import { myChain } from "@/config/chain";
import { contracts } from "@/config/contracts";
import Header from "./Header";
import { ethers, formatEther, parseEther, isAddress, id } from "ethers";

const proposalCreated = prepareEvent({
  signature:
    "event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 voteStart, uint256 voteEnd, string description)",
});

interface DaoWidgetProps {
  onLogout: () => void;
}

export default function DaoWidget({ onLogout }: DaoWidgetProps) {
  const governorAddress = contracts.membersgovernor;
  
  if (!governorAddress) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header fijo */}
        <Header
          title="DAO"
          subtitle="Gestión de propuestas y votaciones"
          onLogout={onLogout}
        />
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="rounded-2xl p-6 text-white mb-8 shadow-2xl bg-red-500/20 border border-red-500/30">
              <h3 className="text-2xl font-semibold mb-3 text-red-200">Error de Configuración</h3>
              <p className="text-red-100">
                No se encontró la dirección del contrato MembersGovernor para la red actual. 
                Por favor, verifica la configuración en el archivo contracts.ts.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const governor = useMemo(() => getContract({ client, chain: myChain, address: governorAddress }), [governorAddress]);
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
  const [isCreatingProposal, setIsCreatingProposal] = useState<boolean>(false);
  const [proposalCreatedSuccess, setProposalCreatedSuccess] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const refreshProposals = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleProposalCreated = () => {
    setProposalCreatedSuccess(true);
    setIsCreatingProposal(false);
    // Limpiar el formulario
    setDescription("");
    setTo("");
    setAmount("");
    
    // Refrescar múltiples veces para asegurar que se capture la nueva propuesta
    const refreshInterval = setInterval(() => {
      refreshProposals();
    }, 2000); // Refrescar cada 2 segundos
    
    // Detener el refresh después de 10 segundos y ocultar el mensaje de éxito
    setTimeout(() => {
      clearInterval(refreshInterval);
      setProposalCreatedSuccess(false);
    }, 10000);
  };

  useEffect(() => {
    (async () => {
      try {
        const provider = new ethers.JsonRpcProvider((myChain as any).rpc as string);
        const latest = await provider.getBlockNumber();
        setCurrentBlock(latest);
        
        // Buscar eventos en un rango más amplio para capturar propuestas recientes
        const span = 50000; // Aumentado de 20000 a 50000
        const from = latest > span ? latest - span : 0;
        
        console.log('Buscando eventos de propuestas:', {
          latestBlock: latest,
          fromBlock: from,
          span: span,
          range: `${from} to ${latest}`
        });
        
        let events = await getContractEvents({
          contract: governor,
          events: [proposalCreated],
          fromBlock: BigInt(String(from)),
          toBlock: "latest",
        });
        
        // Si no encontramos eventos, buscar en un rango más pequeño pero más reciente
        if ((!events || events.length === 0) && from > 0) {
          const smallSpan = 10000; // Aumentado de 5000 a 10000
          const from2 = latest > smallSpan ? latest - smallSpan : 0;
          events = await getContractEvents({
            contract: governor,
            events: [proposalCreated],
            fromBlock: BigInt(String(from2)),
            toBlock: "latest",
          });
        }
        console.log('Eventos encontrados:', events?.length || 0);
        
        const parsed = (events || [])
          .map((e: any) => {
            const proposal = {
              id: e.args?.proposalId?.toString(),
              description: e.args?.description ?? "",
              voteStart: e.args?.voteStart ?? BigInt(0),
              voteEnd: e.args?.voteEnd ?? BigInt(0),
              targets: (e.args?.targets || []) as string[],
              values: ((e.args?.values || []) as any[]).map((v: any) => BigInt(String(v))),
              calldatas: (e.args?.calldatas || []) as string[],
            };
            
            console.log(`Proposal ${proposal.id} creada:`, {
              voteStart: proposal.voteStart.toString(),
              voteEnd: proposal.voteEnd.toString(),
              description: proposal.description,
              blockNumber: e.blockNumber
            });
            
            return proposal;
          })
          .filter((p: any) => !!p.id);
        const map = new Map<string, { id: string; description: string; voteStart: bigint; voteEnd: bigint }>();
        for (const p of parsed) map.set(p.id, p);
        setProposals(Array.from(map.values()) as any);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [governor, refreshTrigger]);

  useEffect(() => {
    let mounted = true;
    const loadVotes = async () => {
      try {
        const updated = await Promise.all(
          proposals.map(async (p) => {
            try {
              const [againstVotes, forVotes, abstainVotes] = (await readContract({
                contract: governor,
                method:
                  "function proposalVotes(uint256) view returns (uint256 againstVotes, uint256 forVotes, uint256 abstainVotes)",
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
        const provider = new ethers.JsonRpcProvider((myChain as any).rpc as string);
        const bal = await provider.getBalance(governorAddress);
        setBalanceWei(bal);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [governorAddress]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header fijo */}
      <Header
        title="DAO"
        subtitle="Gestión de propuestas y votaciones"
        onLogout={onLogout}
      />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Sección de crear propuesta - Diseño mejorado */}
          <div
            className="rounded-3xl p-8 text-white shadow-2xl border border-white/10"
            style={{
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Crear Nueva Propuesta
                </h3>
                <p className="text-white/70 text-sm">Proponer cambios y decisiones para la comunidad</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Campo de descripción */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Descripción de la Propuesta
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  placeholder="Describe detalladamente tu propuesta..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              {/* Campo de dirección destino */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Dirección Destino
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm font-mono text-sm"
                  placeholder="0x..."
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
              
              {/* Campo de monto */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Monto ETH
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  placeholder="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
            
            {/* Información de tesorería */}
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span className="text-sm font-medium text-white/90">Tesorería actual:</span>
                <span className="text-sm font-bold text-white">
                  {balanceWei !== null ? `${formatEther(balanceWei)} ETH` : "Cargando..."}
                </span>
              </div>
            </div>
              <TransactionButton
                transaction={() => {
                  try {
                    setIsCreatingProposal(true);
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
                      method:
                        "function propose(address[] targets, uint256[] values, bytes[] calldatas, string description)",
                      params: [[to], [wei], ["0x"], description],
                    });
                  } catch (error) {
                    setIsCreatingProposal(false);
                    throw error;
                  }
                }}
                onTransactionConfirmed={() => {
                  handleProposalCreated();
                }}
                onTransactionSent={() => {
                  // La transacción fue enviada, pero aún no confirmada
                  console.log("Transacción enviada, esperando confirmación...");
                }}
                className="w-full md:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                disabled={isCreatingProposal}
              >
                {isCreatingProposal ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Creando propuesta...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Crear Propuesta
                  </>
                )}
              </TransactionButton>
              
              {proposalCreatedSuccess && (
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 text-green-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold">¡Propuesta creada exitosamente!</p>
                      <p className="text-sm text-green-200">Actualizando lista de propuestas...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sección de propuestas - Diseño mejorado */}
          <div
            className="rounded-3xl p-8 text-white shadow-2xl border border-white/10"
            style={{
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Propuestas Activas
                </h3>
                <p className="text-white/70 text-sm">Gestiona y participa en las decisiones de la comunidad</p>
              </div>
            </div>
            <div className="grid gap-4">
              {proposals.map((p) => {
                const idShort = `#${p.id.slice(0, 6)}…${p.id.slice(-4)}`;
                // Mejorar la lógica del estado con más información de debug
                const voteStartBlock = Number(p.voteStart);
                const voteEndBlock = Number(p.voteEnd);
                
                // Debug: mostrar los valores para entender el problema
                if (currentBlock !== null) {
                  console.log(`Proposal ${p.id}:`, {
                    currentBlock,
                    voteStartBlock,
                    voteEndBlock,
                    isBeforeStart: currentBlock < voteStartBlock,
                    isActive: currentBlock >= voteStartBlock && currentBlock <= voteEndBlock,
                    isFinished: currentBlock > voteEndBlock
                  });
                }
                
                const status =
                  currentBlock === null
                    ? "-"
                    : currentBlock < voteStartBlock
                    ? "Pendiente"
                    : currentBlock <= voteEndBlock
                    ? "Activa"
                    : "Finalizada";
                const badgeColor =
                  status === "Activa"
                    ? "bg-green-100 text-green-700"
                    : status === "Pendiente"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-200 text-gray-700";
                const valueHuman = p.values && p.values[0] !== undefined ? `${formatEther(p.values[0])} ETH` : undefined;
                const dest = (p.targets && p.targets[0]) || undefined;
                const total = (p.forVotes ?? BigInt(0)) + (p.againstVotes ?? BigInt(0)) + (p.abstainVotes ?? BigInt(0));
                const pct = (x?: bigint) => {
                  const v = x ?? BigInt(0);
                  if (total === BigInt(0)) return "0%";
                  const num = (Number(v) / Number(total)) * 100;
                  return `${num.toFixed(1)}%`;
                };
                return (
                  <div key={p.id} className="rounded-2xl p-6 bg-gradient-to-br from-white/5 to-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 hover:shadow-lg">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30">
                            <span className="text-sm font-mono text-blue-300">{idShort}</span>
                          </div>
                          <span className={`px-3 py-1 text-xs rounded-full font-medium ${badgeColor}`}>
                            {status}
                          </span>
                        </div>
                        <div className="text-lg font-semibold text-white mb-3 break-words whitespace-pre-wrap">
                          {p.description || "(Sin descripción)"}
                        </div>
                        {(valueHuman || dest) && (
                          <div className="flex flex-wrap gap-4 text-sm text-white/80 mb-3">
                            {valueHuman && (
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                                <span className="font-medium">{valueHuman}</span>
                              </div>
                            )}
                            {dest && (
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="font-mono text-xs">{dest}</span>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="text-xs text-white/60 bg-white/5 rounded-lg p-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <div>Inicio: {p.voteStart.toString()}</div>
                            <div>Fin: {p.voteEnd.toString()}</div>
                            {currentBlock !== null && (
                              <div>Actual: {currentBlock}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Resultados de votación */}
                    {total > BigInt(0) && (
                      <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/20">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="flex flex-col items-center">
                            <div className="text-lg font-bold text-green-400">{pct(p.forVotes)}</div>
                            <div className="text-xs text-white/70">A Favor</div>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="text-lg font-bold text-red-400">{pct(p.againstVotes)}</div>
                            <div className="text-xs text-white/70">En Contra</div>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="text-lg font-bold text-yellow-400">{pct(p.abstainVotes)}</div>
                            <div className="text-xs text-white/70">Abstención</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Botones de acción */}
                    <div className="flex flex-wrap gap-3">
                      <TransactionButton
                        transaction={() =>
                          prepareContractCall({
                            contract: governor,
                            method: "function castVote(uint256 proposalId, uint8 support)",
                            params: [BigInt(p.id), 0],
                          })
                        }
                        className="flex-1 md:flex-none px-4 py-2 rounded-xl border border-red-400/50 text-red-300 hover:bg-red-500/20 hover:border-red-400 transition-all duration-200 font-medium"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        En Contra
                      </TransactionButton>
                      <TransactionButton
                        transaction={() =>
                          prepareContractCall({
                            contract: governor,
                            method: "function castVote(uint256 proposalId, uint8 support)",
                            params: [BigInt(p.id), 1],
                          })
                        }
                        className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        A Favor
                      </TransactionButton>
                      <TransactionButton
                        transaction={() =>
                          prepareContractCall({
                            contract: governor,
                            method: "function castVote(uint256 proposalId, uint8 support)",
                            params: [BigInt(p.id), 2],
                          })
                        }
                        className="flex-1 md:flex-none px-4 py-2 rounded-xl border border-yellow-400/50 text-yellow-300 hover:bg-yellow-500/20 hover:border-yellow-400 transition-all duration-200 font-medium"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Abstener
                      </TransactionButton>
                      {/* Debug: mostrar información sobre la condición del botón ejecutar */}
                      {currentBlock !== null && (
                        <div className="text-xs text-white/50 mr-2">
                          Debug: {currentBlock} &gt; {voteEndBlock} = {currentBlock > voteEndBlock ? 'true' : 'false'}
                        </div>
                      )}
                      {currentBlock !== null && currentBlock > voteEndBlock && p.targets && p.values && p.calldatas && (
                        <TransactionButton
                          transaction={() => {
                            const targets = (p.targets || []) as unknown as readonly `0x${string}`[];
                            const values = (p.values || []) as unknown as readonly bigint[];
                            const calldatas = ((p.calldatas || []).map((d) =>
                              (d as string).startsWith("0x") ? (d as `0x${string}`) : ("0x" as `0x${string}`)
                            )) as readonly `0x${string}`[];
                            const descHash = id(p.description || "") as `0x${string}`;
                            return prepareContractCall({
                              contract: governor,
                              method:
                                "function execute(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash)",
                              params: [targets as any, values as any, calldatas as any, descHash],
                            });
                          }}
                          className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Ejecutar
                        </TransactionButton>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sección de tesorería - Diseño mejorado */}
          <div
            className="rounded-3xl p-8 text-white shadow-2xl border border-white/10"
            style={{
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
                  Tesorería DAO
                </h3>
                <p className="text-white/70 text-sm">Información financiera del contrato Governor</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-lg font-semibold text-white">Contrato Governor</span>
                </div>
                <p className="text-sm text-white/70 font-mono break-all">{governorAddress}</p>
              </div>
              
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/30">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-6 h-6 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span className="text-lg font-semibold text-white">Balance Disponible</span>
                </div>
                <p className="text-2xl font-bold text-emerald-300">
                  {balanceWei !== null ? `${formatEther(balanceWei)} ETH` : "Cargando..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
