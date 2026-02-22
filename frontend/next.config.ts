import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Use rewrites for local development; in production on Vercel,
  // vercel.json rewrites route /api/* to the Python serverless function.
  ...(process.env.BACKEND_URL
    ? {
        output: "standalone" as const,
        async rewrites() {
          const backendUrl = process.env.BACKEND_URL;
          return [
            {
              source: "/api/:path*",
              destination: `${backendUrl}/api/:path*`,
            },
            {
              source: "/auth/:path*",
              destination: `${backendUrl}/auth/:path*`,
            },
            {
              source: "/health",
              destination: `${backendUrl}/health`,
            },
          ];
        },
      }
    : {}),
};

export default nextConfig;
