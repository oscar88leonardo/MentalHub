"use client"
import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from "react";
import { CeramicClient } from "@ceramic-sdk/http-client";
import { DIDSession } from "did-session";
import { EthereumWebAuth, getAccountId } from "@didtools/pkh-ethereum";
import { useActiveWallet, useAdminWallet, useActiveAccount } from "thirdweb/react";
import { EIP1193 } from "thirdweb/wallets";
import { client } from "@/lib/client";
import { myChain } from "@/config/chain";
import { CERAMIC_NODE_URL } from "@/lib/ceramicModels";
import { createCeramicQueryAdapter } from "@/lib/ceramicQueryAdapter";
import {
  loadProfile,
  saveProfile,
  loadTherapistProfile,
  loadConsultantProfile,
  saveTherapistProfile,
  saveConsultantProfile,
  didFromAddress,
} from "@/lib/ceramicProfileService";

// Types
export interface InnerverProfile {
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
  socialInstagram?: string;
  socialLinkedin?: string;
  socialFacebook?: string;
  socialX?: string;
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
  consentedAt?: string;
  priorTherapy?: boolean;
  priorPsychiatry?: boolean;
  medicationsUsed?: boolean;
  medicationsNote?: string;
  diagnoses?: string[];
}

interface CeramicContextType {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  hasPersistedSession: boolean;
  ceramic: CeramicClient | null;
  /** @deprecated Usar ceramic. Mantener por compatibilidad con componentes que verifican "client listo". */
  composeClient: CeramicClient | null;
  profile: InnerverProfile | null;
  therapist: TherapistProfile | null;
  consultant: ConsultantProfile | null;
  activeWallet: any;
  account: any;
  adminWallet: any;
  adminAccount: any;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refreshProfile: () => Promise<InnerverProfile | null>;
  executeQuery: (query: string, variables?: Record<string, any>) => Promise<any>;
  authenticateForWrite: (streamId?: string) => Promise<boolean>;
  upsertProfile: (content: {
    name: string;
    displayName: string;
    rol: "Terapeuta" | "Consultante";
    pfp?: string;
    email?: string;
    gender?: string;
    birthDate?: string;
    country?: string;
    city?: string;
    timezone?: string;
    languages?: string[];
    primaryLanguage?: string;
    currencies?: string[];
    ratesByCurrency?: string[];
    socialInstagram?: string;
    socialLinkedin?: string;
    socialFacebook?: string;
    socialX?: string;
  }) => Promise<InnerverProfile>;
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

/** Recursos para DIDSession (Ceramic SDK sin ComposeDB) */
const CERAMIC_RESOURCES = ["ceramic://*"];

export const CeramicProvider: React.FC<CeramicProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<InnerverProfile | null>(null);
  const [therapist, setTherapist] = useState<TherapistProfile | null>(null);
  const [consultant, setConsultant] = useState<ConsultantProfile | null>(null);
  const [isThirdwebReady, setIsThirdwebReady] = useState(false);
  const [hasPersistedSession, setHasPersistedSession] = useState(false);
  const sessionRef = useRef<DIDSession | null>(null);

  const { ceramic } = useMemo(() => {
    try {
      const client = new CeramicClient({ url: CERAMIC_NODE_URL });
      return { ceramic: client };
    } catch (err) {
      console.error("Error initializing Ceramic SDK:", err);
      return { ceramic: null };
    }
  }, []);

  const activeWallet = useActiveWallet();
  const aaAccount = useActiveAccount();
  const account = aaAccount || (activeWallet ? activeWallet.getAccount() : null);
  const adminWallet = useAdminWallet();
  const adminAccount = adminWallet ? adminWallet.getAccount() : null;

  const getDid = useMemo(
    () => () => {
      // Para perfiles/streams determinísticos usar SIEMPRE did:pkh (Ceramic CAIP-10).
      // session.did suele ser did:key y causa "Invalid digest" en getDeterministicStreamID.
      // Priorizar cualquier address de wallet sobre session.did.
      const addr = adminAccount?.address || account?.address;
      if (addr) return didFromAddress(addr, myChain.id);
      if (sessionRef.current?.did?.id) return sessionRef.current.did.id;
      return null;
    },
    [account?.address, adminAccount?.address]
  );

