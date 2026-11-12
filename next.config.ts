import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components desligado: o app é quase todo autenticado e dinâmico
  // (sessão Supabase em cookies). Ver docs/DECISOES.md.
  cacheComponents: false,
  // Miniaturas das playlists do YouTube (telas.md › 30).
  images: { remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }] },
  turbopack: {
    rules: {
      // CSS Modules (cenas e revelações) ficam fora: passar por este loader apagava as
      // classes deles e desligava todas as animações das cenas.
      "*.css": {
        condition: { not: { path: /\.module\.css$/ } },
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
