/**
 * URL pública del sitio. En Vercel viene dada; en local no importa, pero
 * sitemap, canonical y Open Graph necesitan una absoluta.
 */
const PRODUCTION_URL = "https://aaron-aranda.vercel.app";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_ENV === "production"
    ? PRODUCTION_URL
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}` // despliegues de vista previa
      : "http://localhost:3000")
).replace(/\/$/, "");
