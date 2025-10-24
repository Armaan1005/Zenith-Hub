import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Add this configuration to allow requests from the dev environment
  experimental: {
    allowedDevOrigins: [
        "https://6000-firebase-studio-1758983685697.cluster-ulqnojp5endvgve6krhe7klaws.cloudworkstations.dev",
        "http://6000-firebase-studio-1758983685697.cluster-ulqnojp5endvgve6krhe7klaws.cloudworkstations.dev"
    ],
  },
};

export default nextConfig;
