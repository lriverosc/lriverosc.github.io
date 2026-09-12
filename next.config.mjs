/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: {
    unoptimized: true,
  },
  // NOTE: headers() is intentionally removed — headers()/redirects()/rewrites()
  // are not supported with `output: 'export'` (there is no server to run them),
  // and GitHub Pages can't serve custom response headers either. The security
  // headers this used to set (X-Frame-Options, X-Content-Type-Options, etc.)
  // have no static-export/GitHub Pages equivalent and are simply dropped.
};

export default nextConfig;
