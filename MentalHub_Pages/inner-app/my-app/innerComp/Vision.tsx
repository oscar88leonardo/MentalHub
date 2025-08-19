/* eslint-disable */
import React from "react";
import HeroVisual from "../components/HeroVisual";

const FeatureComponent = () => {
  return (
    <div id="VisionSection" className="relative overflow-hidden hero-bg">
      {/* Grilla principal con máximo ancho consistente */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16 sm:py-20 md:py-24 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[70vh] sm:min-h-[75vh] md:min-h-[80vh]">
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            {/* Eyebrow pill */}
            <div className="eyebrow-pill">
              Plataforma digital
            </div>
            
            {/* Main heading with gradient emphasis */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-h1 font-bold leading-tight text-white">
              <span className="gradient-text-teal">Salud mental descentralizada</span>
              <br />
              para todos
            </h1>
            
            {/* Lead text */}
            <p className="text-base sm:text-lg md:text-xl lg:text-lead text-muted max-w-lg">
              Innerverse conecta a personas con profesionales de la salud con diferentes especialidades,
              ofreciendo consultas en línea, talleres y recursos de bienestar en una plataforma innovadora y segura.
            </p>
            
            {/* Recuadro informativo como tarjetas */}
            <section className="mt-12" role="group" aria-label="Estadísticas de salud mental">
              <div className="text-center mb-8">
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  ¿Sabías que<span className="gradient-text-teal">…?</span>
                </h3>
                <div className="w-16 h-1 bg-gradient-to-r from-teal-400 to-cyan-400 mx-auto rounded-full"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tarjeta 1 */}
                <article className="modern-card group hover:scale-105 transition-all duration-300 overflow-hidden">
                  <div className="p-6 h-full flex flex-col">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center text-2xl mr-4 shadow-lg">
                        🌍
                      </div>
                      <h4 className="text-white font-semibold text-lg">Impacto Global</h4>
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed flex-grow">
                      Más de <span className="gradient-text-teal font-bold">300 millones</span> de personas en el mundo sufren algún trastorno de ansiedad.
                    </p>
                    <div className="mt-4 text-xs text-white/60 font-medium">— OMS, 2022</div>
                  </div>
                </article>
                
                {/* Tarjeta 2 */}
                <article className="modern-card group hover:scale-105 transition-all duration-300 overflow-hidden">
                  <div className="p-6 h-full flex flex-col">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-2xl mr-4 shadow-lg">
                        📈
                      </div>
                      <h4 className="text-white font-semibold text-lg">Post-Pandemia</h4>
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed flex-grow">
                      Desde la pandemia, los casos aumentaron un <span className="gradient-text-cyan font-bold">25%</span>.
                    </p>
                    <div className="mt-4 text-xs text-white/60 font-medium">— Estudios recientes</div>
                  </div>
                </article>
                
                {/* Tarjeta 3 */}
                <article className="modern-card group hover:scale-105 transition-all duration-300 overflow-hidden">
                  <div className="p-6 h-full flex flex-col">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-2xl mr-4 shadow-lg">
                        🚧
                      </div>
                      <h4 className="text-white font-semibold text-lg">Barreras</h4>
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed flex-grow">
                      <span className="gradient-text-teal font-bold">2 de cada 3</span> personas no buscan tratamiento por estigma y desinformación.
                    </p>
                    <div className="mt-4 text-xs text-white/60 font-medium">— Investigación global</div>
                  </div>
                </article>
              </div>
            </section>
          </div>
          
          <div className="lg:col-span-6">
            <div className="relative flex justify-center lg:justify-end">
              <HeroVisual />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureComponent;
