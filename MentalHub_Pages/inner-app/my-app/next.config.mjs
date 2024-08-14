/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
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
  };

export default nextConfig;
