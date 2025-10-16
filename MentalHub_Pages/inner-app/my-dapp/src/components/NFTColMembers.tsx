"use client"
import React, { useEffect, useRef, useState, useContext } from "react";
import Image from "next/image";
import { getContract, prepareContractCall, toWei, resolveMethod, sendTransaction } from "thirdweb";
import { useActiveWallet, useAdminWallet, useReadContract } from "thirdweb/react";
import { owner } from "thirdweb/extensions/common";
import { client as clientThirdweb } from "@/lib/client";
import { myChain } from "@/lib/chain";
import { abi as whitelistAbi, WHITELIST_CONTRACT_ADDRESS } from "@/constants/whitelist";
import { abi as membersAbi, NFT_CONTRACT_ADDRESS } from "@/constants/MembersAirdrop";

interface NFTColMembersProps {
  embedded?: boolean;
}

const NFTColMembers: React.FC<NFTColMembersProps> = ({ embedded = false }) => {
  const [airdropStarted, setAirdropStarted] = useState(false);
  const [airdropEnded, setAirdropEnded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");

  const activeWallet = useActiveWallet();
  const adminWallet = useAdminWallet();
  const account = activeWallet ? activeWallet.getAccount() : null;
  const adminAccount = adminWallet ? adminWallet.getAccount() : null;

  const contract = getContract({
    client: clientThirdweb!,
    chain: myChain,
    address: NFT_CONTRACT_ADDRESS,
    abi: membersAbi as [],
  });

  const contractWhitelist = getContract({
    client: clientThirdweb!,
    chain: myChain,
    address: WHITELIST_CONTRACT_ADDRESS,
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

  const airdropMint = async (name: string, pathTypeContDig: string, pathContDigi: string, contSessions: number) => {
    try {
      if (dataWhitelist.isLoading) return;
      if (dataWhitelist.data) {
        const tx = prepareContractCall({
          contract,
          method: resolveMethod("airdropMint"),
          params: [2],
          value: toWei("0"),
        });
        if (activeWallet && account) {
          await sendTransaction({ account, transaction: tx });
          window.alert("You successfully minted a community member NFT!");
        }
      } else {
        window.alert("Sorry friend, you're not whitelisted");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const publicMint = async (name: string, pathTypeContDig: string, pathContDigi: string, contSessions: number) => {
    try {
      const tx = prepareContractCall({
        contract,
        method: resolveMethod("mint"),
        params: [2],
        value: dataisSponsoredMint.data ? toWei("0") : toWei("0.01"),
      });
      if (activeWallet && account) {
        await sendTransaction({ account, transaction: tx });
        window.alert("You successfully minted a community member NFT!");
      }
    } catch (err) {
      console.error(err);
      window.alert(String(err));
    }
  };

  const startAirdrop = async (duration: number, isMinutes: boolean) => {
    try {
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
        window.alert("You successfully started the Airdrop!");
      }
    } catch (err) {
      console.error("Error al iniciar airdrop:", err);
    }
  };

  const getOwner = async () => {
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
  };

  const getTokenIdsMinted = async () => {
    try {
      if (datatokenIds.isLoading) return;
      if (datatokenIds.data) {
        const _tokenIds = datatokenIds.data as any;
        setTokenIdsMinted(String(_tokenIds));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (account) {
      getOwner();
    }
  }, [account]);

  useEffect(() => {
    getTokenIdsMinted();
  }, [datatokenIds.data]);

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
        <button className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white/80 cursor-wait">Loading...</button>
      );
    }

    if (isOwner && (!airdropStarted || airdropEnded)) {
      return (
        <button className="btn btn-light font-16 hcenter" onClick={() => startAirdrop(5, true)}>
          Start Airdrop!
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
          >
            Claim 🚀!
          </button>
        </div>
      );
    }

    if (airdropEnded) {
      return (
        <button
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors text-white"
          onClick={() => publicMint(name, pathTypeContDig, pathContDigi, contSessions)}
        >
          Public Mint 🚀!
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
      </div>
    </div>
  );
};

export default NFTColMembers;
