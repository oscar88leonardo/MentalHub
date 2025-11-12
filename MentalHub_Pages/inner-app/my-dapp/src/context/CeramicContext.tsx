"use client"
import React, { createContext, useContext, useEffect, useState } from "react";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { ComposeClient } from "@composedb/client";
import { RuntimeCompositeDefinition } from "@composedb/types";
import { DIDSession } from "did-session";
import { EthereumWebAuth, getAccountId } from "@didtools/pkh-ethereum";
import { useActiveWallet, useAdminWallet, useActiveAccount } from "thirdweb/react";
import { EIP1193 } from "thirdweb/wallets";
import { client } from "@/lib/client";
import { myChain } from "@/config/chain";
import { definition } from "@/__generated__/definition.js";

// Types
interface InnerverProfile {
  id: string;
  name: string;
  displayName: string;
  email?: string;
  gender?: 'Masculino' | 'Femenino';
  birthDate?: string;
  country?: string;
  city?: string;
  timezone?: string;
  languages?: string[];
  primaryLanguage?: string;
  created?: string;
  createdAt?: string;
  rol: 'Terapeuta' | 'Consultante';
  pfp?: string;
  currencies?: string[];
  ratesByCurrency?: string[];
  hudds?: {
    edges: Array<{
      node: {
        id: string;
        name: string;
        roomId: string;
        created: string;
        state: 'Active' | 'Archived';
        schedules?: {
          edges: Array<{
            node: {
              id: string;
              created: string;
              date_init: string;
              date_finish: string;
              state: 'Pending' | 'Active' | 'Finished' | 'Archived';
              NFTContract: string;
              TokenID: number;
              profile: {
                id: string;
                name: string;
                displayName: string;
              };
            };
          }>;
        };
      };
    }>;
  };
  sched_therap?: {
    edges: Array<{
      node: {
        id: string;
        date_init: string;
        date_finish: string;
        created: string;
        state: 'Active' | 'Archived';
      };
    }>;
  };
  schedules?: {
    edges: Array<{
      node: {
        id: string;
        created: string;
        date_init: string;
        date_finish: string;
        huddId: string;
        profileId: string;
        state: 'Pending' | 'Active' | 'Finished' | 'Archived';
        NFTContract: string;
        TokenID: number;
        hudd: {
          roomId: string;
          profileId: string;
        };
      };
    }>;
  };
}

// Perfiles extendidos (sin versionado)
export interface TherapistProfile {
  id: string;
  profileId: string;
  degrees?: string[];
  licenseNumber?: string;
  licenseJurisdiction?: string;
  licenseCountry?: string;
  yearsExperience?: number;
  approaches?: string[];
  specialties?: string[];
  populations?: string[];
  bioShort: string;
  bioLong?: string;
  introVideoUrl?: string;
  acceptingNewClients?: boolean;
  roomId?: string;
}

export interface ConsultantProfile {
  id: string;
  profileId: string;
  presentingProblemShort: string;
  goals?: string[];
  therapistGenderPreference?: string;
  emergencyContactName?: string;
  emergencyContactPhoneE164?: string;
  consentTerms?: boolean;
  consentPrivacy?: boolean;
  consentTelehealthRisks?: boolean;
  consentedAt?: string; // ISO
  priorTherapy?: boolean;
  priorPsychiatry?: boolean;
  medicationsUsed?: boolean;
  medicationsNote?: string;
  diagnoses?: string[];
}

interface ProfileQueryResult {
  data?: {
    viewer?: {
      innerverProfile?: InnerverProfile;
    };
  };
  errors?: Array<{ message: string }>;
}

interface CeramicContextType {
  // Connection state
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  hasPersistedSession: boolean;
  
  // Clients
  ceramic: CeramicClient | null;
  composeClient: ComposeClient | null;
  
  // User data
  profile: InnerverProfile | null;
  therapist: TherapistProfile | null;
  consultant: ConsultantProfile | null;
  
  // Thirdweb wallet info (like my-app)
  activeWallet: any;
  account: any; // prefer AA if available
  adminWallet: any;
  adminAccount: any;
  
  // Methods
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  executeQuery: (query: string, variables?: Record<string, any>) => Promise<any>;
  authenticateForWrite: (streamId?: string) => Promise<boolean>; // authenticate only when needed; can include stream capability
  upsertTherapistProfile: (input: Partial<TherapistProfile> & { profileId?: string }) => Promise<string | null>;
  upsertConsultantProfile: (input: Partial<ConsultantProfile> & { profileId?: string }) => Promise<string | null>;
}

