/* eslint-disable */
import React from "react";
import { Row, Col, Container, Card, CardBody } from "reactstrap";

const FeatureComponent = () => {
  return (
    <div id="DescriptionSection" className="section-py">
      {/* Grilla principal con máximo ancho consistente */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Sección 1: ¿Qué es Innerverse? */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start py-16">
          {/* Columna izquierda: contenido (5 columnas) */}
          <div className="lg:col-span-5">
            <div className="inline-block px-4 py-2 bg-teal/20 border border-teal/40 rounded-full text-teal font-medium text-sm mb-6">
              ¿Qué es Innerverse?
            </div>
            <h2 className="text-h2 font-bold text-white mb-6">
              Es una <span className="text-teal">plataforma digital</span> que te conecta con profesionales de la salud mental.
            </h2>
            <p className="text-white/80 leading-relaxed text-lg">
              Aquí encuentras un entorno confiable, accesible y cercano para cuidar tu salud emocional.
            </p>
          </div>
          
          {/* Columna derecha: tarjetas de servicios (7 columnas) */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <article className="bg-base-light border border-secondary-light/40 rounded-xl p-6 h-full hover:border-teal/50 hover:shadow-lg transition-all duration-300">
                <h3 className="font-semibold text-lg text-base-dark mb-2">Consultas en línea</h3>
                <p className="text-secondary">Solicítalas de forma rápida y sencilla.</p>
              </article>
              <article className="bg-base-light border border-secondary-light/40 rounded-xl p-6 h-full hover:border-teal/50 hover:shadow-lg transition-all duration-300">
                <h3 className="font-semibold text-lg text-base-dark mb-2">Biblioteca digital</h3>
                <p className="text-secondary">Ebooks, guías, audios y prácticas psicoeducativas.</p>
              </article>
              <article className="bg-base-light border border-secondary-light/40 rounded-xl p-6 h-full hover:border-teal/50 hover:shadow-lg transition-all duration-300">
                <h3 className="font-semibold text-lg text-base-dark mb-2">Talleres y webinars</h3>
                <p className="text-secondary">Clases en vivo y encuentros comunitarios.</p>
              </article>
              <article className="bg-base-light border border-secondary-light/40 rounded-xl p-6 h-full hover:border-teal/50 hover:shadow-lg transition-all duration-300">
                <h3 className="font-semibold text-lg text-base-dark mb-2">Membresías digitales</h3>
                <p className="text-secondary">Desbloquean beneficios y contenidos exclusivos.</p>
              </article>
            </div>
          </div>
        </section>
        
        {/* Sección 2: Beneficios */}
        <section id="beneficios" className="py-20">
          <div className="bg-secondary-light/10 rounded-3xl px-8 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Beneficios</h2>
              <p className="text-white/70 text-lg">Un nuevo camino hacia tu bienestar.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8" role="list">
              {[
                { t: "Accesible desde cualquier lugar", d: "Terapia en línea cuando la necesites.", icon: "🌍" },
                { t: "Innovador y cercano", d: "Membresías digitales simples que desbloquean beneficios.", icon: "💡" },
                { t: "Acompañamiento real", d: "Talleres, webinars y grupos de apoyo que te sostienen.", icon: "🤝" },
                { t: "Motivación constante", d: "Suma puntos y desbloquea recompensas al participar.", icon: "⭐" },
                { t: "Confianza garantizada", d: "Perfiles verificados y sistema de reputación.", icon: "🛡️" },
                { t: "Enfoque humano", d: "Psicología basada en evidencia con calidez.", icon: "❤️" },
              ].map((b, i) => (
                <article
                  key={i}
                  role="listitem"
                  className="bg-base-light border border-secondary-light/30 rounded-xl p-8 h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-teal/50"
                >
                  <div className="text-4xl mb-6" aria-hidden="true">{b.icon}</div>
                  <h3 className="font-semibold text-xl text-base-dark mb-3">{b.t}</h3>
                  <p className="text-secondary leading-relaxed">{b.d}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Sección 3: Cómo funciona */}
        <section id="como-funciona" className="py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Cómo funciona</h2>
            <div className="w-20 h-1 bg-teal mx-auto rounded-full"></div>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <ol className="space-y-8" role="list">
              {[
                "Crea tu perfil o conecta tu billetera digital.",
                "Elige tu membresía digital.",
                "Accede a consultas, talleres y recursos exclusivos.",
                "Participa en la comunidad y desbloquea beneficios adicionales.",
              ].map((texto, idx) => (
                <li key={idx} role="listitem" className="bg-base-light border border-secondary-light/30 rounded-xl p-8 flex items-start gap-6 hover:border-teal/50 hover:shadow-lg transition-all duration-300">
                  <div
                    aria-hidden="true"
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-teal to-cyan text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-lg"
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 pt-3">
                    <span className="sr-only">Paso {idx + 1}: </span>
                    <p className="text-lg text-base-dark font-medium leading-relaxed m-0">
                      {texto}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FeatureComponent;