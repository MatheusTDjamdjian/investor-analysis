import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Fixa a raiz do workspace no diretório do projeto.
  // Sem isso o Next 16 pode escanear o diretório pai inteiro quando
  // encontra lockfiles em níveis acima, inflando o tempo de compilação.
  turbopack: {
    root: path.resolve(__dirname),
  },

  experimental: {
    // Cache de filesystem do Turbopack: persiste artefatos da compilação
    // entre execuções do `next dev`. Após o primeiro boot, restarts ficam
    // virtualmente instantâneos.
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
