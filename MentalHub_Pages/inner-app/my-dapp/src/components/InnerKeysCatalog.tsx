"use client"
import React from "react";
import NFTColMembers from "@/components/NFTColMembers";
import Header from "@/components/Header";

interface CatalogItem {
  mediaSrc?: string;
  embedUrl?: string;
  title: string;
  authorUrl: string;
  authorId: string;
  href?: string;
  comingSoon?: boolean;
}

const myAppBaseUrl = process.env.NEXT_PUBLIC_MY_APP_BASE_URL || "";

const items: CatalogItem[] = [
  {
    title: "Innerverse Member",
    authorUrl: "https://www.instagram.com/innerverse.care/",
    authorId: "@innerverse.care",
  },
  {
    mediaSrc: "/innerverse-logo.png",
    title: "Más Inner Keys próximamente",
    authorUrl: "https://www.instagram.com/innerverse.care/",
    authorId: "@innerverse.care",
    comingSoon: true
  }
];

interface InnerKeysCatalogProps {
  onLogout: () => void;
}

const InnerKeysCatalog: React.FC<InnerKeysCatalogProps> = ({ onLogout }) => {
  const renderCard = (item: CatalogItem, index: number) => {
    const isVideo = !!item.mediaSrc && item.mediaSrc.endsWith(".mp4");
    return (
      <div key={index} className="rounded-2xl overflow-hidden shadow-xl bg-white/10 border border-white/20">
        {index === 0 ? (
          <div className="relative">
            <div className="w-full">
              <NFTColMembers embedded />
            </div>
          </div>
        ) : (
          <>
            <div className="relative">
              {isVideo ? (
                <video autoPlay muted loop playsInline src={item.mediaSrc} className="w-full h-56 object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.mediaSrc!} alt={item.title} className="w-full h-56 object-cover" />
              )}
              {item.comingSoon && (
                <div className="absolute top-3 right-3 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold">Próximamente</div>
              )}
              {!item.comingSoon && (
                <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">Disponible</div>
              )}
            </div>
            <div className="p-5 text-white">
              <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
              <p className="text-white/80 text-sm mb-4">
                By <a className="underline hover:text-white" href={item.authorUrl} target="_blank" rel="noreferrer">{item.authorId}</a>
              </p>
              <div className="flex justify-end">
                <button className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white/80 cursor-not-allowed">Próximamente</button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header fijo */}
      <Header 
        title="Inner Keys" 
        subtitle="Explora tus llaves de acceso a experiencias y beneficios en Innerverse" 
        onLogout={onLogout} 
      />

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map(renderCard)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InnerKeysCatalog;


