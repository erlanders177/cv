import type { Project, ProjectOverride } from "./types";

/**
 * Curación: el único punto del sistema que decide qué información de GitHub
 * se publica. Todo lo de aquí son funciones puras para poder probarlas sin
 * red, porque un fallo en este archivo significa filtrar un repo privado.
 *
 * Dos reglas gobiernan el módulo entero:
 *
 *  1. OPT-IN. Un repo solo existe para el sitio si lleva el topic `portfolio`.
 *     No hay lista de exclusión que se pueda olvidar de actualizar.
 *
 *  2. ALLOWLIST. De un repo privado se copian campos concretos y nombrados.
 *     Nunca la URL, la homepage ni el README, aunque la API los devuelva.
 */

export const PORTFOLIO_TOPIC = "portfolio";
export const FEATURED_TOPIC = "portfolio-featured";

/** Estos topics son instrucciones para el sitio, no información del proyecto. */
const CONTROL_TOPICS = new Set([PORTFOLIO_TOPIC, FEATURED_TOPIC]);

/** Repositorio tal y como llega de la API, ya con lenguajes y README. */
export interface RepoInput {
  name: string;
  description: string | null;
  private: boolean;
  fork: boolean;
  archived: boolean;
  html_url: string;
  homepage: string | null;
  topics: string[];
  stargazers_count: number;
  created_at: string;
  pushed_at: string;
  languages: Record<string, number>;
  readme: string | null;
}

export class CurationError extends Error {}

/** ¿Ha marcado el autor este repo para que aparezca? */
export function isOptedIn(repo: Pick<RepoInput, "topics">): boolean {
  return repo.topics.includes(PORTFOLIO_TOPIC);
}

function isFeatured(repo: Pick<RepoInput, "topics">): boolean {
  return repo.topics.includes(FEATURED_TOPIC);
}

function visibleTopics(topics: string[]): string[] {
  return topics.filter((topic) => !CONTROL_TOPICS.has(topic));
}

/** Identificador de un proyecto en las URLs y en `projects.yaml`. */
export function slugOf(repoName: string): string {
  return repoName.trim().toLowerCase();
}

function sortedLanguages(languages: Record<string, number>) {
  return Object.entries(languages)
    .map(([name, bytes]) => ({ name, bytes }))
    .sort((a, b) => b.bytes - a.bytes);
}

/**
 * Convierte un repo en un proyecto publicable.
 *
 * Para los privados exigimos que exista un override con título y resumen: si
 * falta, preferimos romper el sync antes que publicar la descripción cruda de
 * un repo privado, que puede contener cualquier cosa.
 */
export function curateRepo(repo: RepoInput, override?: ProjectOverride): Project {
  const isPrivate = repo.private;

  if (isPrivate && (!override?.title || !override?.summary)) {
    throw new CurationError(
      `El repo privado "${repo.name}" lleva el topic "${PORTFOLIO_TOPIC}" pero no ` +
        `tiene título ni resumen en content/projects.yaml. Añádelos antes de ` +
        `publicarlo: de un repo privado no tomamos el texto de GitHub.`,
    );
  }

  const fallbackText = repo.description ?? "";

  return {
    // En minúsculas porque las rutas distinguen mayúsculas en producción:
    // así "/proyectos/axioma" funciona aunque el repo se llame "Axioma".
    slug: slugOf(repo.name),
    name: repo.name,
    title: override?.title ?? { es: repo.name, en: repo.name },
    summary: override?.summary ?? { es: fallbackText, en: fallbackText },
    highlights: override?.highlights ?? [],
    visibility: isPrivate ? "private" : "public",
    featured: override?.featured ?? isFeatured(repo),

    // Los tres campos que jamás pueden salir de un repo privado.
    url: isPrivate ? null : repo.html_url,
    homepage: isPrivate ? null : (repo.homepage || null),
    readme: isPrivate ? null : repo.readme,

    topics: visibleTopics(repo.topics),
    languages: sortedLanguages(repo.languages),
    stack: override?.stack ?? [],
    stars: repo.stargazers_count,
    createdAt: repo.created_at,
    pushedAt: repo.pushed_at,
    role: override?.role ?? null,
    teamSize: override?.teamSize ?? null,
    status: override?.status ?? null,
    images: override?.images ?? [],
    links: override?.links ?? [],
    order: override?.order ?? null,
  };
}

/**
 * Filtra, cura y ordena. Los destacados van primero; dentro de cada grupo
 * manda el `order` manual y, sin él, la actividad más reciente.
 */
export function curateAll(
  repos: RepoInput[],
  overrides: ProjectOverride[],
): Project[] {
  // Indexado en minúsculas para que en projects.yaml dé igual escribir
  // "Axioma" o "axioma".
  const bySlug = new Map(
    overrides.map((override) => [slugOf(override.slug), override]),
  );

  return repos
    .filter(isOptedIn)
    .filter((repo) => !bySlug.get(slugOf(repo.name))?.hidden)
    .map((repo) => curateRepo(repo, bySlug.get(slugOf(repo.name))))
    .sort(compareProjects);
}

function compareProjects(a: Project, b: Project): number {
  if (a.featured !== b.featured) return a.featured ? -1 : 1;

  if (a.order !== null || b.order !== null) {
    if (a.order === null) return 1;
    if (b.order === null) return -1;
    if (a.order !== b.order) return a.order - b.order;
  }

  return b.pushedAt.localeCompare(a.pushedAt);
}
