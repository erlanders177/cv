import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CopyEmail } from "@/components/copy-email";
import { PersonJsonLd } from "@/components/person-jsonld";
import { ProjectCard } from "@/components/project-card";
import { Section } from "@/components/section";
import {
  getFeaturedProjects,
  getMessages,
  getProfile,
  getProjects,
} from "@/lib/content";
import { attachEvidence } from "@/lib/skills";
import { ageFrom, formatDuration, formatPeriod, monthsBetween } from "@/lib/format";
import { isLocale, pick, type Locale } from "@/lib/i18n";

export default async function CvPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  const profile = getProfile();
  const t = getMessages(locale);
  const featured = getFeaturedProjects();
  const skills = attachEvidence(profile.skills, getProjects());
  const { contact } = profile;

  return (
    <div className="mx-auto w-full max-w-4xl px-5">
      <PersonJsonLd locale={locale} />

      {/* ---------------- Cabecera ---------------- */}
      <header className="pt-10 pb-2" data-print="keep">
        {/* El estado sale de `status` en profile.yaml: una línea y cambia. */}
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-text-muted">
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 rounded-full ${
              profile.status === "no-disponible" ? "bg-text-subtle" : "bg-accent"
            }`}
          />
          {t.status[profile.status]}
        </p>

        <div className="flex flex-wrap items-start gap-6">
          {/* next/image sirve una versión de 96 px en vez del original de
              1,2 MB. Si algún día se exporta a estático, hará falta
              `images: { unoptimized: true }` en next.config. */}
          {profile.photo && (
            <Image
              src={profile.photo}
              alt={profile.name}
              width={96}
              height={96}
              priority
              className="h-24 w-24 shrink-0 rounded-full border border-border object-cover"
            />
          )}
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {profile.name}
            </h1>
            <p className="mt-2 text-lg text-text-muted">
              {pick(profile.headline, locale)}
            </p>
          </div>
        </div>

        <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-text-muted">
          <li>
            <a href={`mailto:${contact.email}`} className="hover:text-accent">
              {contact.email}
            </a>
          </li>
          <li>{pick(contact.location, locale)}</li>
          {profile.birthDate && (
            <li>
              {ageFrom(profile.birthDate)} {t.labels.yearsOld}
            </li>
          )}
          <li>
            <a
              href={`https://github.com/${contact.github}`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-accent"
            >
              github.com/{contact.github}
            </a>
          </li>
          {contact.linkedin && (
            <li>
              <a
                href={contact.linkedin}
                target="_blank"
                rel="noreferrer"
                className="hover:text-accent"
              >
                LinkedIn
              </a>
            </li>
          )}
          {contact.website && (
            <li>
              <a
                href={contact.website}
                target="_blank"
                rel="noreferrer"
                className="hover:text-accent"
              >
                {contact.website.replace(/^https?:\/\//, "")}
              </a>
            </li>
          )}
        </ul>

        {(contact.availability || contact.relocation) && (
          <p className="mt-3 text-sm text-text-subtle">
            {[pick(contact.availability, locale), pick(contact.relocation, locale)]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3" data-print="hide">
          <a
            href={`/cv-${locale}.pdf`}
            download
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {t.actions.downloadPdf}
          </a>
          {/* Lleva a la sección de contacto en vez de abrir un mailto: si el
              visitante no tiene cliente de correo, un mailto no hace nada. */}
          <a
            href="#contact"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:border-accent hover:text-accent"
          >
            {t.statusCta[profile.status]}
          </a>
          <Link
            href={`/${locale}/proyectos`}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:border-accent hover:text-accent"
          >
            {t.nav.allProjects}
          </Link>
        </div>
      </header>

      {profile.highlights.length > 0 && (
        <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
          {profile.highlights.map((item) => (
            <div key={item.value + pick(item.label, locale)} className="bg-surface p-4">
              <dt className="text-xs uppercase tracking-wider text-text-subtle">
                {pick(item.label, locale)}
              </dt>
              <dd className="mt-1 text-lg font-semibold">{item.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* ---------------- Resumen ---------------- */}
      <Section id="summary" title={t.sections.summaryTitle}>
        <p className="max-w-2xl text-[15px] leading-relaxed text-text-muted">
          {pick(profile.summary, locale)}
        </p>
      </Section>

      {/* ---------------- Experiencia ---------------- */}
      {profile.experience.length > 0 && (
        <Section id="experience" title={t.sections.experienceTitle}>
          <ol className="space-y-8">
            {profile.experience.map((job) => (
              <li key={job.id} data-print="keep">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="text-base font-semibold">
                    {pick(job.role, locale)}
                    <span className="font-normal text-text-muted"> · </span>
                    {job.companyUrl ? (
                      <a
                        href={job.companyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-normal hover:text-accent"
                      >
                        {job.company}
                      </a>
                    ) : (
                      <span className="font-normal">{job.company}</span>
                    )}
                  </h3>
                  <p className="font-mono text-xs text-text-subtle">
                    {formatPeriod(job.start, job.end, t.labels.present)}
                    <span className="mx-1.5">·</span>
                    {formatDuration(monthsBetween(job.start, job.end), locale)}
                  </p>
                </div>

                {/* El tipo va explícito: sin empleo remunerado todavía, no
                    queremos que un voluntariado se lea como un contrato. */}
                <p className="mt-0.5 text-sm text-text-subtle">
                  {[t.labels.kind[job.kind], pick(job.location, locale), job.mode]
                    .filter(Boolean)
                    .join(" · ")}
                </p>

                {job.summary && (
                  <p className="mt-2 text-sm leading-relaxed text-text-muted">
                    {pick(job.summary, locale)}
                  </p>
                )}

                {job.achievements.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {job.achievements.map((achievement) => (
                      <li
                        key={pick(achievement, locale)}
                        className="flex gap-2.5 text-sm leading-relaxed text-text-muted"
                      >
                        <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                        <span>{pick(achievement, locale)}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {job.stack.length > 0 && (
                  <p className="mt-3 font-mono text-xs text-text-subtle">
                    {job.stack.join(" · ")}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* ---------------- Habilidades ----------------
          Cada una llega con la evidencia de los repos que la usan: el número
          pequeño es cuántos proyectos publicados la respaldan. */}
      {skills.length > 0 && (
        <Section id="skills" title={t.sections.skillsTitle}>
          <div className="space-y-5">
            {skills.map((category) => (
              <div
                key={category.id}
                data-print="keep"
                className="grid gap-2 sm:grid-cols-[10rem_1fr] sm:gap-6"
              >
                <h3 className="text-sm font-medium text-text-subtle">
                  {pick(category.label, locale)}
                </h3>
                <ul className="flex flex-wrap gap-x-2 gap-y-2">
                  {category.items.map((skill) => (
                    <li
                      key={skill.name}
                      title={
                        skill.repoCount > 0
                          ? `${skill.projects.join(", ")}`
                          : undefined
                      }
                      className="flex items-center gap-1.5 rounded border border-border bg-surface px-2.5 py-1 text-sm"
                    >
                      <span>{skill.name}</span>
                      {skill.level && (
                        <span className="text-xs text-text-subtle">
                          {t.levels[skill.level]}
                        </span>
                      )}
                      {skill.repoCount > 0 && (
                        <span
                          className="rounded-sm bg-accent-soft px-1 font-mono text-[10px] text-accent"
                          aria-label={`${skill.repoCount} ${
                            skill.repoCount === 1 ? t.labels.repo : t.labels.repos
                          }`}
                        >
                          {skill.repoCount}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ---------------- Proyectos destacados ---------------- */}
      {featured.length > 0 && (
        <Section
          id="projects"
          title={t.sections.featuredTitle}
          action={
            <Link
              href={`/${locale}/proyectos`}
              data-print="hide"
              className="text-sm text-text-muted transition-colors hover:text-accent"
            >
              {t.nav.allProjects} →
            </Link>
          }
        >
          <ul className="grid gap-4 sm:grid-cols-2">
            {featured.map((project) => (
              <li key={project.slug}>
                <ProjectCard project={project} locale={locale} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ---------------- Formación ---------------- */}
      {profile.education.length > 0 && (
        <Section id="education" title={t.sections.educationTitle}>
          <ol className="space-y-5">
            {profile.education.map((item) => (
              <li key={item.id} data-print="keep">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="text-base font-medium">
                    {pick(item.degree, locale)}
                    <span className="font-normal text-text-muted">
                      {" "}
                      · {item.institution}
                    </span>
                  </h3>
                  <p className="font-mono text-xs text-text-subtle">
                    {formatPeriod(item.start, item.end, t.labels.present)}
                  </p>
                </div>
                {item.notes && (
                  <p className="mt-1 text-sm text-text-muted">
                    {pick(item.notes, locale)}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* ---------------- Certificaciones ---------------- */}
      {profile.certifications.length > 0 && (
        <Section id="certifications" title={t.sections.certificationsTitle}>
          <ul className="space-y-2">
            {profile.certifications.map((cert) => (
              <li
                key={cert.name}
                className="flex flex-wrap items-baseline justify-between gap-x-4 text-sm"
              >
                <span>
                  {cert.url ? (
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium hover:text-accent"
                    >
                      {cert.name}
                    </a>
                  ) : (
                    <span className="font-medium">{cert.name}</span>
                  )}
                  <span className="text-text-muted"> · {cert.issuer}</span>
                </span>
                <span className="font-mono text-xs text-text-subtle">
                  {cert.date.split("-").reverse().join("/")}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ---------------- Idiomas ---------------- */}
      {profile.spokenLanguages.length > 0 && (
        <Section id="languages" title={t.sections.languagesTitle}>
          <ul className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            {profile.spokenLanguages.map((language) => (
              <li key={pick(language.name, locale)}>
                <span className="font-medium">{pick(language.name, locale)}</span>
                <span className="text-text-muted"> · {pick(language.level, locale)}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ---------------- Reconocimientos ---------------- */}
      {profile.awards.length > 0 && (
        <Section id="awards" title={t.sections.awardsTitle}>
          <ul className="space-y-2">
            {profile.awards.map((award) => (
              <li
                key={pick(award.title, locale)}
                className="flex flex-wrap items-baseline justify-between gap-x-4 text-sm"
              >
                <span>
                  <span className="font-medium">{pick(award.title, locale)}</span>
                  <span className="text-text-muted"> · {award.issuer}</span>
                </span>
                <span className="font-mono text-xs text-text-subtle">
                  {award.date.split("-").reverse().join("/")}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ---------------- Intereses ---------------- */}
      {profile.interests.length > 0 && (
        <Section id="interests" title={t.sections.interestsTitle}>
          <p className="text-sm text-text-muted">
            {profile.interests.map((interest) => pick(interest, locale)).join(" · ")}
          </p>
        </Section>
      )}

      {/* ---------------- Contacto ---------------- */}
      <Section id="contact" title={t.sections.contactTitle}>
        <p className="text-[15px] text-text-muted">{t.status[profile.status]}.</p>

        <div className="mt-4 text-[15px]">
          <CopyEmail
            email={contact.email}
            copyLabel={t.actions.copyEmail}
            copiedLabel={t.actions.emailCopied}
          />
        </div>

        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-text-muted">
          {contact.linkedin && (
            <li>
              <a
                href={contact.linkedin}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 hover:text-accent"
              >
                LinkedIn
              </a>
            </li>
          )}
          <li>
            <a
              href={`https://github.com/${contact.github}`}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-accent"
            >
              GitHub
            </a>
          </li>
          {contact.otherLinks.map((link) => (
            <li key={link.url}>
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 hover:text-accent"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
