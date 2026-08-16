import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // La versión imprimible es el mismo contenido en otro formato: que no
      // compita con el currículum real en los resultados de búsqueda.
      disallow: ["/es/cv-print", "/en/cv-print"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
