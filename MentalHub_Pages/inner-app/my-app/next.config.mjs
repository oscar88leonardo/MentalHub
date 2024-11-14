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
    swcMinify: true,
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
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify'),
      };
      return config;
    },
  };

export default nextConfig;
