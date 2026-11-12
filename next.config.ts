import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components desligado: o app é quase todo autenticado e dinâmico
  // (sessão Supabase em cookies). Ver docs/DECISOES.md.
  cacheComponents: false,
  // Miniaturas das playlists do YouTube (telas.md › 30).
  images: { remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }] },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
