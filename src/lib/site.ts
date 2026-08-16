/**
 * URL pública del sitio. En Vercel viene dada; en local no importa, pero
 * sitemap, canonical y Open Graph necesitan una absoluta.
 */
/**
 * Se descubre sola en Vercel:
 *
 *  · `VERCEL_PROJECT_PRODUCTION_URL` es el dominio de producción, y sigue
 *    siendo correcto aunque se renombre el proyecto o se añada un dominio
 *    propio, así que no hay ninguna URL escrita a mano que se quede vieja.
 *  · `VERCEL_URL` es la del despliegue concreto, útil en vistas previas.
 *  · `NEXT_PUBLIC_SITE_URL` manda sobre todo lo demás si se define.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_ENV === "production" &&
  process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000")
).replace(/\/$/, "");
