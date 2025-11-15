"use client";
import React, { useEffect, useMemo, useState } from "react";
import { TransactionButton } from "thirdweb/react";
import { getContract, prepareContractCall, getContractEvents, prepareEvent, readContract, sendTransaction } from "thirdweb";
import { client } from "@/lib/client";
import { myChain } from "@/config/chain";
import { contracts } from "@/config/contracts";
import Header from "./Header";
import { ethers, formatEther, parseEther, isAddress, id } from "ethers";
import { useAdminWallet,useActiveAccount, useActiveWalletChain, useSwitchActiveWalletChain } from "thirdweb/react";
import { abi as governorAbi } from "@/abicontracts/MembersGovernor";

const proposalCreated = prepareEvent({
  signature:
    "event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 voteStart, uint256 voteEnd, string description)",
});

interface DaoWidgetProps {
  onLogout: () => void;
}

export default function DaoWidget({ onLogout }: DaoWidgetProps) {
  const governorAddress = contracts.membersgovernor;
  
  // Move all hooks to the top before any conditional returns
  const governor = useMemo(() => governorAddress ? getContract(
    { client, chain: myChain, address: governorAddress, abi: governorAbi as any}) : null, [governorAddress]);
  const [proposals, setProposals] = useState<Array<{
    id: string;
    description: string;
    voteStart: bigint;
    voteEnd: bigint;
    voteStartTimestamp?: number;
    voteEndTimestamp?: number;
    targets?: string[];
    values?: bigint[];
    calldatas?: string[];
    forVotes?: bigint;
    againstVotes?: bigint;
    abstainVotes?: bigint;
    status?: 'pending' | 'active' | 'succeeded' | 'defeated' | 'expired' | 'executed';
    contractState?: number;
  }>>([]);
  const [balanceWei, setBalanceWei] = useState<bigint | null>(null);
  const [description, setDescription] = useState<string>("Propuesta demo");
  const [to, setTo] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  
  
  
  //const [currentBlock, setCurrentBlock] = useState<number | null>(null);
  const [isCreatingProposal, setIsCreatingProposal] = useState<boolean>(false);
  const [proposalCreatedSuccess, setProposalCreatedSuccess] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const [isLoadingProposals, setIsLoadingProposals] = useState(false);
  const [lastLoadTime, setLastLoadTime] = useState<number>(0);
  const [manualRefresh, setManualRefresh] = useState<number>(0);

  const account = useActiveAccount();
  const activeChain = useActiveWalletChain();
  const switchChain = useSwitchActiveWalletChain();
  const adminWallet = useAdminWallet();
  const adminAccount = adminWallet ? adminWallet.getAccount() : null;
  const memberToken = contracts.membersAirdrop;
  const governanceToken = useMemo(
    () => memberToken ? getContract({client, chain: myChain, address: memberToken}) : null,
    [memberToken]);

  const [myVotes, setMyVotes] = useState<bigint>(BigInt(0));
  const [threshold, setThreshold] = useState<bigint>(BigInt(1));
  const [delegatee, setDelegatee] = useState<string | null>(null);

  // estados para días, horas y minutos en propuestas
  const [votingDays, setVotingDays] = useState<string>("");
  const [votingHours, setVotingHours] = useState<string>("");
  const [votingMinutes, setVotingMinutes] = useState<string>("");
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [currentVotingPeriod, setCurrentVotingPeriod] = useState<bigint | null>(null);

  // Función helper para formatear fechas correctamente
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
  };


  /*/ Función para verificar si la cuenta actual es owner
  const checkIfOwner = async () => {
    if (!governor || !adminAccount) return;
    
    try {
      const ownerAddress = await readContract({
        contract: governor,
        method: "function owner() view returns (address)",
        params: [],
      });
      
      setIsOwner(ownerAddress?.toLowerCase() === adminAccount.address.toLowerCase());
    } catch (error) {
      console.error("Error verificando owner:", error);
      setIsOwner(false);
    }
  };*/

  // Función para cargar el período de votación actual
  const loadCurrentVotingPeriod = async () => {
    if (!governor) return;
    
    try {
      const period = await readContract({
        contract: governor,
        method: "function votingPeriodSeconds() view returns (uint256)",
        params: [],
      });
      
      setCurrentVotingPeriod(period as bigint);
    } catch (error) {
      console.error("Error cargando período de votación:", error);
    }
  };

  // Función para convertir días, horas, minutos a segundos
  const convertToSeconds = (days: string, hours: string, minutes: string): bigint => {
    const daysNum = BigInt(days || "0");
    const hoursNum = BigInt(hours || "0");
    const minutesNum = BigInt(minutes || "0");
    
    // Validar límites
    const totalMinutes = daysNum * BigInt(24 * 60) + hoursNum * BigInt(60) + minutesNum;
    const totalSeconds = totalMinutes * BigInt(60);
    
    return totalSeconds;
  };

  // Función para validar el período de votación
  const validateVotingPeriod = (days: string, hours: string, minutes: string): { valid: boolean; error?: string } => {
    const daysNum = parseInt(days || "0");
    const hoursNum = parseInt(hours || "0");
    const minutesNum = parseInt(minutes || "0");
    
    if (daysNum < 0 || hoursNum < 0 || minutesNum < 0) {
      return { valid: false, error: "Los valores no pueden ser negativos" };
    }
    
    if (daysNum === 0 && hoursNum === 0 && minutesNum === 0) {
      return { valid: false, error: "El período debe ser al menos 1 minuto" };
    }
    
    const totalSeconds = convertToSeconds(days, hours, minutes);
    const minSeconds = BigInt(60); // 1 minuto
    const maxSeconds = BigInt(30 * 24 * 60 * 60); // 30 días
    
    if (totalSeconds < minSeconds) {
      return { valid: false, error: "El período mínimo es 1 minuto" };
    }
    
    if (totalSeconds > maxSeconds) {
      return { valid: false, error: "El período máximo es 30 días" };
    }
    
    return { valid: true };
  };

  // Función para obtener timestamps de propuestas - VERSIÓN MEJORADA CON TIMESTAMPS REALES
  const getProposalTimestamps = async (proposalId: string) => {
    if (!governor) return { startTimestamp: 0, endTimestamp: 0 };
    
    try {
      // Intentar obtener timestamps reales del contrato actualizado
      const [contractStartTimestamp, contractEndTimestamp] = await Promise.all([
        readContract({
          contract: governor,
          method: "function getVoteStartTimestamp(uint256) view returns (uint256)",
          params: [BigInt(proposalId)],
        }).catch(() => null),
        readContract({
          contract: governor,
          method: "function getVoteEndTimestamp(uint256) view returns (uint256)",
          params: [BigInt(proposalId)],
        }).catch(() => null)
      ]);

      if (contractStartTimestamp && contractEndTimestamp) {
        console.log(`📅 Timestamps reales del contrato para propuesta ${proposalId}:`, {
          startTimestamp: Number(contractStartTimestamp),
          endTimestamp: Number(contractEndTimestamp),
          startDate: new Date(Number(contractStartTimestamp) * 1000).toLocaleString(),
          endDate: new Date(Number(contractEndTimestamp) * 1000).toLocaleString()
        });
        
        return {
          startTimestamp: Number(contractStartTimestamp),
          endTimestamp: Number(contractEndTimestamp)
        };
      }

      // Fallback: usar timestamps de bloques reales
      console.log(`⚠️ Usando fallback para propuesta ${proposalId}`);
      const provider = new ethers.JsonRpcProvider((myChain as any).rpc as string);
      
      const [voteStartBlock, voteEndBlock] = await Promise.all([
        readContract({
          contract: governor,
          method: "function proposalSnapshot(uint256) view returns (uint256)",
          params: [BigInt(proposalId)],
        }),
        readContract({
          contract: governor,
          method: "function proposalDeadline(uint256) view returns (uint256)",
          params: [BigInt(proposalId)],
        })
      ]);

      const [startBlockInfo, endBlockInfo] = await Promise.all([
        provider.getBlock(Number(voteStartBlock)),
        provider.getBlock(Number(voteEndBlock))
      ]);

      if (startBlockInfo && endBlockInfo) {
        console.log(`📅 Timestamps de bloques para propuesta ${proposalId}:`, {
          startBlock: Number(voteStartBlock),
          endBlock: Number(voteEndBlock),
          startTimestamp: startBlockInfo.timestamp,
          endTimestamp: endBlockInfo.timestamp,
          startDate: new Date(startBlockInfo.timestamp * 1000).toLocaleString(),
          endDate: new Date(endBlockInfo.timestamp * 1000).toLocaleString()
        });
        
        return {
          startTimestamp: startBlockInfo.timestamp,
          endTimestamp: endBlockInfo.timestamp
        };
      }

      return { startTimestamp: 0, endTimestamp: 0 };
    } catch (error) {
      console.error('Error obteniendo timestamps:', error);
      return { startTimestamp: 0, endTimestamp: 0 };
    }
  };

  // Función para escuchar eventos del contrato de manera eficiente
  const listenToContractEvents = () => {
    if (!governor) return;
    
    try {
      //const provider = new ethers.JsonRpcProvider((myChain as any).rpc as string);
      
      // Escuchar eventos ProposalCreatedWithTimestamps (nuevo evento personalizado)
      /*const proposalCreatedWithTimestampsFilter = {
        address: governor.address,
        topics: [
          ethers.id("ProposalCreatedWithTimestamps(uint256,uint256,uint256,string)")
        ]
      };*/
      
      // Escuchar eventos ProposalCreated estándar (fallback)
      /*const proposalCreatedFilter = {
        address: governor.address,
        topics: [
          ethers.id("ProposalCreated(uint256,address,address[],uint256[],string[],bytes[],uint256,uint256,string)")
        ]
      };*/
      
      // Función para manejar nuevos eventos
      /*const handleNewProposal = async (event: any) => {
        console.log('🎉 Nueva propuesta detectada:', event);
        // Refrescar propuestas después de un breve delay
        setTimeout(() => {
          manualRefreshProposals();
        }, 2000);
      };*/
      
      // Suscribirse a eventos (esto es para demostración, en producción usarías WebSocket)
      console.log('👂 Escuchando eventos del contrato...');
      
      // Nota: Para una implementación completa, usarías WebSocket o polling
      // Por ahora, el botón de refresh manual es suficiente
      
    } catch (error) {
      console.error('Error configurando listeners:', error);
    }
  };
  
  // useEffect para inicializar listeners de eventos
  useEffect(() => {
    if (governor) {
      listenToContractEvents();
    }
  }, [governor, listenToContractEvents]);

  useEffect(() => {
    if (!governor || !governanceToken || !account) return;
    let cancelled = false;
    // carga de votos/umbral/delegatee
    (async () => {
      try {
        const [v, t, d] = await Promise.all([
          readContract({
            contract: governanceToken,
            method: "function getVotes(address) view returns (uint256)",
            params: [account.address],
          }),
          readContract({
            contract: governor,
            method: "function proposalThreshold() view returns (uint256)",
            params: [],
          }),
          readContract({
            contract: governanceToken,
            method: "function delegates(address) view returns (address)",
            params: [account.address],
          }).catch(() => "0x0000000000000000000000000000000000000000"),
        ]);
        if (cancelled) return;
        setMyVotes(BigInt(v as any));
        setThreshold(BigInt(t as any));
        setDelegatee(d as string);
      } catch {}
    })();
    //canceled = true;
    // load proposals block
    // Solo cargar propuestas cuando se hace refresh manual o es la primera vez
    const now = Date.now();
    if (proposals.length > 0 && now - lastLoadTime < 30000) {
      console.log('⏸️ Evitando recarga automática - usar botón refresh');
      return;
    }    
    //let cancelled = false;
    setIsLoadingProposals(true);
    (async () => {
      try {
        const provider = new ethers.JsonRpcProvider((myChain as any).rpc as string);
        const latest = await provider.getBlockNumber();
        if (cancelled) return;
        //setCurrentBlock(latest);
        
        // Buscar en un rango más amplio para encontrar propuestas existentes
        const span = 100000; // Aumentado a 100,000 bloques para encontrar propuestas más antiguas
        const from = latest > span ? latest - span : 0;
        
        console.log('Buscando eventos de propuestas:', {
          latestBlock: latest,
          fromBlock: from,
          span: span,
          range: `${from} to ${latest}`
        });
        
        const events = await getContractEvents({
          contract: governor,
          events: [proposalCreated],
          fromBlock: BigInt(String(from)),
          toBlock: "latest",
        });
        
        if (cancelled) return;
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

        // Obtener timestamps y estado real para cada propuesta
        const proposalsWithTimestamps = await Promise.all(
          parsed.map(async (p: any) => {
            const timestamps = await getProposalTimestamps(p.id);

            // Obtener estado real del contrato
            let contractState: number | undefined;
            try {
              const state = await readContract({
                contract: governor,
                method: "function state(uint256) view returns (uint8)",
                params: [BigInt(p.id)],
              });
              contractState = Number(state);
            } catch (error) {
              console.error(`Error obteniendo estado para propuesta ${p.id}:`, error);
            }

            // Obtener votos actuales de la propuesta
            let votes = {
              againstVotes: BigInt(0),
              forVotes: BigInt(0),
              abstainVotes: BigInt(0),
            };
            try {
              const [againstVotes, forVotes, abstainVotes] = (await readContract({
                contract: governor,
                method:
                  "function proposalVotes(uint256) view returns (uint256 againstVotes, uint256 forVotes, uint256 abstainVotes)",
                params: [BigInt(p.id)],
              })) as unknown as [bigint, bigint, bigint];

              votes = { againstVotes, forVotes, abstainVotes };
            } catch (error) {
              console.error(`Error cargando votos para propuesta ${p.id}:`, error);
            }

            return {
              ...p,
              voteStartTimestamp: timestamps?.startTimestamp || 0,
              voteEndTimestamp: timestamps?.endTimestamp || 0,
              contractState,
              ...votes,
            };
          })
        );

        const map = new Map<string, any>();
        for (const p of proposalsWithTimestamps) map.set(p.id, p);
        setProposals(Array.from(map.values()));
        setLastLoadTime(now);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setIsLoadingProposals(false);
      }
    })();
    
    return () => { cancelled = true; };
  }, [governor, governanceToken, account, refreshTrigger, manualRefresh, getProposalTimestamps, lastLoadTime, proposals.length]);

  // useEffect para votos - ELIMINADO para evitar re-renders automáticos
  // Los votos se actualizarán solo cuando se haga refresh manual

  useEffect(() => {
    if (!governorAddress) return;
    
    let cancelled = false;
    (async () => {
      try {
        const provider = new ethers.JsonRpcProvider((myChain as any).rpc as string);
        const bal = await provider.getBalance(governorAddress);
        if (!cancelled) setBalanceWei(bal);
      } catch (e) {
        console.error(e);
      }
    })();
    
    return () => { cancelled = true; };
  }, [governorAddress]);

  // Cargar campo para definir periodo de votacion si es owner 
  useEffect(() => {
    if (!governor || !adminAccount) {
      setIsOwner(false);
      setCurrentVotingPeriod(null);
      return;
    }
    
    let cancelled = false;
    
    const loadOwnerAndPeriod = async () => {
      try {
        // Verificar si es owner
        const ownerAddress = await readContract({
          contract: governor,
          method: "function owner() view returns (address)",
          params: [],
        }).catch(() => null);
        
        if (cancelled) return;
        
        if (ownerAddress) {
          setIsOwner(ownerAddress.toLowerCase() === adminAccount.address.toLowerCase());
        } else {
          setIsOwner(false);
        }
        
        // Cargar período de votación actual
        const period = await readContract({
          contract: governor,
          method: "function votingPeriodSeconds() view returns (uint256)",
          params: [],
        }).catch(() => null);
        
        if (cancelled) return;
        
        if (period) {
          setCurrentVotingPeriod(period as bigint);
        }
      } catch (error) {
        console.error("Error cargando datos de owner/período:", error);
        if (!cancelled) {
          setIsOwner(false);
        }
      }
    };
    
    loadOwnerAndPeriod();
    
    return () => {
      cancelled = true;
    };
  }, [governor, adminAccount]);
  

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

  const refreshProposals = () => {
    // Solo refrescar si han pasado al menos 10 segundos desde la última carga
    const now = Date.now();
    if (now - lastLoadTime < 10000) {
      console.log('Evitando refresh - muy reciente');
      return;
    }
    setRefreshTrigger(prev => prev + 1);
  };

  const manualRefreshProposals = async () => {
    console.log('🔄 Refresh manual iniciado...');
    setManualRefresh(prev => prev + 1);
    setLastLoadTime(0); // Resetear para forzar recarga

    // También cargar votos después de un breve delay
    setTimeout(async () => {
      if (!governor || !proposals.length) return;

      try {
        console.log('📊 Cargando votos...');
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
            } catch (error) {
              console.error(`Error cargando votos para propuesta ${p.id}:`, error);
              return p;
            }
          })
        );

        setProposals(updated);

        console.log('✅ Votos cargados exitosamente');
      } catch (e) {
        console.error('❌ Error cargando votos:', e);
      }
    }, 500); // pequeño delay para no saturar y permitir que propuestas nuevas se asienten
  };

  const handleProposalCreated = () => {
    setProposalCreatedSuccess(true);
    setIsCreatingProposal(false);
    // Limpiar el formulario
    setDescription("");
    setTo("");
    setAmount("");
    
    // Refrescar las propuestas múltiples veces para asegurar que aparezca
    setTimeout(() => {
      console.log("🔄 Primer refresh después de crear propuesta...");
      refreshProposals();
    }, 3000); // Primer refresh después de 3 segundos
    
    setTimeout(() => {
      console.log("🔄 Segundo refresh después de crear propuesta...");
      refreshProposals();
    }, 8000); // Segundo refresh después de 8 segundos
    
    setTimeout(() => {
      console.log("🔄 Tercer refresh después de crear propuesta...");
      refreshProposals();
    }, 15000); // Tercer refresh después de 15 segundos
    
    // Ocultar el mensaje de éxito después de 20 segundos
    setTimeout(() => {
      setProposalCreatedSuccess(false);
    }, 20000);
  };

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

              {/* Indicadores de votos y delegación */}
              <div className="mb-4 p-4 rounded-xl bg-white/10 border border-white/20">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm text-white/80">
                    <div>Votos actuales: <span className="font-semibold">{myVotes.toString()}</span></div>
                    <div>Umbral propuesta: <span className="font-semibold">{threshold.toString()}</span></div>
                    {delegatee && (
                      <div>
                        Delegado a: <span className="font-mono">{delegatee.slice(0, 6)}…{delegatee.slice(-4)}</span>
                      </div>
                    )}
                  </div>

                  {myVotes < threshold && (
                    <TransactionButton
                      transaction={() => {
                        if (!governanceToken || !account) throw new Error("Conecta una wallet");
                        return prepareContractCall({
                          contract: governanceToken,
                          method: "function delegate(address delegatee)",
                          params: [account.address],
                        });
                      }}
                      onTransactionConfirmed={() => {
                        // refrescar datos y avisar que hay que esperar ~1 bloque
                        setTimeout(() => setManualRefresh(prev => prev + 1), 1500);
                        alert("Delegación realizada. Espera ~1 bloque y luego vuelve a intentar crear la propuesta.");
                      }}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium"
                    >
                      Delegar votos a mí
                    </TransactionButton>
                  )}
                </div>
              </div>
            
              <TransactionButton
                transaction={ async() => {
                  try {
                    
                    if (!account) throw new Error("No se ha seleccionado una cuenta");
                    if (!activeChain || activeChain.id !== myChain.id) {
                      await switchChain(myChain);
                    }
                    if (!governor) {
                      throw new Error("Governor contract not available");
                    }
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
                  setIsCreatingProposal(true);
                  console.log("Transacción enviada, esperando confirmación...");
                }}
                onError={(e)=> {
                  setIsCreatingProposal(false);
                  console.error("Error al crear propuesta:", e);
                  alert( e?.message ||String(e));
                }}
                className="w-full md:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                disabled={isCreatingProposal || myVotes < threshold}
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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
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
              
              {/* Botón de refresh manual */}
              <button
                onClick={manualRefreshProposals}
                disabled={isLoadingProposals}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                <svg 
                  className={`w-4 h-4 ${isLoadingProposals ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isLoadingProposals ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
            <div className="grid gap-4">
              {proposals.map((p) => {
                const idShort = `#${p.id.slice(0, 6)}…${p.id.slice(-4)}`;
                
                // Usar estado real del contrato en lugar de calcularlo
                const now = Math.floor(Date.now() / 1000);
                const startTime = p.voteStartTimestamp || 0;
                const endTime = p.voteEndTimestamp || 0;
                
                // Mapear estados del contrato a texto legible
                const stateMap = {
                  0: "Pending",      // Pending
                  1: "Active",       // Active  
                  2: "Canceled",     // Canceled
                  3: "Defeated",     // Defeated
                  4: "Succeeded",    // Succeeded
                  5: "Queued",       // Queued
                  6: "Expired",      // Expired
                  7: "Executed"      // Executed
                };
                
                const contractState = p.contractState || 0;
                const status = stateMap[contractState as keyof typeof stateMap] || "Unknown";
                
                // Determinar si se puede ejecutar basado en el estado del contrato
                const canExecute = contractState === 4; // Succeeded
                
                // Colores de badge basados en estado
                let badgeColor = "bg-gray-200 text-gray-700";
                if (status === "Active") badgeColor = "bg-green-100 text-green-700";
                else if (status === "Pending") badgeColor = "bg-yellow-100 text-yellow-700";
                else if (status === "Succeeded") badgeColor = "bg-blue-100 text-blue-700";
                else if (status === "Executed") badgeColor = "bg-purple-100 text-purple-700";
                
                // Calcular tiempo restante solo si tenemos timestamps válidos
                let timeRemainingText = "N/A";
                if (startTime > 0 && endTime > 0) {
                  const timeRemaining = endTime - now;
                  timeRemainingText = timeRemaining > 0 
                    ? `${Math.floor(timeRemaining / 86400)}d ${Math.floor((timeRemaining % 86400) / 3600)}h`
                    : "Finalizada";
                }
                
                // Debug: mostrar información completa
                console.log(`Proposal ${p.id} info:`, {
                  contractState: contractState,
                  status: status,
                  canExecute: canExecute,
                  voteStartTimestamp: p.voteStartTimestamp,
                  voteEndTimestamp: p.voteEndTimestamp,
                  formattedStart: formatDate(startTime),
                  formattedEnd: formatDate(endTime),
                  timeRemaining: timeRemainingText
                });
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
                            <div>
                              <div className="text-white/80 font-medium">Inicio:</div>
                              <div>{formatDate(startTime)}</div>
                            </div>
                            <div>
                              <div className="text-white/80 font-medium">Fin:</div>
                              <div>{formatDate(endTime)}</div>
                            </div>
                            <div>
                              <div className="text-white/80 font-medium">Tiempo restante:</div>
                              <div className={status === "Activa" ? "text-green-400 font-medium" : "text-gray-400"}>
                                {timeRemainingText}
                              </div>
                            </div>
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
                        transaction={() => {
                          if (!governor) throw new Error("Governor contract not available");
                          return prepareContractCall({
                            contract: governor,
                            method: "function castVote(uint256 proposalId, uint8 support)",
                            params: [BigInt(p.id), 0],
                          });
                        }}
                        className="flex-1 md:flex-none px-4 py-2 rounded-xl border border-red-400/50 text-red-300 hover:bg-red-500/20 hover:border-red-400 transition-all duration-200 font-medium"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        En Contra
                      </TransactionButton>
                      <TransactionButton
                        transaction={() => {
                          if (!governor) throw new Error("Governor contract not available");
                          return prepareContractCall({
                            contract: governor,
                            method: "function castVote(uint256 proposalId, uint8 support)",
                            params: [BigInt(p.id), 1],
                          });
                        }}
                        className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        A Favor
                      </TransactionButton>
                      <TransactionButton
                        transaction={() => {
                          if (!governor) throw new Error("Governor contract not available");
                          return prepareContractCall({
                            contract: governor,
                            method: "function castVote(uint256 proposalId, uint8 support)",
                            params: [BigInt(p.id), 2],
                          });
                        }}
                        className="flex-1 md:flex-none px-4 py-2 rounded-xl border border-yellow-400/50 text-yellow-300 hover:bg-yellow-500/20 hover:border-yellow-400 transition-all duration-200 font-medium"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Abstener
                      </TransactionButton>
                      {/* Debug: mostrar información sobre la condición del botón ejecutar */}
                      <div className="text-xs text-white/50 mr-2">
                        Debug: Estado={status}, CanExecute={canExecute ? 'true' : 'false'}, EndTime={formatDate(endTime)}
                      </div>
                      {canExecute && p.targets && p.values && p.calldatas && (
                        <TransactionButton
                          transaction={() => {
                            if (!governor) throw new Error("Governor contract not available");
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
            {/* Sección de Período de Votación */}
            <div className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="text-lg font-semibold text-white">Período de Votación</h4>
              </div>
              
              <p className="text-xs text-white/70 mb-4">
                El período de votación debe estar entre <span className="font-semibold text-purple-300">1 minuto</span> y <span className="font-semibold text-purple-300">30 días</span>. Solo el owner puede cambiar este valor.
              </p>
              
              {/* Mostrar período actual */}
              {currentVotingPeriod !== null && (
                <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-sm text-white/80 mb-1">Período actual configurado:</div>
                  <div className="text-lg font-bold text-purple-300">
                    {(() => {
                      const seconds = Number(currentVotingPeriod);
                      const days = Math.floor(seconds / 86400);
                      const hours = Math.floor((seconds % 86400) / 3600);
                      const minutes = Math.floor((seconds % 3600) / 60);
                      const parts = [];
                      if (days > 0) parts.push(`${days} día${days > 1 ? 's' : ''}`);
                      if (hours > 0) parts.push(`${hours} hora${hours > 1 ? 's' : ''}`);
                      if (minutes > 0) parts.push(`${minutes} minuto${minutes > 1 ? 's' : ''}`);
                      return parts.length > 0 ? parts.join(', ') : '0 minutos';
                    })()}
                  </div>
                </div>
              )}
              
              {/* Campos de entrada para días, horas, minutos */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                {/* Campo de días */}
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-2">
                    Días
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="0"
                    value={votingDays}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || (parseInt(val) >= 0 && parseInt(val) <= 30)) {
                        setVotingDays(val);
                      }
                    }}
                    disabled={!isOwner}
                  />
                </div>
                
                {/* Campo de horas */}
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-2">
                    Horas
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="0"
                    value={votingHours}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || (parseInt(val) >= 0 && parseInt(val) <= 23)) {
                        setVotingHours(val);
                      }
                    }}
                    disabled={!isOwner}
                  />
                </div>
                
                {/* Campo de minutos */}
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-2">
                    Minutos
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="0"
                    value={votingMinutes}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || (parseInt(val) >= 0 && parseInt(val) <= 59)) {
                        setVotingMinutes(val);
                      }
                    }}
                    disabled={!isOwner}
                  />
                </div>
              </div>
              
                            {/* Botón para actualizar período (solo si es owner) */}
                            {isOwner && (votingDays || votingHours || votingMinutes) && (
                <button
                  onClick={async () => {
                    if (!governor || !adminAccount) {
                      alert("Admin wallet no disponible");
                      return;
                    }
                    
                    try {
                      const validation = validateVotingPeriod(votingDays, votingHours, votingMinutes);
                      if (!validation.valid) {
                        alert(validation.error);
                        return;
                      }
                      
                      const totalSeconds = convertToSeconds(votingDays, votingHours, votingMinutes);
                      
                      const tx = prepareContractCall({
                        contract: governor,
                        method: "function setVotingPeriod(uint256 newPeriodSeconds)",
                        params: [totalSeconds],
                      });
                      
                      // Ejecutar transacción usando adminAccount
                      const { transactionHash } = await sendTransaction({
                        account: adminAccount,
                        transaction: tx,
                      });
                      
                      console.log("Transacción enviada:", transactionHash);
                      
                      // Limpiar campos y recargar período
                      setVotingDays("");
                      setVotingHours("");
                      setVotingMinutes("");
                      await loadCurrentVotingPeriod();
                      alert("Período de votación actualizado exitosamente");
                    } catch (error: any) {
                      console.error("Error actualizando período:", error);
                      alert(error?.message || String(error));
                    }
                  }}
                  disabled={!adminAccount}
                  className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium hover:from-purple-600 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Actualizar
                </button>
              )}
              
              {!isOwner && (
                <div className="text-xs text-yellow-300/80 italic p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  ⚠️ Solo el owner del contrato puede cambiar el período de votación
                </div>
              )}
            </div>          
          </div>
        </div>
      </div>
  );
}