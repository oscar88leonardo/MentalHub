"use client"
import Image from "next/image";

export default function HeroVisualCSS() {
  return (
    <div
      className="relative w-full max-w-[640px] aspect-[16/9] rounded-xl overflow-hidden"
      aria-label="Illustration: hand holding a floating brain"
    >
      {/* Fondo suave para reemplazar la tarjeta verde */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0b1220] to-[#0f1c2e]" />

      {/* Mano (capa base) */}
      <Image
        src="/assets/images/hand-bg.png"
        alt="Hand"
        fill
        priority
        className="object-contain p-4"
      />

      {/* Cerebro flotando (animado con CSS) - Más grande y visible */}
      <img
        src="/assets/images/brain.png"
        alt="Floating brain"
        width={220}
        height={170}
        className="absolute left-[35%] top-[15%] drop-shadow-[0_8px_20px_rgba(139,69,255,0.6)]"
        style={{
          animation: 'brainFloat 4s ease-in-out infinite',
          zIndex: 10
        }}
      />

      <style jsx>{`
        @keyframes brainFloat {
          0%, 100% {
            transform: translateY(0px) rotate(0deg) scale(1);
            filter: brightness(1) saturate(1);
          }
          25% {
            transform: translateY(-8px) rotate(-2deg) scale(1.02);
            filter: brightness(1.1) saturate(1.1);
          }
          50% {
            transform: translateY(-12px) rotate(0deg) scale(1.05);
            filter: brightness(1.15) saturate(1.2);
          }
          75% {
            transform: translateY(-8px) rotate(2deg) scale(1.02);
            filter: brightness(1.1) saturate(1.1);
          }
        }
        
        /* Añadir un resplandor suave al cerebro */
        img[alt="Floating brain"] {
          filter: drop-shadow(0 0 15px rgba(139, 69, 255, 0.3));
        }
      `}</style>
    </div>
  );
}
