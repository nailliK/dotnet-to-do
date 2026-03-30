import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  rewrites: async () => ({
    beforeFiles: [],
    afterFiles: [
      {
        source: '/api/todos/:path*',
        destination: `${process.env.API_URL}/api/todos/:path*`,
      },
    ],
    fallback: [],
  }),
};

export default nextConfig;
