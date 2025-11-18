// Idiomas principales con códigos ISO 639-1
export const languages = [
  { code: "es", name: "Español" },
  { code: "en", name: "English" },
  { code: "pt", name: "Português" },
  /*{ code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "it", name: "Italiano" },
  { code: "ca", name: "Català" },
  { code: "eu", name: "Euskera" },
  { code: "gl", name: "Galego" },
  { code: "zh", name: "中文" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
  { code: "ar", name: "العربية" },
  { code: "ru", name: "Русский" },*/
];

export const getLanguageName = (code: string): string => {
  return languages.find(l => l.code === code)?.name || code;
};

