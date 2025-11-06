"use client"
import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { getContract, prepareContractCall, toWei, resolveMethod, sendTransaction, readContract } from "thirdweb";
import { useActiveWallet, useAdminWallet, useReadContract } from "thirdweb/react";
import { owner } from "thirdweb/extensions/common";
import { client as clientThirdweb } from "@/lib/client";
import { myChain } from "@/config/chain";
import { contracts } from "@/config/contracts";
import { abi as whitelistAbi } from "@/abicontracts/whitelist";
import { abi as membersAbi } from "@/abicontracts/MembersAirdrop";

interface NFTColMembersProps {
  embedded?: boolean;
}

const NFTColMembers: React.FC<NFTColMembersProps> = ({ embedded = false }) => {
  const [airdropStarted, setAirdropStarted] = useState(false);
  const [airdropEnded, setAirdropEnded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
  const [toast, setToast] = useState<{ text: string; type: 'error' | 'success' | 'info' } | null>(null);

  const activeWallet = useActiveWallet();
  const adminWallet = useAdminWallet();
  const account = activeWallet ? activeWallet.getAccount() : null;
  const adminAccount = adminWallet ? adminWallet.getAccount() : null;

  const contract = getContract({
    client: clientThirdweb!,
    chain: myChain,
    address: contracts.membersAirdrop,
    abi: membersAbi as [],
  });

  const contractWhitelist = getContract({
    client: clientThirdweb!,
    chain: myChain,
    address: contracts.whitelist!,
    abi: whitelistAbi as [],
  });

  const dataWhitelist = useReadContract({
    contract: contractWhitelist,
    method: "whitelistedAddresses",
    params: [account?.address || ""],
  });

  const dataAirdropStarted = useReadContract({
    contract,
    method: "airdropStarted",
    params: [],
  });

  const dataAirdropEnded = useReadContract({
    contract,
    method: "airdropEnded",
    params: [],
  });

  const datatokenIds = useReadContract({
    contract,
    method: "getTokenIds",
    params: [],
  });

  const dataisSponsoredMint = useReadContract({
    contract,
    method: "isSponsoredMint",
    params: [],
  });

  const showToast = (text: string, type: 'error' | 'success' | 'info' = 'info') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const airdropMint = async (_name: string, _pathTypeContDig: string, _pathContDigi: string, _contSessions: number) => {
    try {
      setLoading(true);
    if (dataWhitelist.data) {
      const tx = prepareContractCall({
          contract,
          method: resolveMethod("airdropMint"),
          params: [2],
          value: toWei("0"),
        });
        if (activeWallet && account) {
          await sendTransaction({ account, transaction: tx });
          showToast('¡Mint realizado con éxito!', 'success');
        }
      } else {
        showToast('No estás en la whitelist', 'error');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const publicMint = async (_name: string, _pathTypeContDig: string, _pathContDigi: string, _contSessions: number) => {
    try {
      setLoading(true);
      let value: bigint = BigInt(0);
      try {
        if (!dataisSponsoredMint.data) {
          const price = await readContract({
            contract,
            method: "function _price() view returns (uint256)",
            params: [],
          });
          value = BigInt(price as any);
        }
      } catch (e) {
        console.warn("No se pudo leer el precio on-chain, usando 0.", e);
        value = BigInt(0);
      }

      const tx = prepareContractCall({
        contract,
        method: resolveMethod("mint"),
        params: [2],
        value,
      });
      if (activeWallet && account) {
        await sendTransaction({ account, transaction: tx });
        showToast('¡Mint realizado con éxito!', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast(String(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  const startAirdrop = async (duration: number, isMinutes: boolean) => {
    try {
      setLoading(true);
      const timeUnit = isMinutes ? 0 : 1;
      const tx = prepareContractCall({
        contract,
        method: resolveMethod("StartAirdrop"),
        params: [duration, timeUnit],
      });
      if (adminWallet && adminAccount) {
        await sendTransaction({ account: adminAccount, transaction: tx });
        setAirdropStarted(true);
        setAirdropEnded(false);
        showToast('¡Airdrop iniciado!', 'success');
      }
    } catch (err) {
      console.error("Error al iniciar airdrop:", err);
    } finally {
      setLoading(false);
    }
  };

  const getOwner = useCallback(async () => {
    try {
      const _owner = await owner({ contract });
      if (adminWallet && adminAccount) {
        const adminAddress = adminAccount.address || "";
        if (adminAddress.toLowerCase() === _owner.toLowerCase()) {
          setIsOwner(true);
        }
      }
    } catch (err: any) {
      console.error(err.message);
    }
  }, [adminWallet, adminAccount, contract]);

  useEffect(() => {
    if (account) {
      getOwner();
    }
  }, [account, getOwner]);

  const getTokenIdsMinted = useCallback(async () => {
    try {
      if (datatokenIds.isLoading) return;
      if (datatokenIds.data) {
        const _tokenIds = datatokenIds.data as any;
        setTokenIdsMinted(String(_tokenIds));
      }
    } catch (err) {
      console.error(err);
    }
  }, [datatokenIds.isLoading, datatokenIds.data]);

  useEffect(() => {
    getTokenIdsMinted();
  }, [getTokenIdsMinted]);

  useEffect(() => {
    const checkAirdropStatus = async () => {
      if (dataAirdropStarted.data) {
        if (dataAirdropEnded.data) {
          const endTimestamp = Number(dataAirdropEnded.data);
          const currentTimestamp = Math.floor(Date.now() / 1000);
          setAirdropEnded(currentTimestamp >= endTimestamp);
        }
      }
      setAirdropStarted(!!dataAirdropStarted.data);
    };
    checkAirdropStatus();
  }, [dataAirdropStarted.data, dataAirdropEnded.data]);

  const NFTGeneralData = {
    title: "Innerverse Members",
    AuthorImg: "/NFT_Authors/innerverseAuthor.jpg",
    AuthorUrl: "https://www.instagram.com/innerverse.care/",
    AuthorId: "@innerverse.care",
  };

  const NFTItemsInfo = [
    {
      animation:
        "https://ivory-magnetic-guineafowl-976.mypinata.cloud/ipfs/bafybeickplfsmn7gz7fqursh3mdlaicxivnmlbpe5owjaut5lmzvzeajii",
      id: "Members",
      usecase:
        "One \npsychology assessment consultation,\none ebook and 3 premium psycho-toolkits, lifetime access to MentalHUb repository",
      name: "Member",
      pathTypeContDig: "url",
      pathContDigi: "Members",
      contSessions: 1,
    },
  ];

  const renderButton = (name: string, pathTypeContDig: string, pathContDigi: string, contSessions: number) => {
    if (!account) return null;
    if (loading) {
      return (
        <button className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white/80 cursor-wait inline-flex items-center gap-2" disabled aria-busy>
          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
          Procesando...
        </button>
      );
    }

    if (isOwner && (!airdropStarted || airdropEnded)) {
      return (
        <button
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors text-white border border-white/30"
          onClick={() => startAirdrop(5, true)}
          disabled={loading}
          aria-busy={loading}
        >
          Start Airdrop 🚀
        </button>
      );
    }

    if (!airdropStarted && !airdropEnded) {
      return (
        <div>
          <h6 className="text-center">Airdrop coming S o O n!</h6>
        </div>
      );
    }

    if (airdropStarted && !airdropEnded) {
      return (
        <div className="text-center space-y-2">
          <h6 className="text-center">Airdrop has started for whitelisted addresses!</h6>
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors text-white"
            onClick={() => airdropMint(name, pathTypeContDig, pathContDigi, contSessions)}
            disabled={loading}
            aria-busy={loading}
          >
            <span className="inline-flex items-center gap-2">
              {loading && (<span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>)}
              Claim 🚀!
            </span>
          </button>
        </div>
      );
    }

    if (airdropEnded) {
      return (
        <button
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors text-white"
          onClick={() => publicMint(name, pathTypeContDig, pathContDigi, contSessions)}
          disabled={loading}
          aria-busy={loading}
        >
          <span className="inline-flex items-center gap-2">
            {loading && (<span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>)}
            Public Mint 🚀!
          </span>
        </button>
      );
    }

    return <div>Loading state ...</div>;
  };

  const renderNFT = () => {
    return NFTItemsInfo.map((NFTitem, index) => (
      embedded ? (
        <div key={index} className="w-full lg:col-span-3">
          <div className="w-full mx-auto">
            <div className="relative w-full h-0 pb-[56.25%] overflow-hidden rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-shadow duration-200">
              <video controls className="absolute inset-0 w-full h-full object-cover">
                <source src={NFTitem.animation} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-center text-white mb-2">{NFTitem.id}</h3>
              <p className="text-white/80 whitespace-pre-line text-center mb-4">{NFTitem.usecase}</p>
              <div className="flex justify-center">
                {renderButton(NFTitem.name, NFTitem.pathTypeContDig, NFTitem.pathContDigi, NFTitem.contSessions)}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div key={index} className="rounded-2xl overflow-hidden shadow-xl bg-white/10 border border-white/20">
          <div className="relative w-full h-0 pb-[56.25%] overflow-hidden rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-shadow duration-200">
            <video controls className="absolute inset-0 w-full h-full object-cover">
              <source src={NFTitem.animation} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="p-6">
            <h3 className="font-bold text-center text-white mb-2">{NFTitem.id}</h3>
            <p className="text-white/80 whitespace-pre-line text-center mb-4">{NFTitem.usecase}</p>
            <div className="flex justify-center">
              {renderButton(NFTitem.name, NFTitem.pathTypeContDig, NFTitem.pathContDigi, NFTitem.contSessions)}
            </div>
          </div>
        </div>
      )
    ));
  };

  if (embedded) {
    return (
      <div className="text-white w-full p-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">{NFTGeneralData.title}</h2>
          <h3 className="text-white/80">A digital collection by <a className="underline" href={NFTGeneralData.AuthorUrl}>{NFTGeneralData.AuthorId}</a></h3>
        </div>
        <div className="flex items-center justify-center space-x-4 mb-6">
          <span className="inline-block rounded-full overflow-hidden border border-white/40">
            <Image src={NFTGeneralData.AuthorImg} alt="author" width={120} height={120} />
          </span>
          <p className="text-white/80 max-w-xl">
            This NFT identify you as a community member, more surprises are coming along the way, stay tuned!
          </p>
        </div>
        <div className="text-center mb-6">
          <h3 className="text-lg">{tokenIdsMinted} Tokens minted</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {renderNFT()}
        </div>
        {toast && (
          <div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-lg shadow"
            style={{
              background: toast.type === 'error'
                ? 'rgba(220,38,38,0.95)'
                : (toast.type === 'success' ? 'rgba(16,185,129,0.95)' : 'rgba(55,65,81,0.95)'),
              color: '#fff'
            }}
          >
            {toast.text}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="text-white">
      <div className="p-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">{NFTGeneralData.title}</h2>
          <h3 className="text-white/80">A digital collection by <a className="underline" href={NFTGeneralData.AuthorUrl}>{NFTGeneralData.AuthorId}</a></h3>
        </div>
        <div className="flex items-center justify-center space-x-4 mb-6">
          <span className="inline-block rounded-full overflow-hidden border border-white/40">
            <Image src={NFTGeneralData.AuthorImg} alt="author" width={120} height={120} />
          </span>
          <p className="text-white/80 max-w-xl">
            This NFT identify you as a community member, more surprises are coming along the way, stay tuned!
          </p>
        </div>
        <div className="text-center mb-6">
          <h3 className="text-lg">{tokenIdsMinted} Tokens minted</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderNFT()}
        </div>
        {toast && (
          <div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-lg shadow"
            style={{
              background: toast.type === 'error'
                ? 'rgba(220,38,38,0.95)'
                : (toast.type === 'success' ? 'rgba(16,185,129,0.95)' : 'rgba(55,65,81,0.95)'),
              color: '#fff'
            }}
          >
            {toast.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTColMembers;
