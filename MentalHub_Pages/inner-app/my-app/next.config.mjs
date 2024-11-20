/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'Cross-Origin-Opener-Policy',
              value: 'same-origin-allow-popups',
            },
            {
              key: 'Cross-Origin-Embedder-Policy',
              value: 'unsafe-none',
            }
          ],
        },
      ];
    },
    reactStrictMode: false,
    swcMinify: false,
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'lh3.googleusercontent.com',
          port: '',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'aqua-uneven-canid-277.mypinata.cloud',
          port: '',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'chocolate-sour-kite-810.mypinata.cloud',
          port: '',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'drive.usercontent.google.com',
          port: '',
          pathname: '/**',
        },
      ],
    },
    webpack: (config) => {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: 'crypto-browserify',
        stream: 'stream-browserify',
        http: 'stream-http',
        https: 'https-browserify',
        os: 'os-browserify',
      };
      return config;
    },
  };

export default nextConfig;
