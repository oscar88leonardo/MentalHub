// Zonas horarias IANA más comunes para América Latina y España
export const timezones = [
  { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires (GMT-3)" },
  { value: "America/Bogota", label: "Bogotá (GMT-5)" },
  { value: "America/Caracas", label: "Caracas (GMT-4)" },
  { value: "America/Chile/Santiago", label: "Santiago (GMT-3)" },
  { value: "America/Costa_Rica", label: "Costa Rica (GMT-6)" },
  { value: "America/Guatemala", label: "Guatemala (GMT-6)" },
  { value: "America/Havana", label: "La Habana (GMT-5)" },
  { value: "America/Lima", label: "Lima (GMT-5)" },
  { value: "America/Mexico_City", label: "Ciudad de México (GMT-6)" },
  { value: "America/Montevideo", label: "Montevideo (GMT-3)" },
  { value: "America/Panama", label: "Panamá (GMT-5)" },
  { value: "America/Asuncion", label: "Asunción (GMT-4)" },
  { value: "America/La_Paz", label: "La Paz (GMT-4)" },
  { value: "America/Santo_Domingo", label: "Santo Domingo (GMT-4)" },
  { value: "America/Sao_Paulo", label: "São Paulo (GMT-3)" },
  { value: "America/New_York", label: "Nueva York (GMT-5/-4)" },
  { value: "America/Chicago", label: "Chicago (GMT-6/-5)" },
  { value: "America/Denver", label: "Denver (GMT-7/-6)" },
  { value: "America/Los_Angeles", label: "Los Ángeles (GMT-8/-7)" },
  { value: "Europe/Madrid", label: "Madrid (GMT+1/+2)" },
  { value: "Europe/Lisbon", label: "Lisboa (GMT+0/+1)" },
  { value: "UTC", label: "UTC (GMT+0)" },
];

// Función para obtener la etiqueta de una zona horaria
export const getTimezoneLabel = (value: string): string => {
  return timezones.find(tz => tz.value === value)?.label || value;
};

