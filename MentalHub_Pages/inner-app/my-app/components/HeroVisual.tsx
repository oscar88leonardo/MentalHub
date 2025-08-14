"use client"
import Image from "next/image";
import dynamic from "next/dynamic";
// Cargar motion.img vía wrapper client-only para evitar issues de exports
const MotionImg = dynamic(() => import("./MotionImg"), { ssr: false });

export default function HeroVisual() {
  return (
    <div
      className="relative w-full max-w-[920px] h-[400px] sm:h-[500px] md:h-[620px] lg:h-[680px] overflow-visible -mt-6 md:-mt-10 hero-visual-container"
      aria-label="Illustration: hand holding a floating brain"
    >
      {/* Se elimina el rectángulo de fondo para dejar solo la ilustración */}

      {/* Mano (capa base) */}
      <Image
        src="/assets/hero/hand-bg.png"
        alt="Hand"
        fill
        priority
        className="object-contain"
      />

		{/* Cerebro + glow wrapper para alineación exacta */}
		<div
			className="absolute 
        left-[30%] sm:left-[30%] md:left-[23%] lg:left-[30%] 
        top-[-5%] sm:top-[-5%] md:top-[-4%] lg:top-[-5%] 
        -translate-x-1/2 pointer-events-none
        w-[238px] sm:w-[265px] md:w-[250px] lg:w-[396px]"
		>
			{/* Glow sutil centrado detrás del cerebro */}
			<div
				className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[115%] aspect-square rounded-full"
				style={{
					background:
						'radial-gradient(closest-side, rgba(124, 58, 237, 0.22), rgba(124,58,237,0.0) 70%)',
					filter: 'blur(8px)'
				}}
			/>

			<MotionImg
				src="/assets/hero/brain.png"
				alt="Floating brain"
				width={374}
				height={284}
				decoding="async"
				className="relative block w-full h-auto drop-shadow-[0_10px_22px_rgba(102,102,255,0.35)] pointer-events-none"
				style={{ willChange: 'transform' }}
				animate={{
					y: [0, -10, 0],
					rotate: [0, -1.8, 0.2],
					scale: [1, 1.03, 1],
					filter: ['brightness(1)', 'brightness(1.08)', 'brightness(1)']
				}}
				transition={{ duration: 6.5, repeat: Infinity, ease: [0.4, 0.0, 0.2, 1] }}
			/>
		</div>
    </div>
  );
}
