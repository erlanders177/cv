import { z } from "zod";

/**
 * Modelo de datos del sitio. `profile.yaml` es la fuente de verdad del
 * currículum y se valida contra estos esquemas al construir: si el YAML
 * tiene un error, el build falla en vez de publicar un CV roto.
 */

const localized = z.object({
  es: z.string(),
  en: z.string(),
});

/** Fecha de CV: "AAAA-MM". `null` en `end` significa "hasta la actualidad". */
const yearMonth = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Usa el formato AAAA-MM, por ejemplo 2024-03");

/**
 * Qué buscas ahora mismo. Cambiar este valor en `profile.yaml` reescribe el
 * aviso de la cabecera y la llamada a la acción: es el "botón" de estado.
 */
export const SEARCH_STATUSES = [
  "encargos",
  "ofertas",
  "colaboraciones",
  "no-disponible",
] as const;

export type SearchStatus = (typeof SEARCH_STATUSES)[number];

export const contactSchema = z.object({
  email: z.email(),
  /** Se muestra solo en el PDF, nunca en la web pública. */
  phone: z.string().optional(),
  location: localized,
  relocation: localized.optional(),
  availability: localized.optional(),
  github: z.string(),
  linkedin: z.url().optional(),
  website: z.url().optional(),
  otherLinks: z
    .array(z.object({ label: z.string(), url: z.url() }))
    .default([]),
});

export const experienceSchema = z.object({
  id: z.string(),
  company: z.string(),
  companyUrl: z.url().optional(),
  role: localized,
  kind: z
    .enum([
      "empleo",
      "freelance",
      "practicas",
      "voluntariado",
      "academico",
      "propio",
    ])
    .default("empleo"),
  mode: z.enum(["remoto", "hibrido", "presencial"]).optional(),
  location: localized.optional(),
  start: yearMonth,
  end: yearMonth.nullable(),
  summary: localized.optional(),
  /** Logros con impacto medible, no listas de responsabilidades. */
  achievements: z.array(localized).default([]),
  /** Tecnologías usadas; conecta este puesto con la sección de skills. */
  stack: z.array(z.string()).default([]),
  /** Slugs de repos que respaldan este puesto. */
  projects: z.array(z.string()).default([]),
});

export const educationSchema = z.object({
  id: z.string(),
  institution: z.string(),
  degree: localized,
  field: localized.optional(),
  location: localized.optional(),
  start: yearMonth,
  end: yearMonth.nullable(),
  notes: localized.optional(),
});

export const certificationSchema = z.object({
  name: z.string(),
  issuer: z.string(),
  date: yearMonth,
  expires: yearMonth.nullable().default(null),
  url: z.url().optional(),
  credentialId: z.string().optional(),
});

export const skillSchema = z.object({
  name: z.string(),
  /**
   * Nombres con los que GitHub puede reportar esta skill (lenguajes y
   * topics). Sirve para cruzar la skill declarada con evidencia real.
   */
  aliases: z.array(z.string()).default([]),
  level: z.enum(["basico", "intermedio", "avanzado", "experto"]).optional(),
  since: z.string().regex(/^\d{4}$/).optional(),
  note: localized.optional(),
});

export const skillCategorySchema = z.object({
  id: z.string(),
  label: localized,
  items: z.array(skillSchema),
});

export const spokenLanguageSchema = z.object({
  name: localized,
  level: localized,
  certificate: z.string().optional(),
});

export const highlightSchema = z.object({
  label: localized,
  value: z.string(),
});

export const profileSchema = z.object({
  name: z.string(),
  headline: localized,
  summary: localized,
  photo: z.string().optional(),
  /**
   * "AAAA-MM". Sin día, a propósito: basta para calcular la edad y evita
   * publicar una fecha de nacimiento completa. Omítelo para no mostrar edad.
   */
  birthDate: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
    .optional(),
  status: z.enum(SEARCH_STATUSES).default("ofertas"),
  contact: contactSchema,
  /** Cifras de cabecera: "3 paquetes publicados", "5 años con Python". */
  highlights: z.array(highlightSchema).default([]),
  experience: z.array(experienceSchema).default([]),
  education: z.array(educationSchema).default([]),
  certifications: z.array(certificationSchema).default([]),
  skills: z.array(skillCategorySchema).default([]),
  spokenLanguages: z.array(spokenLanguageSchema).default([]),
  awards: z
    .array(
      z.object({
        title: localized,
        issuer: z.string(),
        date: yearMonth,
        url: z.url().optional(),
      }),
    )
    .default([]),
  interests: z.array(localized).default([]),
});

export type Profile = z.infer<typeof profileSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Certification = z.infer<typeof certificationSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type SkillCategory = z.infer<typeof skillCategorySchema>;

/* ------------------------------------------------------------------ */
/* Proyectos                                                           */
/* ------------------------------------------------------------------ */

/** Overrides opcionales por repo, en `content/projects.yaml`. */
export const projectOverrideSchema = z.object({
  slug: z.string(),
  title: localized.optional(),
  summary: localized.optional(),
  /** Bullets de "qué resolvía y cómo", el equivalente a logros. */
  highlights: z.array(localized).default([]),
  role: localized.optional(),
  teamSize: z.number().int().positive().optional(),
  status: z.enum(["activo", "estable", "pausado", "archivado"]).optional(),
  /** Fuerza el orden; menor aparece antes. Sin valor, ordena por actividad. */
  order: z.number().int().optional(),
  featured: z.boolean().optional(),
  hidden: z.boolean().default(false),
  images: z.array(z.string()).default([]),
  links: z.array(z.object({ label: z.string(), url: z.url() })).default([]),
  /** Etiquetas de stack extra que GitHub no puede detectar (Docker, Figma…). */
  stack: z.array(z.string()).default([]),
});

export type ProjectOverride = z.infer<typeof projectOverrideSchema>;

export const projectsFileSchema = z.object({
  projects: z.array(projectOverrideSchema).default([]),
});

/** Un proyecto ya curado y listo para publicarse. */
export interface Project {
  slug: string;
  name: string;
  title: { es: string; en: string };
  summary: { es: string; en: string };
  highlights: { es: string; en: string }[];
  visibility: "public" | "private";
  featured: boolean;
  /** `null` en privados: nunca exponemos la URL de un repo privado. */
  url: string | null;
  homepage: string | null;
  /** `null` en privados. */
  readme: string | null;
  topics: string[];
  languages: { name: string; bytes: number }[];
  stack: string[];
  stars: number;
  createdAt: string;
  pushedAt: string;
  role: { es: string; en: string } | null;
  teamSize: number | null;
  status: string | null;
  images: string[];
  links: { label: string; url: string }[];
  order: number | null;
}

/** Skill declarada más la evidencia encontrada en GitHub. */
export interface SkillWithEvidence extends Skill {
  repoCount: number;
  bytes: number;
  /** Slugs de proyectos publicables que usan esta skill. */
  projects: string[];
  lastUsed: string | null;
  /** true si no hay ningún repo publicado que la respalde. */
  unsupported: boolean;
}
