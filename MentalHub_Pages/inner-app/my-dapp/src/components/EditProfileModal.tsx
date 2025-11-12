"use client"
import React, { useState, useEffect, ChangeEvent } from "react";
import { useCeramic } from "@/context/CeramicContext";
import Image from "next/image";
import { countries } from "@/lib/countries";
import { languages as languageList } from "@/lib/languages";
import { timezones } from "@/lib/timezones";
import { genderOptions } from "@/lib/genderOptions";
import { isBasicProfileComplete } from "@/lib/profileValidation";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  isForced?: boolean;
  onSave?: () => void; // Callback opcional que se llama solo cuando se guarda exitosamente
}

interface IpfsResponse {
  IpfsHash: string;
  [key: string]: any;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, isForced = false, onSave }) => {
  const { profile, executeQuery, refreshProfile, authenticateForWrite } = useCeramic();
  
  // Estados del formulario
  const [name, setName] = useState("");
  const [rol, setRol] = useState("");
  const [pfp, setPfp] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [timezone, setTimezone] = useState("");
  const [languages, setLanguages] = useState("");
  const [primaryLanguage, setPrimaryLanguage] = useState("");
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);
  const [currencyPrices, setCurrencyPrices] = useState<Record<string, { min?: number; max?: number }>>({});
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
      setEmail(profile.email || "");
      setGender(((profile as any).gender as any) || "");
      setBirthDate(profile.birthDate ? profile.birthDate.substring(0, 10) : "");
      setCountry(profile.country || "");
      setCity(profile.city || "");
      setTimezone(profile.timezone || "");
      setLanguages((profile.languages || []).join(", "));
      setPrimaryLanguage(profile.primaryLanguage || "");
      setSelectedCurrencies((profile as any)?.currencies || []);
      const map: Record<string, { min?: number; max?: number }> = {};
      ((profile as any)?.ratesByCurrency || []).forEach((s: string) => {
        const [cur, range] = (s || "").split(":");
        if (!cur) return;
        if (!range) { map[cur] = {}; return; }
        const [minStr, maxStr] = range.split("-");
        const min = minStr ? Number(minStr) : undefined;
        const max = maxStr ? Number(maxStr) : undefined;
        map[cur] = { min, max };
      });
      setCurrencyPrices(map);
    } else if (isOpen && !profile) {
      // Usuario nuevo - campos vacíos
      setName("");
      setRol("");
      setPfp("");
      setEmail("");
      setGender("");
      setBirthDate("");
      setCountry("");
      setCity("");
      setTimezone("");
      setLanguages("");
      setPrimaryLanguage("");
      setSelectedCurrencies([]);
      setCurrencyPrices({});
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

  // Función para crear/actualizar perfil en Ceramic (omite campos vacíos)
  const updateProfileInCeramic = async (username: string, rol: string, pfp: string) => {
    const esc = (value: string) => value.replace(/"/g, '\\"');
    const safeName = esc(username);
    const safePfp = pfp ? esc(pfp) : "";
    const safeEmail = email ? esc(email) : "";

    // Construir contenido dinámicamente, omitiendo campos opcionales vacíos
    const contentParts: string[] = [
      `name: "${safeName}"`,
      `displayName: "${safeName}"`,
      `rol: ${rol}`,
    ];
    if (safePfp) contentParts.push(`pfp: "${safePfp}"`);
    if (safeEmail) contentParts.push(`email: "${safeEmail}"`);
    if (gender) contentParts.push(`gender: "${esc(gender)}"`);
    if (birthDate) contentParts.push(`birthDate: "${new Date(birthDate).toISOString()}"`);
    if (country) contentParts.push(`country: "${esc(country)}"`);
    if (city) contentParts.push(`city: "${esc(city)}"`);
    if (timezone) contentParts.push(`timezone: "${esc(timezone)}"`);
    const langs = languages.split(",").map((x) => x.trim()).filter(Boolean);
    if (langs.length) {
      contentParts.push(`languages: [${langs.map((lang) => `"${esc(lang)}"`).join(", ")}]`);
    }
    if (primaryLanguage) contentParts.push(`primaryLanguage: "${esc(primaryLanguage)}"`);
    if (selectedCurrencies.length) {
      contentParts.push(`currencies: [${selectedCurrencies.map(c => `"${c}"`).join(", ")}]`);
    }
    const ratesByCurrency = selectedCurrencies
      .map(cur => {
        const v = currencyPrices[cur] || {};
        const min = (typeof v.min === "number" && Number.isFinite(v.min)) ? String(v.min) : "";
        const max = (typeof v.max === "number" && Number.isFinite(v.max)) ? String(v.max) : "";
        if (!min && !max) return null;
        return max ? `${cur}:${min}-${max}` : `${cur}:${min}`;
      })
      .filter(Boolean) as string[];
    if (ratesByCurrency.length) {
      contentParts.push(`ratesByCurrency: [${ratesByCurrency.map(s => `"${s.replace(/"/g, '\\"')}"`).join(", ")}]`);
    }
    if (!profile?.id) {
      contentParts.push(`created: "${new Date().toISOString()}"`);
    }
    const contentBlock = contentParts.join("\n            ");

    const mutation = profile?.id
      ? `
      mutation UpdateProfile {
        updateInnerverProfile(input: {
          id: "${profile.id}"
          content: {
            ${contentBlock}
          }
        }) {
          document {
            id
            name
            displayName
            rol
            pfp
            email
          }
        }
      }`
      : `
      mutation CreateProfile {
        createInnerverProfile(input: {
          content: {
            ${contentBlock}
          }
        }) {
          document {
            id
            name
            displayName
            rol
            pfp
            email
          }
        }
      }`;

    console.log("Executing mutation:", mutation);
    const res = await executeQuery(mutation);
    if (res?.errors?.length) {
      console.error("GraphQL errors:", res.errors);
      throw new Error(res.errors.map((e: any) => e.message).join(" | "));
    }
  };

  // Función principal para guardar
  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("El nombre completo es requerido");
      return;
    }
    if (!rol || (rol !== "Terapeuta" && rol !== "Consultante")) {
      setError("Debes seleccionar un rol válido (Terapeuta o Consultante)");
      return;
    }
    // Validación básica de email si fue ingresado
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("El correo electrónico no es válido");
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
      await updateProfileInCeramic(trimmedName, rol, finalPfp);
      
      // Refrescar el perfil
      await refreshProfile();
      
      // Verificar si el perfil está completo después de guardar
      const updatedProfile = await executeQuery(`
        query {
          viewer {
            innerverseProfile {
              id
              name
              rol
            }
          }
        }
      `);
      
      const profileData = updatedProfile?.data?.viewer?.innerverseProfile;
      const profileComplete = isBasicProfileComplete(profileData);
      
      setSuccess(true);
      
      // Solo cerrar si el perfil está completo o si no está forzado
      if (profileComplete || !isForced) {
        // Llamar onSave si existe (solo cuando se guarda exitosamente)
        if (onSave) {
          onSave();
        }
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 1500);
      } else {
        // Si está forzado y no está completo, mostrar mensaje
        setError("Por favor completa todos los campos requeridos (nombre y rol)");
        setSuccess(false);
      }

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
    // Si está forzado, verificar que el perfil esté completo antes de permitir cerrar
    if (isForced) {
      const trimmedName = name.trim();
      const hasValidRol = rol && (rol === "Terapeuta" || rol === "Consultante");
      
      if (!trimmedName || !hasValidRol) {
        setError("Por favor completa todos los campos requeridos antes de continuar");
        return;
      }
    }
    
    setError(null);
    setSuccess(false);
    onClose();
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
        className="w-full max-w-5xl rounded-2xl shadow-2xl max-h-[90vh] flex flex-col"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Header */}
        <div className="p-6 border-b shrink-0" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
          <div className="flex items-center justify-between">
            <h2 
              className="text-2xl font-bold text-white"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
            >
              {profile ? 'Editar Perfil' : 'Completar Perfil'}
            </h2>
            {!isForced && (
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            {isForced && (
              <div className="w-8 h-8 flex items-center justify-center">
                <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            )}
          </div>
          <p 
            className="text-white/80 mt-2"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
          >
            {isForced 
              ? 'Completa tu perfil básico para continuar. Este paso es obligatorio.'
              : profile 
                ? 'Actualiza tu información personal' 
                : 'Completa tu perfil para comenzar'}
          </p>
        </div>

        {/* Content (scrollable) */}
        <div className="p-6 overflow-y-auto flex-1">
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
              
              {/* Datos personales centralizados */}
              <div className="grid grid-cols-1 gap-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                      País (ISO-2)
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-0 text-white"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                      }}
                    >
                      <option value="" className="bg-gray-800 text-white">Selecciona un país</option>
                      {countries.map((c) => (
                        <option key={c.code} value={c.code} className="bg-gray-800 text-white">
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                      Ciudad
                    </label>
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ciudad"
                      className="w-full px-4 py-3 rounded-xl border-0 text-white placeholder-white/60"
                      style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white font-medium mb-2" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                    Zona horaria
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-0 text-white"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}
                  >
                    <option value="" className="bg-gray-800 text-white">Selecciona una zona horaria</option>
                    {timezones.map((tz) => (
                      <option key={tz.value} value={tz.value} className="bg-gray-800 text-white">
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white font-medium mb-2" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                    Idiomas (selecciona múltiples)
                  </label>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {languageList.map((lang) => {
                        const currentLangs = languages.split(",").map(x => x.trim()).filter(Boolean);
                        const isSelected = currentLangs.includes(lang.code);
                        return (
                          <label
                            key={lang.code}
                            className="flex items-center space-x-2 text-white/90 cursor-pointer p-2 rounded-lg hover:bg-white/5"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                const current = languages.split(",").map(x => x.trim()).filter(Boolean);
                                if (e.target.checked) {
                                  setLanguages([...current, lang.code].join(", "));
                                } else {
                                  setLanguages(current.filter(c => c !== lang.code).join(", "));
                                }
                              }}
                              className="w-4 h-4 rounded"
                            />
                            <span className="text-sm">{lang.name}</span>
                          </label>
                        );
                      })}
                    </div>
                    <input
                      type="text"
                      value={languages}
                      onChange={(e) => setLanguages(e.target.value)}
                      placeholder="O ingresa códigos manualmente (ej: es, en)"
                      className="w-full px-4 py-2 rounded-xl border-0 text-white placeholder-white/60 text-sm"
                      style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}
                    />
                    <p className="text-white/60 text-xs">También puedes escribir códigos ISO separados por comas</p>
                  </div>
                </div>
                <div>
                  <label className="block text-white font-medium mb-2" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                    Idioma principal
                  </label>
                  <select
                    value={primaryLanguage}
                    onChange={(e) => setPrimaryLanguage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-0 text-white"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}
                  >
                    <option value="" className="bg-gray-800 text-white">Selecciona un idioma</option>
                    {languageList.map((lang) => (
                      <option key={lang.code} value={lang.code} className="bg-gray-800 text-white">
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Monedas y tarifas */}
              <div>
                <label 
                  className="block text-white font-medium mb-2"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                >
                  Monedas
                </label>
                <div className="grid grid-cols-2 gap-2 text-white">
                  {["ARS","COP","USD","EUR"].map(code => (
                    <label key={code} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedCurrencies.includes(code)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setSelectedCurrencies((prev) => {
                            const next = checked ? Array.from(new Set([...prev, code])) : prev.filter(c => c !== code);
                            // limpiar precios si se desmarca
                            if (!checked) {
                              setCurrencyPrices((mp) => {
                                const { [code]: _, ...rest } = mp;
                                return rest;
                              });
                            }
                            return next;
                          });
                        }}
                      />
                      <span>{code}</span>
                    </label>
                  ))}
                </div>
                {selectedCurrencies.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {selectedCurrencies.map(cur => (
                      <div key={cur} className="flex items-center gap-3">
                        <span className="text-white/90 w-12">{cur}</span>
                        <input
                          type="number"
                          placeholder="Min"
                          value={currencyPrices[cur]?.min ?? ""}
                          onChange={(e) => {
                            const v = e.target.value === "" ? undefined : Number(e.target.value);
                            setCurrencyPrices(prev => ({ ...prev, [cur]: { ...(prev[cur]||{}), min: v } }));
                          }}
                          className="w-28 px-3 py-2 rounded-xl border-0 text-white placeholder-white/60"
                          style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)' }}
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={currencyPrices[cur]?.max ?? ""}
                          onChange={(e) => {
                            const v = e.target.value === "" ? undefined : Number(e.target.value);
                            setCurrencyPrices(prev => ({ ...prev, [cur]: { ...(prev[cur]||{}), max: v } }));
                          }}
                          className="w-28 px-3 py-2 rounded-xl border-0 text-white placeholder-white/60"
                          style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)' }}
                        />
                      </div>
                    ))}
                  </div>
                )}
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

              {/* Correo electrónico */}
              <div>
                <label 
                  className="block text-white font-medium mb-2"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                >
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@correo.com"
                  className="w-full px-4 py-3 rounded-xl border-0 text-white placeholder-white/60"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}
                />
              </div>

              {/* Género */}
              <div>
                <label 
                  className="block text-white font-medium mb-2"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                >
                  Género
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-0 text-white"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}
                >
                  <option value="" className="bg-gray-800 text-white">Sin especificar</option>
                  {genderOptions.map((go) => (
                    <option key={go.value} value={go.value} className="bg-gray-800 text-white">
                      {go.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha de nacimiento */}
              <div>
                <label className="block text-white font-medium mb-2" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                  Fecha de nacimiento
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-0 text-white placeholder-white/60"
                  style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Footer (sticky) */}
        <div className="p-6 border-t shrink-0" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
          {/* Mensajes de estado */}
          {error && (
            <div className="mb-4 p-4 rounded-xl bg-red-500/20 border border-red-500/30">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-200 font-medium">{error}</span>
              </div>
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 rounded-xl bg-green-500/20 border border-green-500/30">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-green-200 font-medium">¡Perfil guardado exitosamente!</span>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleClose}
              disabled={isLoading}
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
