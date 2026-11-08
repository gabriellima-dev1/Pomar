import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components desligado: o app é quase todo autenticado e dinâmico
  // (sessão Supabase em cookies). Ver docs/DECISOES.md.
  cacheComponents: false,
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
