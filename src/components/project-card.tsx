import Link from "next/link";

import { getMessages } from "@/lib/messages";
import { formatIsoMonth } from "@/lib/format";
import { pick, type Locale } from "@/lib/i18n";
import type { Project } from "@/lib/types";

export function ProjectCard({
  project,
  locale,
}: {
  project: Project;
  locale: Locale;
}) {
  const t = getMessages(locale);
  const isPrivate = project.visibility === "private";
  const languages = project.languages.slice(0, 3).map((language) => language.name);

  return (
    <article
      data-print="keep"
      /* `relative` es obligatorio: el enlace del título se expande con
         after:inset-0 para hacer clicable toda la tarjeta, y sin un ancestro
         posicionado ese overlay se estira hasta cubrir la página entera. */
      className="relative flex h-full flex-col rounded-lg border border-border bg-surface p-4 transition-colors hover:border-accent"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-snug">
          <Link
            href={`/${locale}/proyectos/${project.slug}`}
            className="after:absolute after:inset-0 hover:text-accent"
          >
            {pick(project.title, locale)}
          </Link>
        </h3>
        <span
          className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium ${
            isPrivate
              ? "bg-accent-soft text-accent"
              : "bg-surface-alt text-text-subtle"
          }`}
        >
          {isPrivate ? t.labels.private : t.labels.public}
        </span>
      </div>

      <p className="mt-2 flex-1 text-sm leading-relaxed text-text-muted">
        {pick(project.summary, locale)}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-text-subtle">
        {languages.length > 0 && <span>{languages.join(" · ")}</span>}
        {project.stars > 0 && <span>★ {project.stars}</span>}
        <span className="ml-auto">
          {t.labels.updated} {formatIsoMonth(project.pushedAt)}
        </span>
      </div>
    </article>
  );
}
