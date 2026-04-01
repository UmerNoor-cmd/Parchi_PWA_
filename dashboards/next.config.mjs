/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Allow Next.js App Router to serve /.well-known/* route handlers.
  // Without this, the default cleanUrls/rewrite rules can block these paths.
  async headers() {
    return [
      {
        source: "/.well-known/:path*",
        headers: [
          {
            key: "Content-Type",
            value: "application/json",
          },
        ],
      },
    ]
  },
}

export default nextConfig
