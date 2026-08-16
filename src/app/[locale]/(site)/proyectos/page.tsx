import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectFilter } from "@/components/project-filter";
import { getMessages, getProjects } from "@/lib/content";
import { LOCALES, isLocale, type Locale } from "@/lib/i18n";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getMessages(locale).meta.projectsTitle };
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  const t = getMessages(locale);
  const projects = getProjects();

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-10">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t.sections.projectsTitle}
        </h1>
        <Link
          href={`/${locale}`}
          className="text-sm text-text-muted transition-colors hover:text-accent"
        >
          ← {t.nav.backToCv}
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="mt-10 text-text-muted">{t.labels.noProjects}</p>
      ) : (
        <ProjectFilter projects={projects} locale={locale} />
      )}
    </div>
  );
}
