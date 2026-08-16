import type { Project, SkillCategory, SkillWithEvidence } from "./types";

/**
 * Cruza las habilidades declaradas con los proyectos publicados.
 *
 * La idea que sostiene el sitio entero: una skill en un CV es una afirmación
 * sin más; aquí cada una llega acompañada de los repos que la usan, cuántos
 * son y cuándo fue la última vez. Lo que no tiene respaldo se marca como tal
 * para que el autor lo sepa, no para esconderlo.
 */

function normalise(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

/** Todos los nombres bajo los que GitHub podría reportar esta skill. */
function keysFor(skill: { name: string; aliases: string[] }): Set<string> {
  return new Set([skill.name, ...skill.aliases].map(normalise));
}

/** Lenguajes, topics y stack manual de un proyecto, ya normalizados. */
function signalsOf(project: Project): Map<string, number> {
  const signals = new Map<string, number>();

  for (const language of project.languages) {
    signals.set(normalise(language.name), language.bytes);
  }
  for (const topic of [...project.topics, ...project.stack]) {
    const key = normalise(topic);
    if (!signals.has(key)) signals.set(key, 0);
  }

  return signals;
}

export function attachEvidence(
  categories: SkillCategory[],
  projects: Project[],
): { id: string; label: SkillCategory["label"]; items: SkillWithEvidence[] }[] {
  const indexed = projects.map((project) => ({
    project,
    signals: signalsOf(project),
  }));

  return categories.map((category) => ({
    id: category.id,
    label: category.label,
    items: category.items.map((skill) => {
      const keys = keysFor(skill);
      const matches = indexed.filter(({ signals }) =>
        [...keys].some((key) => signals.has(key)),
      );

      const bytes = matches.reduce(
        (total, { signals }) =>
          total +
          [...keys].reduce((sum, key) => sum + (signals.get(key) ?? 0), 0),
        0,
      );

      const lastUsed = matches
        .map(({ project }) => project.pushedAt)
        .sort()
        .at(-1);

      return {
        ...skill,
        repoCount: matches.length,
        bytes,
        projects: matches.map(({ project }) => project.slug),
        lastUsed: lastUsed ?? null,
        unsupported: matches.length === 0,
      };
    }),
  }));
}
