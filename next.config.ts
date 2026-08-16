import type { NextConfig } from "next";

import { DEFAULT_LOCALE } from "./src/lib/i18n";

const nextConfig: NextConfig = {
  // Hay un package-lock.json suelto en el perfil del usuario; sin esto
  // Turbopack lo detecta y avisa en cada build.
  turbopack: { root: import.meta.dirname },

  // Todo el sitio se genera en build: no hay datos en tiempo de petición.
  // Para migrar a GitHub Pages basta con activar `output: "export"` y
  // sustituir el redirect de abajo por un index.html estático.
  async redirects() {
    return [
      { source: "/", destination: `/${DEFAULT_LOCALE}`, permanent: false },
      { source: "/cv", destination: `/${DEFAULT_LOCALE}`, permanent: false },
    ];
  },
};

export default nextConfig;
