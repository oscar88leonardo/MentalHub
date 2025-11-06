import path from 'path';
import { fileURLToPath } from 'url';

// __dirname no existe en ESM: derivarlo desde import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ipfs.io' },
      { protocol: 'https', hostname: 'gateway.pinata.cloud' },
      { protocol: 'https', hostname: 'cloudflare-ipfs.com' },
      // dominio personalizado usado en logs
      { protocol: 'https', hostname: 'chocolate-sour-kite-810.mypinata.cloud' },
      { protocol: 'https', hostname: 'ivory-magnetic-guineafowl-976.mypinata.cloud' },
    ],
  },
  // Estabiliza el tracing en monorepo y suprime warning de múltiples lockfiles
  outputFileTracingRoot: path.join(__dirname, '../../..'),
  webpack: (config) => {
    // Evitar que webpack intente resolver dependencias opcionales de pino en cliente
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'pino-pretty': false,
      'supports-color': false,
    };
    return config;
  },
};

export default nextConfig;
