"use client";

import { useMemo, useState } from "react";

import { ProjectCard } from "./project-card";
import { getMessages } from "@/lib/messages";
import type { Locale } from "@/lib/i18n";
import type { Project } from "@/lib/types";

/**
 * Catálogo con filtro por tecnología. Se filtra en el cliente sobre datos ya
 * cargados: son pocos proyectos y así el sitio sigue siendo estático.
 */
export function ProjectFilter({
  projects,
  locale,
}: {
  projects: Project[];
  locale: Locale;
}) {
  const t = getMessages(locale);
  const [active, setActive] = useState<string | null>(null);

  // Solo ofrecemos filtros que devuelvan algo: un filtro vacío frustra.
  const technologies = useMemo(() => {
    const counts = new Map<string, number>();
    for (const project of projects) {
      for (const language of project.languages) {
        counts.set(language.name, (counts.get(language.name) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name]) => name);
  }, [projects]);

  const visible = active
    ? projects.filter((project) =>
        project.languages.some((language) => language.name === active),
      )
    : projects;

  return (
    <>
      {technologies.length > 1 && (
        <div className="mt-8">
          <h2 className="sr-only">{t.labels.filterBy}</h2>
          <ul className="flex flex-wrap gap-2">
            {[null, ...technologies].map((technology) => {
              const isActive = active === technology;
              return (
                <li key={technology ?? "all"}>
                  <button
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActive(technology)}
                    className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                      isActive
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-border text-text-muted hover:border-accent hover:text-accent"
                    }`}
                  >
                    {technology ?? t.labels.filterAll}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {visible.map((project) => (
          <li key={project.slug} className="relative">
            <ProjectCard project={project} locale={locale} />
          </li>
        ))}
      </ul>
    </>
  );
}
