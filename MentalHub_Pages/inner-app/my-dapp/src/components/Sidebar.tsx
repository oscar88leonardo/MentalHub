"use client"
import React from "react";
import Image from "next/image";
import { InnerverProfile, TherapistProfile, ConsultantProfile } from "@/context/CeramicContext";

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
  profile?: InnerverProfile | null;
  therapist?: TherapistProfile | null;
  consultant?: ConsultantProfile | null;
  isProfileComplete?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeItem, 
  onItemClick, 
  profile, 
  therapist, 
  consultant, 
  isProfileComplete = false 
}) => {
  const userRole = profile?.rol;
  const isTherapist = userRole === 'Terapeuta';
  const isConsultant = userRole === 'Consultante';

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
        </svg>
      )
    },
    {
      id: 'dao',
      label: 'DAO',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c1.657 0 3-1.343 3-3S13.657 2 12 2 9 3.343 9 5s1.343 3 3 3zm0 2c-2.21 0-4 1.79-4 4v6h8v-6c0-2.21-1.79-4-4-4z" />
        </svg>
      )
    },
    {
      id: 'profile',
      label: 'Mi Perfil',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      id: 'schedule',
      label: 'Mis Sesiones',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'rooms',
      label: 'Mis Salas',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      roles: ['Terapeuta'] // Solo visible para terapeutas
    },
    {
      id: 'availability',
      label: 'Disponibilidad',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      roles: ['Terapeuta'] // Solo visible para terapeutas
    },
    {
      id: 'nfts',
      label: 'Inner Keys',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      id: 'workshops',
      label: 'Workshops',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17l4 4 4-4m-4-5v9m4-13h1a4 4 0 014 4v6a4 4 0 01-4 4H7a4 4 0 01-4-4v-6a4 4 0 014-4h1" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4a4 4 0 110 8 4 4 0 010-8z" />
        </svg>
      )
    },
    {
      id: 'whitelist',
      label: 'Whitelist',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ];

  return (
    <div 
      className="w-64 h-screen border-r flex flex-col"
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Logo */}
      <div className="p-6 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
        <div className="flex items-center space-x-3">
          <Image
            src="/innerverse-logo.png"
            alt="Innerverse Logo"
            width={40}
            height={40}
            className="rounded-lg"
            style={{ objectFit: 'contain' }}
          />
          <div>
            <h1 
              className="text-xl font-bold text-white"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
            >
              Innerverse
            </h1>
            <p 
              className="text-sm text-white/80"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
            >
              Dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Navigation - Scrolleable */}
      <nav className="flex-1 mt-6 px-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems
            .filter((item) => {
              // Filtrar por rol: si el item tiene roles definidos, solo mostrarlo para esos roles
              if (item.roles && userRole) {
                return item.roles.includes(userRole);
              }
              // Si no tiene roles definidos, mostrarlo siempre
              return true;
            })
            .map((item) => {
              const isDisabled = !isProfileComplete && item.id !== 'profile';
              const isActive = activeItem === item.id;
              
              return (
            <li key={item.id}>
              <button
                    onClick={() => !isDisabled && onItemClick(item.id)}
                    disabled={isDisabled}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      isActive
                    ? 'text-white shadow-lg'
                        : isDisabled
                        ? 'text-white/40 cursor-not-allowed'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                style={{
                      background: isActive 
                    ? 'rgba(255, 255, 255, 0.2)' 
                    : 'transparent',
                      backdropFilter: isActive ? 'blur(10px)' : 'none',
                      border: isActive 
                    ? '1px solid rgba(255, 255, 255, 0.3)' 
                    : 'none',
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      opacity: isDisabled ? 0.5 : 1
                }}
                    title={isDisabled ? 'Completa tu perfil para acceder a esta opción' : undefined}
              >
                    <span className={`${isActive ? 'text-white' : isDisabled ? 'text-white/40' : 'text-white/70'}`}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
                    {isDisabled && (
                      <span className="ml-auto text-xs text-white/40">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </span>
                    )}
              </button>
            </li>
              );
            })}
        </ul>
      </nav>

      {/* User Info - Fijo en la parte inferior */}
      <div className="p-4 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
        <div 
          className="flex items-center space-x-3 p-3 rounded-xl"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <span className="text-white text-sm font-bold">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <p 
              className="text-sm font-medium text-white truncate"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
            >
              Usuario
            </p>
            <p 
              className="text-xs text-white/70 truncate"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
            >
              usuario@innerverse.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;