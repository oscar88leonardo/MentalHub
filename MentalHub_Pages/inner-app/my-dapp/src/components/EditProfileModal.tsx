"use client"
import React, { useState, useEffect, ChangeEvent } from "react";
import { useCeramic } from "@/context/CeramicContext";
import Image from "next/image";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  isForced?: boolean;
}

interface IpfsResponse {
  IpfsHash: string;
  [key: string]: any;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, isForced = false }) => {
  const { profile, executeQuery, refreshProfile, authenticateForWrite } = useCeramic();
  
  // Estados del formulario
  const [name, setName] = useState("");
  const [rol, setRol] = useState("");
  const [pfp, setPfp] = useState("");
  const [imageProfile, setImageProfile] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Inicializar campos cuando se abre el modal o cambia el perfil
  useEffect(() => {
    if (isOpen && profile) {
      setName(profile.name || "");
      setRol(profile.rol || "");
      setPfp(profile.pfp || "");
    } else if (isOpen && !profile) {
      // Usuario nuevo - campos vacíos
      setName("");
      setRol("");
      setPfp("");
    }
  }, [isOpen, profile]);

  // Función para subir imagen a IPFS
  const uploadImageToIPFS = async (imageFile: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      
      const response = await fetch("/api/uploadFile", {
        method: "POST",
        body: formData,
      });

      if (response.status === 200) {
        const result = await response.json() as IpfsResponse;
        if ('IpfsHash' in result) {
          return result.IpfsHash;
        } else {
          console.error('Invalid response format - missing IpfsHash');
          return null;
        }
      } else {
        console.error('Upload failed with status:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  // Función para crear/actualizar perfil en Ceramic
  const updateProfileInCeramic = async (username: string, rol: string, pfp: string) => {
    const safeName = username.replace(/"/g, '\\"');
    const safePfp = pfp.replace(/"/g, '\\"');

    const mutation = profile?.id
      ? `
      mutation {
        updateInnerverProfile(input: {
          id: "${profile.id}"
          content: {
            name: "${safeName}"
            displayName: "${safeName}"
            rol: ${rol}
            pfp: "${safePfp}"
          }
        }) {
          document {
            name
            displayName
            rol
            pfp
          }
        }
      }
    `
      : `
      mutation {
        createInnerverProfile(input: {
          content: {
            name: "${safeName}"
            displayName: "${safeName}"
            rol: ${rol}
            pfp: "${safePfp}"
          }
        }) {
          document {
            name
            displayName
            rol
            pfp
          }
        }
      }
    `;

    console.log("Executing mutation:", mutation);
    const res = await executeQuery(mutation);
    if (res?.errors?.length) {
      console.error("GraphQL errors:", res.errors);
      throw new Error(res.errors.map((e: any) => e.message).join(" | "));
    }
  };

  // Función principal para guardar
  const handleSave = async () => {
    if (!name.trim()) {
      setError("El nombre es requerido");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 🔑 STEP 1: Request authentication BEFORE doing anything
      console.log("🔐 Requesting authentication to modify profile...");
      try {
        await authenticateForWrite();
        console.log("✅ Authentication successful, proceeding with update...");
      } catch (authError) {
        console.error("❌ Authentication error:", authError);
        setError("Se requiere autenticación para modificar el perfil. Por favor, firma con tu wallet.");
        setIsLoading(false);
        return;
      }

      let finalPfp = pfp;

      // Si hay una nueva imagen, subirla primero
      if (imageProfile.length > 0) {
        console.log("Uploading new image...");
        const uploadedHash = await uploadImageToIPFS(imageProfile[0]);
        if (uploadedHash) {
          finalPfp = uploadedHash;
          console.log("Image uploaded successfully:", uploadedHash);
        } else {
          setError("Error al subir la imagen");
          setIsLoading(false);
          return;
        }
      }

      // Actualizar perfil en Ceramic
      console.log("Updating profile in Ceramic...");
      await updateProfileInCeramic(name, rol, finalPfp);
      
      // Refrescar el perfil
      await refreshProfile();
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);

    } catch (error) {
      console.error("Error saving profile:", error);
      setError("Error al guardar el perfil. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar cambio de archivo
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList && fileList.length > 0) {
      const filesArray = Array.from(fileList);
      setImageProfile(filesArray);
    } else {
      setImageProfile([]);
    }
  };

  // Manejar cierre del modal
  const handleClose = () => {
    if (!isForced || profile !== null) {
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)'
      }}
    >
      <div 
        className="w-full max-w-2xl rounded-2xl shadow-2xl"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
          <div className="flex items-center justify-between">
            <h2 
              className="text-2xl font-bold text-white"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
            >
              {profile ? 'Editar Perfil' : 'Completar Perfil'}
            </h2>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              disabled={isForced && profile === null}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p 
            className="text-white/80 mt-2"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
          >
            {profile ? 'Actualiza tu información personal' : 'Completa tu perfil para comenzar'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna izquierda */}
            <div className="space-y-6">
              {/* Nombre */}
              <div>
                <label 
                  className="block text-white font-medium mb-2"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                >
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ingresa tu nombre completo"
                  className="w-full px-4 py-3 rounded-xl border-0 text-white placeholder-white/60"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}
                />
              </div>

              {/* Rol */}
              <div>
                <label 
                  className="block text-white font-medium mb-2"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                >
                  Rol *
                </label>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-0 text-white"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}
                >
                  <option value="" className="bg-gray-800 text-white">Selecciona tu rol</option>
                  <option value="Terapeuta" className="bg-gray-800 text-white">Terapeuta</option>
                  <option value="Consultante" className="bg-gray-800 text-white">Consultante</option>
                </select>
              </div>
            </div>

            {/* Columna derecha */}
            <div className="space-y-6">
              {/* Imagen de perfil */}
              <div>
                <label 
                  className="block text-white font-medium mb-2"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                >
                  Foto de Perfil
                </label>
                <div className="space-y-4">
                  {/* Preview de imagen actual */}
                  {pfp && (
                    <div className="flex items-center space-x-4">
                      <Image
                        src={pfp.startsWith('http') ? pfp : `/api/ipfs/${pfp}`}
                        alt="pfp preview"
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-full object-cover border border-white/30"
                      />
                      <div>
                        <p className="text-white/80 text-sm">Imagen actual</p>
                        {pfp.startsWith('http') && (
                          <p className="text-white/60 text-xs truncate max-w-32">{pfp}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Input de archivo */}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="profile-image"
                    />
                    <label
                      htmlFor="profile-image"
                      className="block w-full px-4 py-3 rounded-xl border-2 border-dashed border-white/30 text-white text-center cursor-pointer hover:border-white/50 transition-colors"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(5px)'
                      }}
                    >
                      <svg className="w-6 h-6 mx-auto mb-2 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="text-sm">
                        {imageProfile.length > 0 ? 'Imagen seleccionada' : 'Seleccionar imagen'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mensajes de estado */}
          {error && (
            <div className="mt-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-200 font-medium">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="mt-6 p-4 rounded-xl bg-green-500/20 border border-green-500/30">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-green-200 font-medium">¡Perfil guardado exitosamente!</span>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={handleClose}
              disabled={isLoading || (isForced && profile === null)}
              className="px-6 py-3 rounded-xl border border-white/30 text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || !name.trim() || !rol}
              className="px-6 py-3 rounded-xl text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{isLoading ? 'Guardando...' : 'Guardar'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
