/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
          source: '/ceramic/:path*',
          destination: 'https://ceramicnode.innerverse.care/:path*',
        },
      ];  
    },  
    async headers() {
      return [
        
        {
         source: "/ceramic/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date" },
        ]
      }
      ];
    },
    eslint: {
      // Warning: This allows production builds to successfully complete even if
      // your project has ESLint errors.
      ignoreDuringBuilds: true,
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