const CeramicContext = createContext<CeramicContextType | null>(null);

export const useCeramic = () => {
  const context = useContext(CeramicContext);
  if (!context) {
    throw new Error("useCeramic must be used within a CeramicProvider");
  }
  return context;
};

interface CeramicProviderProps {
  children: React.ReactNode;
}

export const CeramicProvider: React.FC<CeramicProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ceramic, setCeramic] = useState<CeramicClient | null>(null);
  const [composeClient, setComposeClient] = useState<ComposeClient | null>(null);
  const [profile, setProfile] = useState<InnerverProfile | null>(null);
  const [therapist, setTherapist] = useState<TherapistProfile | null>(null);
  const [consultant, setConsultant] = useState<ConsultantProfile | null>(null);
  const [isThirdwebReady, setIsThirdwebReady] = useState(false);
  const [hasPersistedSession, setHasPersistedSession] = useState(false);

  const activeWallet = useActiveWallet();
  const aaAccount = useActiveAccount();
  const account = aaAccount || (activeWallet ? activeWallet.getAccount() : null);
  const adminWallet = useAdminWallet();
  const adminAccount = adminWallet ? adminWallet.getAccount() : null;

  // Debug logging for wallet states and persistence
  useEffect(() => {
    console.log("🔍 Wallet state debug:", {
      activeWallet: !!activeWallet,
      account: !!account,
      adminWallet: !!adminWallet,
      adminAccount: !!adminAccount,
      accountAddress: account?.address,
      adminAddress: adminAccount?.address,
      activeWalletId: activeWallet?.id,
      adminWalletId: adminWallet?.id,
      isThirdwebReady
    });

    // Mark Thirdweb as ready when we have wallet info
    if (activeWallet || adminWallet) {
      setIsThirdwebReady(true);
      console.log("✅ Thirdweb is ready!");
      
      // Persist wallet state for page reloads
      if (account) {
        try {
          const chainIdDec = myChain.id;
          sessionStorage.setItem("thirdweb:account", JSON.stringify({
            address: account.address,
            walletId: activeWallet?.id,
            chainId: chainIdDec,
            timestamp: Date.now()
          }));
        } catch {}
        setHasPersistedSession(true);
        console.log("💾 Wallet state persisted to sessionStorage");
      }
    }
  }, [activeWallet, account, adminWallet, adminAccount, isThirdwebReady]);

  // Detect if we already have a persisted wallet session
  useEffect(() => {
    try {
      const persisted = sessionStorage.getItem("thirdweb:account");
      if (persisted) {
        setHasPersistedSession(true);
      }
    } catch {}
  }, []);

  // Create provider for Ceramic authentication (like my-app)
  const providerThirdweb = adminWallet
    ? EIP1193.toProvider({
        wallet: adminWallet,
        chain: myChain,
        client: client,
      })
    : null;

  // Initialize Ceramic clients only when Thirdweb is ready
  useEffect(() => {
    if (!isThirdwebReady) {
      console.log("⏳ Waiting for Thirdweb to be ready...");
      return;
    }

    const initClients = () => {
      try {
        console.log("🔧 Initializing Ceramic clients...");
        const ceramicClient = new CeramicClient("https://ceramicnode.innerverse.care");
        const composeClient = new ComposeClient({
          ceramic: (ceramicClient as unknown) as any, // ensure same instance is used internally
          definition: (definition as unknown) as RuntimeCompositeDefinition,
        });

        setCeramic(ceramicClient);
        setComposeClient(composeClient);
        console.log("✅ Ceramic clients initialized");
        try {
          console.log("📦 ComposeDB resources:", composeClient.resources);
        } catch {}
      } catch (err) {
        console.error("Error initializing Ceramic clients:", err);
        setError("Failed to initialize Ceramic clients");
      }
    };

    initClients();
  }, [isThirdwebReady]);

  // NO auto-conectar - La autenticación se hará SOLO cuando sea necesario

  const connect = async () => {
    console.log("🔌 Starting Ceramic connection...");
    console.log("Connection state:", {
      ceramic: !!ceramic,
      composeClient: !!composeClient,
      account: !!account,
      adminAccount: !!adminAccount,
      accountAddress: account?.address,
      adminAddress: adminAccount?.address,
      providerThirdweb: !!providerThirdweb
    });

    if (!ceramic || !composeClient) {
      throw new Error("Ceramic clients not initialized");
    }

    if (isConnected) {
      console.log("Already connected to ComposeDB");
      return; // Already connected, no need to re-login
    }

    if (!account) {
      throw new Error("No account detected. Connect your wallet first.");
    }

    // Always use adminAccount for Ceramic authentication (like my-app)
    if (!adminAccount) {
      throw new Error("No admin account detected. Admin wallet required for Ceramic authentication.");
    }
    
    const authAccount = adminAccount;
    const authProvider = providerThirdweb;

    if (!authProvider) {
      console.error("Provider is not initialized");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("🔑 Creating new Ceramic session (in memory only)...");
      // Ensure correct chain before getting accountId
      try {
        const targetChainIdHex = `0x${myChain.id.toString(16)}`; // chain from NEXT_PUBLIC_CHAIN
        const currentChainId = await authProvider.request?.({ method: "eth_chainId" });
        console.log("Current chainId:", currentChainId);
        if ((currentChainId || "").toLowerCase() !== targetChainIdHex) {
          console.log("Switching chain to:", targetChainIdHex);
          try {
            await authProvider.request?.({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: targetChainIdHex }],
            });
          } catch (switchErr) {
            console.warn("wallet_switchEthereumChain failed, trying adminWallet.switchChain...", switchErr);
            try {
              await adminWallet?.switchChain?.(myChain);
            } catch (e) {
              console.error("Failed to switch chain:", e);
              throw new Error(`Unable to switch to required chain (${myChain.id})`);
            }
          }
        }
      } catch (cidErr) {
        console.warn("Could not verify/switch chain:", cidErr);
      }

      // Ensure provider will sign with the expected admin address
      try {
        const accounts = (await authProvider.request?.({ method: "eth_accounts" })) as string[] | undefined;
        console.log("Provider eth_accounts:", accounts);
        const expected = authAccount.address.toLowerCase();
        const hasExpected = (accounts || []).some(a => a.toLowerCase() === expected);
        if (!hasExpected) {
          console.warn("Provider active account does not match admin address. Requesting accounts...");
          const req = (await authProvider.request?.({ method: "eth_requestAccounts" })) as string[] | undefined;
          console.log("eth_requestAccounts returned:", req);
          const nowHasExpected = (req || []).some(a => a.toLowerCase() === expected);
          if (!nowHasExpected) {
            throw new Error("El provider no está firmando con la cuenta admin esperada " + authAccount.address);
          }
        }
      } catch (accErr) {
        console.error("Account selection/verification failed:", accErr);
        throw accErr;
      }
      
      // Get the account ID
      let accountId;
      try {
        const address = authAccount?.address || "";
        console.log("Getting account ID for address:", address);
        accountId = await getAccountId(authProvider, address);
        console.log("✅ Account ID obtained");
      } catch (error) {
        console.error("❌ Error getting account ID:", error);
        throw new Error(`Failed to get account ID: ${error}`);
      }

      // Get auth method
      let authMethod;
      try {
        console.log("Getting auth method...");
        authMethod = await EthereumWebAuth.getAuthMethod(authProvider, accountId);
        console.log("✅ Auth method obtained");
      } catch (error) {
        console.error("❌ Error getting auth method:", error);
        throw new Error(`Failed to get auth method: ${error}`);
      }

      // Create DID session (THIS IS WHERE METAMASK SHOULD POPUP)
      let session;
      try {
        if (!composeClient.resources || composeClient.resources.length === 0) {
          throw new Error("ComposeDB resources are empty. Check your generated definition.");
        }
        // Force fresh session to avoid stale CACAO/resources from other apps on same origin
        try {
          localStorage.removeItem('did-session');
          sessionStorage.removeItem('ceramic:eth_did');
        } catch {}
        console.log("🔐 Authorizing DID session - MetaMask popup should appear NOW...");
        console.log("Resources to authorize:", composeClient.resources);
        session = await (DIDSession as any).authorize(authMethod, {
          resources: composeClient.resources,
          expiresInSecs: 60 * 60 * 24, // 1 day
          domain: window.location.hostname,
        });
        console.log("✅ DID session created");
      } catch (error) {
        console.error("❌ Error creating DID session:", error);
        throw new Error(`Failed to create DID session: ${error}`);
      }

      // Set DID on clients (NO SAVE TO SESSIONSTORAGE)
      composeClient.setDID(session.did);
      ceramic.did = session.did;
      setIsConnected(true);
      
      console.log("✅ Ceramic authenticated successfully (session in memory only)");
      console.log("DID:", session.did.id, "(did:key is expected for session DIDs; controller is your did:pkh)");
      try { console.log("compose.ceramic.did:", (composeClient as any)?.ceramic?.did?.id); } catch {}

    } catch (err) {
      console.error("❌ Error connecting to Ceramic:", err);
      setError(err instanceof Error ? err.message : "Failed to connect to Ceramic");
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Método para autenticar SOLO cuando se necesite escribir
  const authenticateForWrite = async (streamId?: string) => {
    console.log("🔐 Authentication required for write operation...", { streamId });
    if (!composeClient || !ceramic) throw new Error("Clients not initialized");

    // If already connected and no extra resource needed, we're good
    if (isConnected && !streamId) {
      console.log("✅ Already authenticated");
      return true;
    }

    // If we need stream capability, or not connected yet, (re)authorize including the stream
    try {
      if (!adminAccount || !providerThirdweb) throw new Error("Wallet/provider not ready");

      // Ensure chain/account state
      await providerThirdweb.request?.({ method: "eth_chainId" });
      const accountId = await getAccountId(providerThirdweb, adminAccount.address);
      const authMethod = await EthereumWebAuth.getAuthMethod(providerThirdweb, accountId);

      const baseResources = composeClient.resources || [];
      const extra = streamId ? [`ceramic://${streamId}`] : [];
      const resources = [...baseResources, ...extra];
      console.log("🔐 Re-authorizing with resources:", resources);

      const session = await (DIDSession as any).authorize(authMethod, {
        resources,
        expiresInSecs: 60 * 60 * 24,
        domain: window.location.hostname,
      });
      composeClient.setDID(session.did);
      ceramic.did = session.did;
      setIsConnected(true);
      console.log("✅ Re-authorized DID:", session.did.id);
      return true;
    } catch (error) {
      console.error("❌ Authentication failed:", error);
      throw error;
    }
  };

  const disconnect = async () => {
    try {
      // Clear DID from clients (no sessionStorage to clear)
      if (composeClient) {
        composeClient.setDID(undefined as any);
      }
      if (ceramic) {
        ceramic.did = undefined as any;
      }

      setIsConnected(false);
      setProfile(null);
      setError(null);
      
      console.log("🔓 Disconnected from Ceramic (memory session cleared)");
    } catch (err) {
      console.error("Error disconnecting from Ceramic:", err);
    }
  };

  const refreshProfile = async () => {
    if (!composeClient) {
      console.log("ComposeDB not initialized, skipping profile refresh");
      return;
    }
    
    // Para LECTURA no se requiere autenticación
    if (!isConnected) {
      console.log("ℹ️ Reading profile without authentication (read-only mode)");
    }

    try {
      // Primero probemos con una consulta simple
      console.log("🔍 Testing simple query first...");
      const simpleQuery = `
        query {
          viewer {
            innerverProfile {
              id
              name
              displayName
              rol
              pfp
              email
              gender
              birthDate
              country
              city
              timezone
              languages
              primaryLanguage
              currencies
              ratesByCurrency
              created
            }
          }
        }
      `;

      const simpleResult = await composeClient.executeQuery(simpleQuery);
      console.log("Simple query result:", JSON.stringify(simpleResult, null, 2));

      /* Si funciona, probemos con la consulta completa
      const query = `
        query {
          viewer {
            innerverProfile {
              id
              name
              displayName
              rol
              pfp
              hudds(last: 100, filters: {where: {state: {in: Active}}}) {
                edges {
                  node {
                    id
                    name
                    roomId
                    created
                    state
                    schedules(filters: {where: {state: {in: [Pending,Active]}}}, last: 100) {
                      edges {
                        node {
                          created
                          date_finish
                          date_init
                          profileId
                          profile {
                            id
                            name
                            displayName
                          }
                          state
                          id
                          NFTContract
                          TokenID
                        }
                      }
                    }
                  }
                }
              }
              sched_therap(last: 100, filters: {where: {state: {in: Active}}}) {
                edges {
                  node {
                    id
                    date_init
                    date_finish
                    created
                    state
                  }
                }
              }
              schedules(filters: {where: {state: {in: [Pending,Active]}}}, last: 100) {
                edges {
                  node {
                    created
                    date_finish
                    date_init
                    huddId
                    hudd {
                      roomId
                      profileId
                    }
                    profileId
                    state
                    id
                    NFTContract
                    TokenID
                  }
                }
              }
            }
          }
        }
      `;*/

      // Usar el resultado simple primero
      const result = simpleResult as ProfileQueryResult;
      
      console.log("=== CERAMIC QUERY RESULT ===");
      console.log("Full result:", JSON.stringify(result, null, 2));
      console.log("Result data:", result?.data);
      console.log("Result errors:", result?.errors);
      console.log("Viewer:", result?.data?.viewer);
      console.log("InnerverProfile:", result?.data?.viewer?.innerverProfile);
      console.log("==========================");
      
      if (result?.data?.viewer?.innerverProfile) {
        const base = result.data.viewer.innerverProfile as InnerverProfile;
        if (base && base.created && !base.createdAt) (base as any).createdAt = base.created;
        setProfile(base);
        console.log("✅ Profile loaded successfully (viewer):", result.data.viewer.innerverProfile);
        // try to load v2 extended profiles using relationFrom
        try {
          const pid = result.data.viewer.innerverProfile.id;
          const extQ = `
            query {
              node(id: "${pid}") {
                ... on InnerverProfile {
                  therapist(first: 1) {
                    edges {
                      node {
                        id
                        profileId
                        degrees
                        licenseNumber
                        licenseJurisdiction
                        licenseCountry
                        yearsExperience
                        approaches
                        specialties
                        populations
                        bioShort
                        bioLong
                        introVideoUrl
                        acceptingNewClients
                        roomId
                      }
                    }
                  }
                  consultant(first: 1) {
                    edges {
                      node {
                        id
                        profileId
                        presentingProblemShort
                        goals
                        therapistGenderPreference
                        emergencyContactName
                        emergencyContactPhoneE164
                        consentTerms
                        consentPrivacy
                        consentTelehealthRisks
                        consentedAt
                        priorTherapy
                        priorPsychiatry
                        medicationsUsed
                        medicationsNote
                        diagnoses
                      }
                    }
                  }
                }
              }
            }
          `;
          const extRes: any = await composeClient.executeQuery(extQ);
          const tNode = extRes?.data?.node?.therapist?.edges?.[0]?.node || null;
          const cNode = extRes?.data?.node?.consultant?.edges?.[0]?.node || null;
          setTherapist(tNode);
          setConsultant(cNode);
        } catch (e) {
          console.warn("Failed to load extended profiles:", e);
          setTherapist(null);
          setConsultant(null);
        }
        return; // completed success path
      }

      // Fallback sin firma: resolver por DID de la wallet (did:pkh)
      const walletAddress = (adminAccount?.address || account?.address || "").toLowerCase();
      if (!walletAddress) {
        console.log("⚠️ No wallet address available to resolve profile by DID (keeping existing profile state)");
        return;
      }

      const did = `did:pkh:eip155:${myChain.id}:${walletAddress}`;
      console.log("🔎 Fallback by DID (node->CeramicAccount)", did);

      // Intento A: node(id: DID) -> CeramicAccount.innerverProfile
      const byAccountQuery = `
        query($did: ID!) {
          node(id: $did) {
            ... on CeramicAccount {
              id
              innerverProfile {
                id
                name
                displayName
                rol
                pfp
                email
                gender
                birthDate
                country
                city
                timezone
                languages
                primaryLanguage
                currencies
                ratesByCurrency
                created
              }
            }
          }
        }
      `;
      const byAccountRes: any = await composeClient.executeQuery(byAccountQuery, { did });
      console.log("byAccountRes:", JSON.stringify(byAccountRes, null, 2));
      const accProfile = byAccountRes?.data?.node?.innerverProfile as InnerverProfile | undefined;
      if (accProfile) {
        if (accProfile.created && !accProfile.createdAt) (accProfile as any).createdAt = accProfile.created;
        setProfile(accProfile);
        console.log("✅ Profile loaded successfully (by DID node)", accProfile);
        // Also try extended
        try {
          const pid = accProfile.id;
          const extQ = `
            query {
              node(id: "${pid}") {
                ... on InnerverProfile {
                  therapist(first: 1) { edges { node { id profileId degrees licenseNumber licenseJurisdiction licenseCountry yearsExperience approaches specialties populations bioShort bioLong introVideoUrl acceptingNewClients roomId } } }
                  consultant(first: 1) { edges { node { id profileId presentingProblemShort goals therapistGenderPreference emergencyContactName emergencyContactPhoneE164 consentTerms consentPrivacy consentTelehealthRisks consentedAt priorTherapy priorPsychiatry medicationsUsed medicationsNote diagnoses } } }
                }
              }
            }
          `;
          const extRes: any = await composeClient.executeQuery(extQ);
          const tNode = extRes?.data?.node?.therapist?.edges?.[0]?.node || null;
          const cNode = extRes?.data?.node?.consultant?.edges?.[0]?.node || null;
          setTherapist(tNode);
          setConsultant(cNode);
        } catch (e) {
          console.warn("Failed to load extended profiles:", e);
          setTherapist(null);
          setConsultant(null);
        }
        return;
      }

      // Intento B: índice del modelo por controller
      console.log("🔎 Fallback by model index (controller)");
      const byIndexQuery = `
        query($did: ID!) {
          innerverProfileIndex(filters: { where: { controller: { equalTo: $did } } }, first: 1) {
            edges {
              node {
                id
                name
                displayName
                rol
                pfp
                email
                gender
                birthDate
                country
                city
                timezone
                languages
                primaryLanguage
                created
              }
            }
          }
        }
      `;
      const byIndexRes: any = await composeClient.executeQuery(byIndexQuery, { did });
      console.log("byIndexRes:", JSON.stringify(byIndexRes, null, 2));
      const idxNode = byIndexRes?.data?.innerverProfileIndex?.edges?.[0]?.node as InnerverProfile | undefined;
      if (idxNode) {
        if (idxNode.created && !idxNode.createdAt) (idxNode as any).createdAt = idxNode.created;
        setProfile(idxNode);
        console.log("✅ Profile loaded successfully (by index)", idxNode);
        // Also try extended
        try {
          const pid = idxNode.id;
      const extQ = `
        query {
          node(id: "${pid}") {
            ... on InnerverProfile {
              therapist(first: 1) { edges { node { id profileId degrees licenseNumber licenseJurisdiction licenseCountry yearsExperience approaches specialties populations bioShort bioLong introVideoUrl acceptingNewClients roomId } } }
              consultant(first: 1) { edges { node { id profileId presentingProblemShort goals therapistGenderPreference emergencyContactName emergencyContactPhoneE164 consentTerms consentPrivacy consentTelehealthRisks consentedAt priorTherapy priorPsychiatry medicationsUsed medicationsNote diagnoses } } }
            }
          }
        }
      `;
          const extRes: any = await composeClient.executeQuery(extQ);
          const tNode = extRes?.data?.node?.therapist?.edges?.[0]?.node || null;
          const cNode = extRes?.data?.node?.consultant?.edges?.[0]?.node || null;
          setTherapist(tNode);
          setConsultant(cNode);
        } catch (e) {
          console.warn("Failed to load extended profiles:", e);
          setTherapist(null);
          setConsultant(null);
        }
        return;
      }

      console.log("❌ No profile found by viewer nor DID/index");
      setProfile(null);
    } catch (err) {
      console.error("Error loading profile:", err);
      setError(err instanceof Error ? err.message : "Failed to load profile");
    }
  };

  const executeQuery = async (query: string, variables?: Record<string, any>) => {
    if (!composeClient) {
      throw new Error("ComposeDB not initialized");
    }
    // Pasar variables si se proporcionan
    try {
      return await composeClient.executeQuery(query, variables);
    } catch {
      // Fallback por seguridad sin variables
      return await composeClient.executeQuery(query);
    }
  };

  // Helper: escape string for GraphQL literal
  const gq = (s?: string | null) => {
    if (s === undefined || s === null) return "";
    return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  };

  const upsertTherapistProfile = async (input: Partial<TherapistProfile> & { profileId?: string }) => {
    if (!profile && !input.profileId) throw new Error("Se requiere profileId (InnerverProfile) para crear/actualizar");
    const pid = input.profileId || profile?.id!;
    const currentId = therapist?.id;
    await authenticateForWrite(currentId);

    const p: Partial<TherapistProfile> = {
      profileId: pid,
      degrees: input.degrees ?? therapist?.degrees,
      licenseNumber: input.licenseNumber ?? therapist?.licenseNumber,
      licenseJurisdiction: input.licenseJurisdiction ?? therapist?.licenseJurisdiction,
      licenseCountry: input.licenseCountry ?? therapist?.licenseCountry,
      yearsExperience: input.yearsExperience ?? therapist?.yearsExperience,
      approaches: input.approaches ?? therapist?.approaches,
      specialties: input.specialties ?? therapist?.specialties,
      populations: input.populations ?? therapist?.populations,
      bioShort: input.bioShort ?? therapist?.bioShort,
      bioLong: input.bioLong ?? therapist?.bioLong,
      introVideoUrl: input.introVideoUrl ?? therapist?.introVideoUrl,
      acceptingNewClients: input.acceptingNewClients ?? therapist?.acceptingNewClients,
      roomId: input.roomId ?? therapist?.roomId,
    };

    if (!p.bioShort) {
      throw new Error("Debes completar la bio corta antes de guardar.");
    }

    const listToGql = (arr?: string[]) =>
      (Array.isArray(arr) && arr.length ? `[${arr.map((x) => `"${gq(x)}"`).join(", ")}]` : "");
    const parts: string[] = [];
    if (!currentId) parts.push(`profileId: "${gq(p.profileId as string)}"`);
    parts.push(`bioShort: "${gq(p.bioShort)}"`);

    const pushStr = (k: string, v?: string | null) => { if (v && v.trim().length) parts.push(`${k}: "${gq(v)}"`); };
    const pushInt = (k: string, v?: number | null) => { if (typeof v === "number" && Number.isFinite(v)) parts.push(`${k}: ${v}`); };
    const pushBool = (k: string, v?: boolean | null) => { if (typeof v === "boolean") parts.push(`${k}: ${v}`); };

    pushStr("licenseNumber", p.licenseNumber as string | undefined);
    pushStr("licenseJurisdiction", p.licenseJurisdiction as string | undefined);
    pushStr("licenseCountry", p.licenseCountry as string | undefined);
    pushInt("yearsExperience", p.yearsExperience as number | undefined);
    pushStr("bioLong", p.bioLong as string | undefined);
    pushStr("introVideoUrl", p.introVideoUrl as string | undefined);
    pushBool("acceptingNewClients", p.acceptingNewClients as boolean | undefined);
    pushStr("roomId", p.roomId as string | undefined);
    if (Array.isArray(p.degrees) && p.degrees.length) parts.push(`degrees: ${listToGql(p.degrees)}`);
    if (Array.isArray(p.approaches) && p.approaches.length) parts.push(`approaches: ${listToGql(p.approaches)}`);
    if (Array.isArray(p.specialties) && p.specialties.length) parts.push(`specialties: ${listToGql(p.specialties)}`);
    if (Array.isArray(p.populations) && p.populations.length) parts.push(`populations: ${listToGql(p.populations)}`);

    const content = parts.join("\n                ");
    const q = currentId
      ? `
        mutation {
          updateTherapistProfile(
            input: {
              id: "${currentId}"
              content: {
                ${content}
              }
            }
          ) { document { id } }
        }
      `
      : `
        mutation {
          createTherapistProfile(
            input: {
              content: {
                ${content}
              }
            }
          ) { document { id } }
        }
      `;
    const res = await executeQuery(q);
    if (res?.errors?.length) {
      console.error("TherapistProfile mutation error:", JSON.stringify(res.errors, null, 2));
      throw new Error(res.errors.map((e: any) => e.message).join(" | "));
    }
    const id: string | undefined =
      res?.data?.updateTherapistProfile?.document?.id || res?.data?.createTherapistProfile?.document?.id;
    await refreshProfile();
    return id || null;
  };

  const upsertConsultantProfile = async (input: Partial<ConsultantProfile> & { profileId?: string }) => {
    if (!profile && !input.profileId) throw new Error("Se requiere profileId (InnerverProfile) para crear/actualizar");
    const pid = input.profileId || profile?.id!;
    const currentId = consultant?.id;
    await authenticateForWrite(currentId);

    const p: Partial<ConsultantProfile> = {
      profileId: pid,
      presentingProblemShort: input.presentingProblemShort ?? consultant?.presentingProblemShort,
      goals: input.goals ?? consultant?.goals,
      therapistGenderPreference: input.therapistGenderPreference ?? consultant?.therapistGenderPreference,
      emergencyContactName: input.emergencyContactName ?? consultant?.emergencyContactName,
      emergencyContactPhoneE164: input.emergencyContactPhoneE164 ?? consultant?.emergencyContactPhoneE164,
      consentTerms: input.consentTerms ?? consultant?.consentTerms,
      consentPrivacy: input.consentPrivacy ?? consultant?.consentPrivacy,
      consentTelehealthRisks: input.consentTelehealthRisks ?? consultant?.consentTelehealthRisks,
      consentedAt: input.consentedAt ?? consultant?.consentedAt,
      priorTherapy: input.priorTherapy ?? consultant?.priorTherapy,
      priorPsychiatry: input.priorPsychiatry ?? consultant?.priorPsychiatry,
      medicationsUsed: input.medicationsUsed ?? consultant?.medicationsUsed,
      medicationsNote: input.medicationsNote ?? consultant?.medicationsNote,
      diagnoses: input.diagnoses ?? consultant?.diagnoses,
    };

    if (!p.presentingProblemShort) {
      throw new Error("Debes completar el motivo breve antes de guardar.");
    }

    const listToGql = (arr?: string[]) =>
      (Array.isArray(arr) && arr.length ? `[${arr.map((x) => `"${gq(x)}"`).join(", ")}]` : "");
    const parts: string[] = [];
    if (!currentId) parts.push(`profileId: "${gq(p.profileId as string)}"`);
    parts.push(`presentingProblemShort: "${gq(p.presentingProblemShort)}"`);

    const pushStr = (k: string, v?: string | null) => { if (v && v.trim().length) parts.push(`${k}: "${gq(v)}"`); };
    const pushBool = (k: string, v?: boolean | null) => { if (typeof v === "boolean") parts.push(`${k}: ${v}`); };

    if (Array.isArray(p.goals) && p.goals.length) parts.push(`goals: ${listToGql(p.goals)}`);
    pushStr("therapistGenderPreference", p.therapistGenderPreference as string | undefined);
    pushStr("emergencyContactName", p.emergencyContactName as string | undefined);
    pushStr("emergencyContactPhoneE164", p.emergencyContactPhoneE164 as string | undefined);
    pushBool("consentTerms", p.consentTerms as boolean | undefined);
    pushBool("consentPrivacy", p.consentPrivacy as boolean | undefined);
    pushBool("consentTelehealthRisks", p.consentTelehealthRisks as boolean | undefined);
    pushStr("consentedAt", p.consentedAt as string | undefined);
    pushBool("priorTherapy", p.priorTherapy as boolean | undefined);
    pushBool("priorPsychiatry", p.priorPsychiatry as boolean | undefined);
    pushBool("medicationsUsed", p.medicationsUsed as boolean | undefined);
    pushStr("medicationsNote", p.medicationsNote as string | undefined);
    if (Array.isArray(p.diagnoses) && p.diagnoses.length) parts.push(`diagnoses: ${listToGql(p.diagnoses)}`);

    const mutation = currentId
      ? `
        mutation {
          updateConsultantProfile(
            input: {
              id: "${currentId}"
              content: {
                ${parts.join("\n                ")}
              }
            }
          ) { document { id } }
        }
      `
      : `
        mutation {
          createConsultantProfile(
            input: {
              content: {
                ${parts.join("\n                ")}
              }
            }
          ) { document { id } }
        }
      `;
    const res = await executeQuery(mutation);
    if (res?.errors?.length) {
      console.error("ConsultantProfile mutation error:", JSON.stringify(res.errors, null, 2));
      throw new Error(res.errors.map((e: any) => e.message).join(" | "));
    }
    const id: string | undefined =
      res?.data?.updateConsultantProfile?.document?.id || res?.data?.createConsultantProfile?.document?.id;
    await refreshProfile();
    return id || null;
  };

  const contextValue: CeramicContextType = {
    isConnected,
    isLoading,
    error,
    hasPersistedSession,
    ceramic,
    composeClient,
    profile,
    therapist,
    consultant,
    // Thirdweb wallet info (like my-app)
    activeWallet,
    account,
    adminWallet,
    adminAccount,
    // Methods
    connect,
    disconnect,
    refreshProfile,
    executeQuery,
    authenticateForWrite, // NEW
    upsertTherapistProfile,
    upsertConsultantProfile,
  };

  return (
    <CeramicContext.Provider value={contextValue}>
      {children}
    </CeramicContext.Provider>
  );
};
