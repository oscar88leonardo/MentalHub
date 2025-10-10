"use client"
import React, { useState } from "react";
import EditProfileModal from "./EditProfileModal";

interface EditProfileButtonProps {
  isNewUser?: boolean;
}

const EditProfileButton: React.FC<EditProfileButtonProps> = ({ isNewUser = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="px-6 py-3 rounded-xl text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textShadow: '0 1px 2px rgba(0,0,0,0.1)'
        }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <span>{isNewUser ? 'Completar Perfil' : 'Editar Perfil'}</span>
      </button>

      <EditProfileModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isForced={isNewUser}
      />
    </>
  );
};

export default EditProfileButton;
