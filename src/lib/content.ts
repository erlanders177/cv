import { readFileSync } from "node:fs";
import { join } from "node:path";
import { load } from "js-yaml";

import { profileSchema, projectsFileSchema, type Profile, type Project } from "./types";

const CONTENT_DIR = join(process.cwd(), "content");
const DATA_DIR = join(process.cwd(), "data");

function readYaml(relativePath: string): unknown {
  return load(readFileSync(join(CONTENT_DIR, relativePath), "utf8"));
}

function readJsonIfPresent<T>(absolutePath: string, fallback: T): T {
  try {
    return JSON.parse(readFileSync(absolutePath, "utf8")) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw error;
  }
}

/**
 * El CV. Se valida contra el esquema para que un YAML mal escrito rompa el
 * build en lugar de publicarse a medias.
 */
export function getProfile(): Profile {
  const parsed = profileSchema.safeParse(readYaml("profile.yaml"));
  if (!parsed.success) {
    throw new Error(
      `content/profile.yaml no es válido:\n${z_prettify(parsed.error.issues)}`,
    );
  }
  return parsed.data;
}

export function getProjectOverrides() {
  const parsed = projectsFileSchema.safeParse(readYaml("projects.yaml"));
  if (!parsed.success) {
    throw new Error(
      `content/projects.yaml no es válido:\n${z_prettify(parsed.error.issues)}`,
    );
  }
  return parsed.data.projects;
}

/**
 * Proyectos ya curados por `scripts/sync-github.ts`. Si el archivo no existe
 * todavía (primer arranque, antes del primer sync) devolvemos una lista vacía
 * para que el sitio siga construyendo.
 */
export function getProjects(): Project[] {
  return readJsonIfPresent<Project[]>(join(DATA_DIR, "projects.generated.json"), []);
}

export function getFeaturedProjects(): Project[] {
  return getProjects().filter((project) => project.featured);
}

export function getProject(slug: string): Project | undefined {
  return getProjects().find((project) => project.slug === slug);
}

function z_prettify(issues: { path: PropertyKey[]; message: string }[]): string {
  return issues
    .map((issue) => `  · ${issue.path.join(".") || "(raíz)"}: ${issue.message}`)
    .join("\n");
}

/* Los textos de interfaz viven en `messages.ts` porque este módulo usa
   node:fs y no puede importarse desde componentes de cliente. */
export { getMessages, type Messages } from "./messages";
