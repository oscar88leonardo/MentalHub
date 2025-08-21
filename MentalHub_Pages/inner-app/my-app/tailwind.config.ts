import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./innerComp/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        // Variables CSS existentes (mantener compatibilidad)
        'bg': 'var(--bg)',
        'bg-2': 'var(--bg-2)',
        'surface': 'var(--surface)',
        'text': 'var(--text)',
        'muted': 'var(--muted)',
        'cyan': 'var(--cyan)',
        'teal': 'var(--teal)',
        
        // Nueva paleta Innerverse
        primary: {
          DEFAULT: '#66cccc', // aqua - CTA, acentos, botones primarios
          dark: '#339999',
          light: '#99e6e6',
        },
        secondary: {
          DEFAULT: '#666699', // violeta grisáceo - fondos suaves, tarjetas
          dark: '#4d4d73',
          light: '#9999b3',
        },
        base: {
          dark: '#000033', // navy - headings, navbar, footer
          light: '#ffffff', // blanco - fondos, texto sobre dark
        },
      },
      borderRadius: {
        'xl': 'var(--radius)',
      },
      boxShadow: {
        'glow': 'var(--shadow)',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-primary": "linear-gradient(135deg, var(--primary) 0%, var(--cyan) 100%)",
        "gradient-teal": "linear-gradient(135deg, var(--teal) 0%, var(--cyan) 100%)",
      },
      fontSize: {
        'h1': ['clamp(40px,6vw,66px)', { lineHeight: '1.1', letterSpacing: '-0.5%' }],
        'h2': ['clamp(28px,4vw,44px)', { lineHeight: '1.2' }],
        'lead': ['18px', { lineHeight: '1.65' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
};
export default config;
