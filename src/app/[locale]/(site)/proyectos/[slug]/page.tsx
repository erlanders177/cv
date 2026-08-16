import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { RequestAccess } from "@/components/request-access";
import { getMessages, getProject, getProjects } from "@/lib/content";
import { formatIsoMonth } from "@/lib/format";
import { LOCALES, isLocale, pick, type Locale } from "@/lib/i18n";

export function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    getProjects().map((project) => ({ locale, slug: project.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = getProject(slug);
  if (!project || !isLocale(locale)) return {};
  return {
    title: pick(project.title, locale),
    description: pick(project.summary, locale),
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  const project = getProject(slug);
  if (!project) notFound();

  const t = getMessages(locale);
  const isPrivate = project.visibility === "private";

  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-10">
      <Link
        href={`/${locale}/proyectos`}
        className="text-sm text-text-muted transition-colors hover:text-accent"
      >
        ← {t.sections.projectsTitle}
      </Link>

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            {pick(project.title, locale)}
          </h1>
          <span
            className={`rounded px-2 py-0.5 text-xs font-medium ${
              isPrivate ? "bg-accent-soft text-accent" : "bg-surface-alt text-text-subtle"
            }`}
          >
            {isPrivate ? t.labels.private : t.labels.public}
          </span>
        </div>

        <p className="mt-3 text-lg leading-relaxed text-text-muted">
          {pick(project.summary, locale)}
        </p>
      </header>

      {project.highlights.length > 0 && (
        <ul className="mt-6 space-y-2">
          {project.highlights.map((highlight) => (
            <li
              key={pick(highlight, locale)}
              className="flex gap-2.5 text-[15px] leading-relaxed text-text-muted"
            >
              <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
              <span>{pick(highlight, locale)}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Ficha técnica */}
      <dl className="mt-8 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
        {project.languages.length > 0 && (
          <Fact
            label={t.labels.stack}
            value={project.languages.map((language) => language.name).join(", ")}
          />
        )}
        {project.stack.length > 0 && (
          <Fact label="Stack" value={project.stack.join(", ")} />
        )}
        {project.role && <Fact label={t.labels.role} value={pick(project.role, locale)} />}
        {project.teamSize && (
          <Fact label={t.labels.teamSize} value={String(project.teamSize)} />
        )}
        {project.status && <Fact label={t.labels.status} value={project.status} />}
        <Fact label={t.labels.created} value={formatIsoMonth(project.createdAt)} />
        <Fact label={t.labels.updated} value={formatIsoMonth(project.pushedAt)} />
      </dl>

      {/* Enlaces */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {project.url && (
          <a
            href={project.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {t.actions.viewCode}
          </a>
        )}
        {project.homepage && (
          <a
            href={project.homepage}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
          >
            {t.actions.viewDemo}
          </a>
        )}
        {project.links.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
          >
            {link.label}
          </a>
        ))}
        {isPrivate && <RequestAccess projectName={project.name} locale={locale} />}
      </div>

      {isPrivate && (
        <p className="mt-6 rounded-lg border border-border bg-surface-alt p-4 text-sm leading-relaxed text-text-muted">
          {t.labels.privateNotice}
        </p>
      )}

      {/* README: solo existe en repos públicos. */}
      {project.readme && (
        <div className="prose-cv mt-10 border-t border-border pt-8">
          <Markdown remarkPlugins={[remarkGfm]}>{project.readme}</Markdown>
        </div>
      )}
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface px-4 py-3">
      <dt className="text-xs uppercase tracking-wider text-text-subtle">{label}</dt>
      <dd className="mt-0.5 text-sm">{value}</dd>
    </div>
  );
}