  const executeQuery = useMemo(
    () => createCeramicQueryAdapter(ceramic, getDid),
    [ceramic, getDid]
  );

  useEffect(() => {
    if (activeWallet || adminWallet) {
      setIsThirdwebReady(true);
      if (account) {
        try {
          sessionStorage.setItem("thirdweb:account", JSON.stringify({
            address: account.address,
            walletId: activeWallet?.id,
            chainId: myChain.id,
            timestamp: Date.now()
          }));
        } catch {}
        setHasPersistedSession(true);
      }
    }
  }, [activeWallet, account, adminWallet, adminAccount, isThirdwebReady]);

  useEffect(() => {
    try {
      const persisted = sessionStorage.getItem("thirdweb:account");
      if (persisted) setHasPersistedSession(true);
    } catch {}
  }, []);

  const providerThirdweb = adminWallet
    ? EIP1193.toProvider({
        wallet: adminWallet,
        chain: myChain,
        client: client,
      })
    : null;

  useEffect(() => {
    // Solo cargar perfil cuando hay sesión Ceramic autenticada (evita "Invalid digest" con DID derivado)
    if (ceramic && isConnected && sessionRef.current?.did?.id) {
      refreshProfile();
    }
  }, [ceramic, isConnected]);

  const connect = async () => {
    console.log("🔌 Starting Ceramic connection (Ceramic SDK)...");

    if (!ceramic) {
      throw new Error("Ceramic SDK not initialized");
    }

    if (isConnected) {
      console.log("Already connected");
      return;
    }

    if (!account) {
      throw new Error("No account detected. Connect your wallet first.");
    }

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
      try {
        const targetChainIdHex = `0x${myChain.id.toString(16)}`;
        const currentChainId = await authProvider.request?.({ method: "eth_chainId" });
        if ((currentChainId || "").toLowerCase() !== targetChainIdHex) {
          try {
            await authProvider.request?.({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: targetChainIdHex }],
            });
          } catch (switchErr) {
            try {
              await adminWallet?.switchChain?.(myChain);
            } catch (e) {
              throw new Error(`Unable to switch to required chain (${myChain.id})`);
            }
          }
        }
      } catch (cidErr) {
        console.warn("Could not verify/switch chain:", cidErr);
      }

      const accountId = await getAccountId(authProvider, authAccount.address);
      const authMethod = await EthereumWebAuth.getAuthMethod(authProvider, accountId);

      try {
        localStorage.removeItem('did-session');
        sessionStorage.removeItem('ceramic:eth_did');
      } catch {}

      console.log("🔐 Authorizing DID session...");
      const session = await (DIDSession as any).authorize(authMethod, {
        resources: CERAMIC_RESOURCES,
        expiresInSecs: 60 * 60 * 24,
        domain: typeof window !== "undefined" ? window.location.hostname : "localhost",
      });

      sessionRef.current = session;
      if (ceramic && session.did) {
        ceramic.did = session.did;
      }
      setIsConnected(true);
      console.log("✅ Ceramic authenticated (Ceramic SDK)");
      // Cargar perfil con el address que autenticó (evita race con getDid/state)
      const pkhDid = didFromAddress(authAccount.address, myChain.id);
      setTimeout(() => refreshProfile(pkhDid), 100);
    } catch (err) {
      console.error("❌ Error connecting to Ceramic:", err);
      setError(err instanceof Error ? err.message : "Failed to connect to Ceramic");
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const authenticateForWrite = async (streamId?: string) => {
    console.log("🔐 Authentication required for write...", { streamId });
    if (!ceramic) throw new Error("Ceramic SDK not initialized");

    if (isConnected && !streamId) {
      return true;
    }

    try {
      if (!adminAccount || !providerThirdweb) throw new Error("Wallet/provider not ready");

      const resources = streamId
        ? [...CERAMIC_RESOURCES, `ceramic://${streamId}`]
        : CERAMIC_RESOURCES;

      const accountId = await getAccountId(providerThirdweb, adminAccount.address);
      const authMethod = await EthereumWebAuth.getAuthMethod(providerThirdweb, accountId);

      const session = await (DIDSession as any).authorize(authMethod, {
        resources,
        expiresInSecs: 60 * 60 * 24,
        domain: typeof window !== "undefined" ? window.location.hostname : "localhost",
      });

      sessionRef.current = session;
      if (ceramic && session.did) {
        ceramic.did = session.did;
      }
      setIsConnected(true);
      return true;
    } catch (error) {
      console.error("❌ Authentication failed:", error);
      throw error;
    }
  };

  const disconnect = async () => {
    try {
      sessionRef.current = null;
      setIsConnected(false);
      setProfile(null);
      setTherapist(null);
      setConsultant(null);
      setError(null);
      console.log("🔓 Disconnected from Ceramic");
    } catch (err) {
      console.error("Error disconnecting:", err);
    }
  };

  const refreshProfile = async (overrideDid?: string): Promise<InnerverProfile | null> => {
    if (!ceramic) {
      console.log("Ceramic SDK not initialized, skipping profile refresh");
      return null;
    }
    const did = overrideDid ?? getDid();
    if (!did) {
      setProfile(null);
      setTherapist(null);
      setConsultant(null);
      return null;
    }
    try {
      // Normalizar DID pkh: address en minúsculas (Ceramic CAIP-10)
      const normalizedDid =
        did.startsWith("did:pkh:eip155:") && did.includes(":0x")
          ? did.replace(/:0x([a-fA-F0-9]+)$/, (_, addr) => `:0x${addr.toLowerCase()}`)
          : did;
      const profileData = await loadProfile(ceramic, normalizedDid);
      setProfile(profileData);
      if (!profileData) {
        setTherapist(null);
        setConsultant(null);
        return null;
      }
      // Cargar perfil extendido según rol (Terapeuta -> TherapistProfile, Consultante -> ConsultantProfile)
      const profileId = profileData.id;
      if (profileData.rol === "Terapeuta") {
        try {
          const therapistData = await loadTherapistProfile(
            ceramic,
            normalizedDid,
            profileId
          );
          setTherapist(therapistData);
          setConsultant(null);
        } catch (tErr) {
          console.warn("Error loading therapist profile:", tErr);
          setTherapist(null);
        }
      } else if (profileData.rol === "Consultante") {
        try {
          const consultantData = await loadConsultantProfile(
            ceramic,
            normalizedDid,
            profileId
          );
          setConsultant(consultantData);
          setTherapist(null);
        } catch (cErr) {
          console.warn("Error loading consultant profile:", cErr);
          setConsultant(null);
        }
      } else {
        setTherapist(null);
        setConsultant(null);
      }
      return profileData;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Error loading profile:", err);
      // "Invalid digest" suele ser DID con address en mayúsculas; no mostrar como error fatal
      if (msg.includes("Invalid digest")) {
        setProfile(null);
        setTherapist(null);
        setConsultant(null);
        return null;
      }
      setError(msg);
      setProfile(null);
      setTherapist(null);
      setConsultant(null);
      return null;
    }
  };

  const upsertProfile = async (
    content: {
      name: string;
      displayName: string;
      rol: "Terapeuta" | "Consultante";
      pfp?: string;
      email?: string;
      gender?: string;
      birthDate?: string;
      country?: string;
      city?: string;
      timezone?: string;
      languages?: string[];
      primaryLanguage?: string;
      currencies?: string[];
      ratesByCurrency?: string[];
      socialInstagram?: string;
      socialLinkedin?: string;
      socialFacebook?: string;
      socialX?: string;
    }
  ) => {
    if (!ceramic) throw new Error("Ceramic SDK not initialized");
    await authenticateForWrite();
    const session = sessionRef.current;
    if (!session?.did) throw new Error("Debes autenticarte primero (Authenticate Ceramic)");
    const pkhDid = getDid();
    const payload: Parameters<typeof saveProfile>[2] = { ...content };
    if (!profile?.id) {
      payload.created = new Date().toISOString();
    }
    const saved = await saveProfile(ceramic, session.did, payload, pkhDid ?? undefined);
    setProfile(saved);
    return saved;
  };

  const upsertTherapistProfile = async (
    input: Partial<TherapistProfile> & { profileId?: string }
  ): Promise<string | null> => {
    if (!ceramic) throw new Error("Ceramic SDK not initialized");
    if (!profile?.id) throw new Error("Debes crear primero el perfil base.");
    await authenticateForWrite(therapist?.id);
    const session = sessionRef.current;
    if (!session?.did) throw new Error("Debes autenticarte primero (Authenticate Ceramic)");
    const pkhDid = getDid();
    const profileId = input.profileId ?? profile.id;
    const content = {
      profileId,
      bioShort: input.bioShort ?? therapist?.bioShort ?? "",
      degrees: input.degrees,
      licenseNumber: input.licenseNumber,
      licenseJurisdiction: input.licenseJurisdiction,
      licenseCountry: input.licenseCountry,
      yearsExperience: input.yearsExperience,
      approaches: input.approaches,
      specialties: input.specialties,
      populations: input.populations,
      bioLong: input.bioLong,
      introVideoUrl: input.introVideoUrl,
      acceptingNewClients: input.acceptingNewClients,
      roomId: input.roomId,
    };
    const saved = await saveTherapistProfile(
      ceramic,
      session.did,
      profileId,
      content,
      pkhDid ?? undefined
    );
    setTherapist(saved);
    return saved.id;
  };

  const upsertConsultantProfile = async (
    input: Partial<ConsultantProfile> & { profileId?: string }
  ): Promise<string | null> => {
    if (!ceramic) throw new Error("Ceramic SDK not initialized");
    if (!profile?.id) throw new Error("Debes crear primero el perfil base.");
    await authenticateForWrite(consultant?.id);
    const session = sessionRef.current;
    if (!session?.did) throw new Error("Debes autenticarte primero (Authenticate Ceramic)");
    const pkhDid = getDid();
    const profileId = input.profileId ?? profile.id;
    const content = {
      profileId,
      presentingProblemShort:
        input.presentingProblemShort ?? consultant?.presentingProblemShort ?? "",
      goals: input.goals,
      therapistGenderPreference: input.therapistGenderPreference,
      emergencyContactName: input.emergencyContactName,
      emergencyContactPhoneE164: input.emergencyContactPhoneE164,
      consentTerms: input.consentTerms,
      consentPrivacy: input.consentPrivacy,
      consentTelehealthRisks: input.consentTelehealthRisks,
      consentedAt: input.consentedAt,
      priorTherapy: input.priorTherapy,
      priorPsychiatry: input.priorPsychiatry,
      medicationsUsed: input.medicationsUsed,
      medicationsNote: input.medicationsNote,
      diagnoses: input.diagnoses,
    };
    const saved = await saveConsultantProfile(
      ceramic,
      session.did,
      profileId,
      content,
      pkhDid ?? undefined
    );
    setConsultant(saved);
    return saved.id;
  };

  const contextValue: CeramicContextType = {
    isConnected,
    isLoading,
    error,
    hasPersistedSession,
    ceramic,
    composeClient: ceramic,
    profile,
    therapist,
    consultant,
    activeWallet,
    account,
    adminWallet,
    adminAccount,
    connect,
    disconnect,
    refreshProfile,
    executeQuery,
    authenticateForWrite,
    upsertProfile,
    upsertTherapistProfile,
    upsertConsultantProfile,
  };

  return (
    <CeramicContext.Provider value={contextValue}>
      {children}
    </CeramicContext.Provider>
  );
};
