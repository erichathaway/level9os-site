/** @type {import('next').NextConfig} */
const nextConfig = {
  // @level9/brand ships TypeScript source — Next.js compiles it inline
  transpilePackages: ["@level9/brand"],
  async redirects() {
    return [
      // Legacy route — kept from earlier config
      {
        source: "/how-we-work",
        destination: "/?surface=paths",
        permanent: true,
      },
      // Phase C: collapsed routed pages now live as dashboard modules
      { source: "/products",     destination: "/?surface=products",     permanent: true },
      { source: "/governance",   destination: "/?surface=governance",   permanent: true },
      { source: "/paths",        destination: "/?surface=paths",        permanent: true },
      { source: "/wrappers",     destination: "/?surface=wrappers",     permanent: true },
      { source: "/about",        destination: "/?surface=about",        permanent: true },
      { source: "/architecture", destination: "/?surface=architecture", permanent: true },
      { source: "/compare",      destination: "/?surface=compare",      permanent: true },
      { source: "/partnerships", destination: "/?surface=about",        permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https:",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
