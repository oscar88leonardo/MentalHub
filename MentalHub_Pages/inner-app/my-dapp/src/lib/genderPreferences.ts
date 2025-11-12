// Opciones de preferencia de género del terapeuta
// Nota: El esquema permite String, por lo que estas son sugerencias comunes
// Se pueden agregar más opciones en el futuro sin problemas de compatibilidad
export const genderPreferences = [
  { value: "F", label: "Femenino" },
  { value: "M", label: "Masculino" },
  { value: "NB", label: "No binario" },
  { value: "Cualquiera", label: "Sin preferencia" },
  { value: "Prefiero no decir", label: "Prefiero no decir" },
];

export const getGenderPreferenceLabel = (value: string): string => {
  return genderPreferences.find(gp => gp.value === value)?.label || value;
};

