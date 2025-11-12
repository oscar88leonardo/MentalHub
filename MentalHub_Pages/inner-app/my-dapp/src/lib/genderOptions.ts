// Opciones de género para el perfil base
// Nota: El esquema permite String, por lo que estas son sugerencias comunes
// Se pueden agregar más opciones en el futuro sin problemas de compatibilidad
export const genderOptions = [
  { value: "Masculino", label: "Masculino" },
  { value: "Femenino", label: "Femenino" },
  { value: "No binario", label: "No binario" },
  { value: "Otro", label: "Otro" },
  { value: "Prefiero no decir", label: "Prefiero no decir" },
];

export const getGenderLabel = (value: string): string => {
  return genderOptions.find(go => go.value === value)?.label || value;
};

