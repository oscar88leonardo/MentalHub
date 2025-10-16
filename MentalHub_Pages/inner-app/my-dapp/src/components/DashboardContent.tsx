"use client"
import React from "react";
import { useCeramic } from "@/context/CeramicContext";
import Header from "./Header";
import DebugWallet from "./DebugWallet";

interface DashboardContentProps {
  onLogout: () => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ onLogout }) => {
  const { account } = useCeramic();

  const stats = [
    {
      title: "Sesiones Completadas",
      value: "12",
      change: "+2 esta semana",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "from-green-400 to-green-600"
    },
    {
      title: "NFTs Disponibles",
      value: "5",
      change: "3 nuevos",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: "from-purple-400 to-purple-600"
    },
    {
      title: "Salas Activas",
      value: "3",
      change: "1 nueva sala",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: "from-blue-400 to-blue-600"
    },
    {
      title: "Horas Totales",
      value: "48h",
      change: "+8h esta semana",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "from-orange-400 to-orange-600"
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: "session",
      title: "Sesión completada con Dr. García",
      time: "Hace 2 horas",
      status: "completed"
    },
    {
      id: 2,
      type: "nft",
      title: "Nuevo NFT recibido",
      time: "Hace 1 día",
      status: "new"
    },
    {
      id: 3,
      type: "room",
      title: "Sala 'Meditación Grupal' creada",
      time: "Hace 3 días",
      status: "created"
    },
    {
      id: 4,
      type: "schedule",
      title: "Nueva sesión programada",
      time: "Hace 5 días",
      status: "scheduled"
    }
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header fijo */}
      <Header 
        title="Dashboard" 
        subtitle="Bienvenido de vuelta a Innerverse" 
        onLogout={onLogout} 
      />

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <DebugWallet />

          {/* Welcome Card */}
          {account && (
            <div 
              className="rounded-2xl p-8 text-white mb-8 shadow-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
            >
              <div className="flex items-center space-x-6">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  {account.address.slice(2, 3).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    ¡Hola de nuevo! 👋
                  </h2>
                  <p className="text-white/90 text-lg mb-3" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                    Tu bienestar mental es nuestra prioridad. Continúa tu viaje hacia una vida más equilibrada.
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-sm font-medium">
                      Conectado como: {account.address.slice(0, 6)}...{account.address.slice(-4)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="rounded-2xl p-6 text-white shadow-xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    {stat.icon}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-white/80">{stat.change}</div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold">{stat.title}</h3>
              </div>
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <div 
              className="rounded-2xl p-6 shadow-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
              }}
            >
              <h3 className="text-xl font-semibold text-white mb-6" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                Actividad Reciente
              </h3>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex items-center space-x-4 p-4 rounded-xl transition-all duration-200 hover:bg-white/10"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(5px)'
                    }}
                  >
                    <div className={`w-3 h-3 rounded-full ${
                      activity.status === 'completed' ? 'bg-green-400' :
                      activity.status === 'new' ? 'bg-blue-400' :
                      activity.status === 'created' ? 'bg-purple-400' :
                      'bg-orange-400'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{activity.title}</p>
                      <p className="text-white/70 text-sm">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div 
              className="rounded-2xl p-6 shadow-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
              }}
            >
              <h3 className="text-xl font-semibold text-white mb-6" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                Acciones Rápidas
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  className="p-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <svg className="w-8 h-8 mx-auto mb-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-white font-medium text-sm">Nueva Sesión</p>
                </button>
                <button 
                  className="p-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <svg className="w-8 h-8 mx-auto mb-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="text-white font-medium text-sm">Crear Sala</p>
                </button>
                <button 
                  className="p-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <svg className="w-8 h-8 mx-auto mb-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="text-white font-medium text-sm">Mi Perfil</p>
                </button>
                <button 
                  className="p-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <svg className="w-8 h-8 mx-auto mb-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="text-white font-medium text-sm">Inner Keys</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;